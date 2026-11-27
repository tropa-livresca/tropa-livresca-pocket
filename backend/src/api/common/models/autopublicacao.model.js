import { LIVRO_ESTADO } from "../config/livro-estados.js";
import {
  criarClienteModel,
  getListPocketBase,
  marcarErro,
  mapearCampoArquivo,
  primeiraUrlArquivo,
} from "./pocketbase.helpers.js";

const COLECAO = "livros";
const COLECAO_REVISAO = "revisoes";

const RELACAO_LIVRO = "fk_livro_id";
const RELACAO_PERFIL = "fk_user_profile_id";

const CAMPO_ARQUIVO = "arquivo";

const EXPAND_LIVRO = `${RELACAO_LIVRO},${RELACAO_LIVRO}.${RELACAO_PERFIL}`;

function erroConflito() {
  const error = new Error("Livro não encontrado ou estado desatualizado.");

  error.statusCode = 409;
  return error;
}

function mapearRevisao(pb, revisao) {
  const { expand, ...dados } = revisao;
  const arquivo = mapearCampoArquivo(pb, revisao, CAMPO_ARQUIVO);

  return {
    ...dados,
    ...arquivo,
    livros: formatarLivro(pb, expand?.[RELACAO_LIVRO]),
  };
}

async function incluirRevisaoId(pb, livros) {
  if (!livros.length) return [];

  const params = {};

  const filtros = livros.map((livro, index) => {
    const chave = `livro${index}`;

    params[chave] = livro.id;

    return `${RELACAO_LIVRO} = {:${chave}}`;
  });

  const revisoes = await pb.collection(COLECAO_REVISAO).getFullList({
    filter: pb.filter(filtros.join(" || "), params),
    sort: "-data_criacao",
    fields: `id,${RELACAO_LIVRO}`,
  });

  const revisoesPorLivro = new Map();

  for (const revisao of revisoes) {
    if (!revisoesPorLivro.has(revisao[RELACAO_LIVRO])) {
      revisoesPorLivro.set(revisao[RELACAO_LIVRO], revisao.id);
    }
  }

  return livros.map((livro) => ({
    ...formatarLivro(pb, livro),
    revisaoId: revisoesPorLivro.get(livro.id) ?? null,
  }));
}

function formatarLivro(pb, livro) {
  if (!livro) return livro;

  const arquivos = {
    ...mapearCampoArquivo(pb, livro, "manuscrito"),
    ...mapearCampoArquivo(pb, livro, "capa_frente"),
    ...mapearCampoArquivo(pb, livro, "capa_verso"),
  };

  return {
    ...livro,
    ...arquivos,
    capa: {
      frente: primeiraUrlArquivo(arquivos.capa_frenteUrl),
      verso: primeiraUrlArquivo(arquivos.capa_versoUrl),
    },
  };
}

async function resultadoPaginado(pb, result) {
  return {
    data: await incluirRevisaoId(pb, result.items),
    count: result.totalItems,
  };
}

export class AutopublicacaoModel {
  static async buscarComFiltros({
    userId,
    page = 1,
    limit = 12,
    busca = "",
    filtro = "",
    ordem = "",
    estado = "",
  } = {}) {
    const pb = await criarClienteModel();

    const filtros = ["ativo = true", `${RELACAO_PERFIL} = {:userId}`];

    const params = { userId };

    if (busca) {
      filtros.push("titulo ~ {:busca}");
      params.busca = busca;
    }

    if (Object.values(LIVRO_ESTADO).includes(estado)) {
      filtros.push("estado = {:estado}");
      params.estado = estado;
    }

    const campoOrdenacao = filtro === "data" ? "data_de_publicacao" : "titulo";

    const ascending =
      filtro === "data" ? ordem === "ascendente" : ordem !== "descendente";

    try {
      const result = await getListPocketBase(pb.collection(COLECAO), {
        page,
        limit,
        filter: pb.filter(filtros.join(" && "), params),
        sort: ascending ? campoOrdenacao : `-${campoOrdenacao}`,
      });

      return resultadoPaginado(pb, result);
    } catch (error) {
      marcarErro(error);
    }
  }

  static async buscarRevisaoByLivroId(livroId) {
    if (!livroId) return { data: [] };

    const pb = await criarClienteModel();

    try {
      const data = await pb.collection(COLECAO_REVISAO).getFullList({
        filter: pb.filter(`${RELACAO_LIVRO} = {:livroId}`, {
          livroId,
        }),
        sort: "-data_criacao",
        expand: EXPAND_LIVRO,
      });

      return {
        data: data.map((revisao) => mapearRevisao(pb, revisao)),
      };
    } catch (error) {
      marcarErro(error);
    }
  }

  static async buscarDetalhesPorId(idLivro, userId) {
    const pb = await criarClienteModel();

    try {
      const livro = await pb.collection(COLECAO).getOne(idLivro);

      if (livro[RELACAO_PERFIL] !== userId || !livro.ativo) {
        return null;
      }

      return (await incluirRevisaoId(pb, [livro]))[0];
    } catch (error) {
      if (error.status === 404) return null;

      marcarErro(error);
    }
  }

  static async atualizarEstado(id, novoEstado, userId, estadoAtual) {
    const pb = await criarClienteModel();

    const livro = await this.buscarDetalhesPorId(id, userId);

    if (!livro || (estadoAtual && livro.estado !== estadoAtual)) {
      throw erroConflito();
    }

    try {
      const atualizado = await pb.collection(COLECAO).update(id, {
        estado: novoEstado,
      });

      return formatarLivro(pb, atualizado);
    } catch (error) {
      marcarErro(error);
    }
  }

  static async criarLivro(dadosLivro) {
    const pb = await criarClienteModel();

    if (!(dadosLivro instanceof FormData)) {
      const error = new Error(
        "Os dados do livro devem ser enviados no formato FormData.",
      );

      error.statusCode = 400;
      throw error;
    }

    try {
      const livro = await pb.collection(COLECAO).create(dadosLivro);

      return formatarLivro(pb, livro);
    } catch (error) {
      console.error("\n========== ERRO POCKETBASE ==========");
      console.error("Status:", error.status);
      console.error("Mensagem:", error.response?.message);
      console.error(
        "Detalhes dos campos:",
        JSON.stringify(error.response?.data, null, 2),
      );
      console.error("====================================\n");

      marcarErro(error);
    }
  }

  static async atualizarLivro(id, userId, estadoAtual, dadosAtualizados) {
    const pb = await criarClienteModel();

    const livro = await this.buscarDetalhesPorId(id, userId);

    if (!livro || livro.estado !== estadoAtual) {
      throw erroConflito();
    }

    try {
      const atualizado = await pb
        .collection(COLECAO)
        .update(id, dadosAtualizados);

      return formatarLivro(pb, atualizado);
    } catch (error) {
      marcarErro(error);
    }
  }

  static async deletarLivro(idLivro, userId) {
    const pb = await criarClienteModel();

    const livro = await this.buscarDetalhesPorId(idLivro, userId);

    if (!livro) {
      const error = new Error("Livro não encontrado.");

      error.statusCode = 404;
      throw error;
    }

    if (livro.estado !== LIVRO_ESTADO.RASCUNHO) {
      const error = new Error(
        "Livros em rascunho podem ser deletados. Livros em revisão ou publicados não podem ser deletados.",
      );

      error.statusCode = 400;
      throw error;
    }

    try {
      await pb.collection(COLECAO).delete(idLivro);

      return livro;
    } catch (error) {
      marcarErro(error);
    }
  }
}
