import nodemailer from "nodemailer";
import { LIVRO_ESTADO } from "../config/livro-estados.js";
import {
  criarClienteModel,
  getListPocketBase,
  marcarErro,
  mapearExpansao,
  mapearCampoArquivo,
  primeiraUrlArquivo,
} from "./pocketbase.helpers.js";

const COLECAO_LIVROS = "livros";
const COLECAO_PERFIL = "users_profile";
const COLECAO_VENDAS = "vendas";
const COLECAO_ITENS = "itens_venda";
const COLECAO_MOVIMENTACOES = "movimentacoes_financeiras";
const RELACAO_PERFIL = "fk_user_profile_id";
const RELACAO_VENDA = "fk_vendas_id";
const RELACAO_LIVRO_ITEM = "fk_livros_itens_id";

const COLUNAS_LIVRO = [
  "id",
  "collectionId",
  "collectionName",
  "data_de_publicacao",
  "preco_digital",
  "preco_fisico",
  "idioma",
  "titulo",
  "subtitulo",
  "descricao",
  "capa_frente",
  "capa_verso",
  "ISBN",
  "direitos_de_publicacao",
].join(",");

function calcularPeriodo(periodo) {
  const agora = new Date();
  const fim = new Date(agora);
  let inicio = new Date(agora);

  switch (periodo) {
    case "7d":
      inicio.setDate(inicio.getDate() - 7);
      break;
    case "30d":
      inicio.setDate(inicio.getDate() - 30);
      break;
    case "90d":
      inicio.setDate(inicio.getDate() - 90);
      break;
    case "mes":
      inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
      break;
    case "ano":
      inicio = new Date(agora.getFullYear(), 0, 1);
      break;
    default:
      throw new Error(`Período inválido: ${periodo}`);
  }

  return { inicio: inicio.toISOString(), fim: fim.toISOString() };
}

function filtrarIds(pb, campo, ids) {
  const partes = ids.map((_, index) => `${campo} = {:id${index}}`);
  const params = Object.fromEntries(ids.map((id, index) => [`id${index}`, id]));
  return pb.filter(partes.join(" || "), params);
}

function formatarLivro(pb, livro) {
  if (!livro) return livro;

  const arquivos = {
    ...mapearCampoArquivo(pb, livro, "manuscrito"),
    ...mapearCampoArquivo(pb, livro, "capa_frente"),
    ...mapearCampoArquivo(pb, livro, "capa_verso"),
  };

  const perfilExpandido = livro.expand?.[RELACAO_PERFIL] || null;
  const imagem = perfilExpandido
    ? mapearCampoArquivo(pb, perfilExpandido, "imagem")
    : null;

  return {
    ...livro,
    ...arquivos,
    users_profile: perfilExpandido
      ? {
          ...perfilExpandido,
          ...imagem,
          imagem: primeiraUrlArquivo(imagem.imagemUrl),
        }
      : null,
    capa: {
      frente: primeiraUrlArquivo(arquivos.capa_frenteUrl),
      verso: primeiraUrlArquivo(arquivos.capa_versoUrl),
    },
  };
}

function mapearItemVenda(pb, item) {
  const itemMapeado = mapearExpansao(item, RELACAO_LIVRO_ITEM, "livros");

  return {
    ...itemMapeado,
    livros: formatarLivro(pb, itemMapeado.livros),
  };
}

function mapearVenda(pb, venda) {
  const dados = mapearExpansao(venda, RELACAO_PERFIL, "users_profile");
  const perfil = dados.users_profile;
  const imagem = perfil ? mapearCampoArquivo(pb, perfil, "imagem") : null;

  return {
    ...dados,
    users_profile: perfil
      ? {
          ...perfil,
          ...imagem,
          imagem: primeiraUrlArquivo(imagem.imagemUrl),
        }
      : null,
  };
}

async function buscarItensVenda(
  pb,
  vendaIds,
  { expandLivros = false, requestKey } = {},
) {
  if (!vendaIds.length) return [];

  return pb.collection(COLECAO_ITENS).getFullList({
    filter: filtrarIds(pb, RELACAO_VENDA, vendaIds),
    expand: expandLivros
      ? `${RELACAO_LIVRO_ITEM},${RELACAO_LIVRO_ITEM}.${RELACAO_PERFIL}`
      : "",
    ...(requestKey !== undefined && { requestKey }),
  });
}

async function buscarVendasPorId(pb, vendaIds, filtroAdicional = "") {
  if (!vendaIds.length) return [];

  return pb.collection(COLECAO_VENDAS).getFullList({
    filter: filtroAdicional
      ? `(${filtrarIds(pb, "id", vendaIds)}) && (${filtroAdicional})`
      : filtrarIds(pb, "id", vendaIds),
  });
}

export class LojaModel {
  static async buscarComFiltros({
    page = 1,
    limit = 12,
    busca = "",
    filtro = "",
    ordem = "",
    categoria = "",
    idioma = "",
  }) {
    const pb = await criarClienteModel();
    const filtros = ["ativo = true", "estado = {:estado}"];
    const params = { estado: LIVRO_ESTADO.PUBLICADO };

    if (busca) {
      filtros.push("titulo ~ {:busca}");
      params.busca = busca;
    }

    if (categoria) {
      filtros.push("categoria ~ {:categoria}");
      params.categoria = categoria;
    }

    if (idioma) {
      filtros.push("idioma ~ {:idioma}");
      params.idioma = idioma;
    }

    const campo = filtro === "data" ? "data_de_publicacao" : "titulo";
    const ascending =
      filtro === "data" ? ordem === "ascendente" : ordem !== "descendente";

    try {
      const resultado = await getListPocketBase(pb.collection(COLECAO_LIVROS), {
        page,
        limit,
        filter: pb.filter(filtros.join(" && "), params),
        sort: ascending ? campo : `-${campo}`,
        expand: RELACAO_PERFIL,
        fields: [
          COLUNAS_LIVRO,
          `expand.${RELACAO_PERFIL}.id`,
          `expand.${RELACAO_PERFIL}.collectionId`,
          `expand.${RELACAO_PERFIL}.collectionName`,
          `expand.${RELACAO_PERFIL}.nome`,
          `expand.${RELACAO_PERFIL}.sobrenome`,
          `expand.${RELACAO_PERFIL}.imagem`,
        ].join(","),
      });

      return {
        data: resultado.items.map((livro) => formatarLivro(pb, livro)),
        count: resultado.totalItems,
      };
    } catch (error) {
      marcarErro(error);
    }
  }

  static async baixarLivroDigital(livroId, usuarioId) {
    const pb = await criarClienteModel();

    try {
      const vendas = await pb.collection(COLECAO_VENDAS).getFullList({
        filter: pb.filter(
          `${RELACAO_PERFIL} = {:usuarioId} && status_pagamento = 'Pago'`,
          { usuarioId },
        ),
        fields: "id",
      });

      if (!vendas.length) {
        const error = new Error("Livro não encontrado na sua biblioteca.");
        error.statusCode = 404;
        throw error;
      }

      const itens = await buscarItensVenda(
        pb,
        vendas.map((venda) => venda.id),
        { expandLivros: true },
      );

      const item = itens.find(
        (registro) =>
          registro[RELACAO_LIVRO_ITEM] === String(livroId) &&
          registro.fisico === false,
      );

      if (!item) {
        const error = new Error(
          "Este livro digital não foi encontrado na sua biblioteca.",
        );
        error.statusCode = 404;
        throw error;
      }

      const livro = item.expand?.[RELACAO_LIVRO_ITEM];

      if (!livro) {
        const error = new Error("Livro não encontrado.");
        error.statusCode = 404;
        throw error;
      }

      const nomesArquivos = Array.isArray(livro.manuscrito)
        ? livro.manuscrito
        : [livro.manuscrito];

      const arquivos = nomesArquivos
        .filter((nome) => typeof nome === "string" && nome.trim())
        .map((nome, index) => ({
          nome: nome.split("/").pop(),
          url: pb.files.getURL(livro, nome),
          numero: index + 1,
        }));

      if (!arquivos.length) {
        const error = new Error(
          "O arquivo digital deste livro não está disponível.",
        );
        error.statusCode = 404;
        throw error;
      }

      return {
        titulo: livro.titulo || "Livro digital",
        arquivos,
      };
    } catch (error) {
      if (error.statusCode) throw error;
      marcarErro(error);
    }
  }

  static async buscarLivroById(id) {
    const pb = await criarClienteModel();

    try {
      const livro = await pb.collection(COLECAO_LIVROS).getOne(id, {
        expand: RELACAO_PERFIL,
      });

      if (!livro.ativo || livro.estado !== LIVRO_ESTADO.PUBLICADO) {
        const error = new Error("Livro não encontrado.");
        error.statusCode = 404;
        throw error;
      }

      return formatarLivro(pb, livro);
    } catch (error) {
      marcarErro(error, 404);
    }
  }

  static async consultarVendas({
  page = 1,
  limit = 10,
  busca = "",
  statusPagamento = "",
  statusEntrega = "",
  dataInicio = "",
  dataFim = "",
  ordem = "recentes",
}) {
  const pb = await criarClienteModel();

  try {
    const filtros = [];
    const parametros = {};

    if (busca.trim()) {
      filtros.push("id ~ {:busca}");
      parametros.busca = busca.trim();
    }

    if (statusPagamento) {
      filtros.push("status_pagamento = {:statusPagamento}");
      parametros.statusPagamento = statusPagamento;
    }

    if (statusEntrega) {
      filtros.push("status_entrega = {:statusEntrega}");
      parametros.statusEntrega = statusEntrega;
    }

    if (dataInicio) {
      filtros.push("data >= {:dataInicio}");
      parametros.dataInicio = `${dataInicio} 00:00:00.000Z`;
    }

    if (dataFim) {
      filtros.push("data <= {:dataFim}");
      parametros.dataFim = `${dataFim} 23:59:59.999Z`;
    }

    const filtro =
      filtros.length > 0
        ? pb.filter(filtros.join(" && "), parametros)
        : "";

    const ordenacoes = {
      recentes: "-data",
      antigos: "data",
      maior_valor: "-total",
      menor_valor: "total",
    };

    const resultado = await getListPocketBase(
      pb.collection(COLECAO_VENDAS),
      {
        page,
        limit,
        sort: ordenacoes[ordem] || "-data",
        expand: RELACAO_PERFIL,
        ...(filtro && { filter: filtro }),
      },
    );

    const data = await Promise.all(
      resultado.items.map(async (record) => {
        const [itens, movimentacoes] = await Promise.all([
          buscarItensVenda(pb, [record.id], {
            expandLivros: true,
            requestKey: null,
          }),

          pb.collection(COLECAO_MOVIMENTACOES).getFullList({
            filter: pb.filter(`${RELACAO_VENDA} = {:id}`, {
              id: record.id,
            }),
            requestKey: null,
          }),
        ]);

        return {
          ...mapearVenda(pb, record),
          itens_venda: itens.map((item) => mapearItemVenda(pb, item)),
          movimentacoes_financeiras: movimentacoes,
        };
      }),
    );

    return {
      data,
      count: resultado.totalItems,
    };
  } catch (error) {
    marcarErro(error);
  }
}

  static async consultarVenda(vendaId) {
    const pb = await criarClienteModel();
    let venda;

    try {
      venda = await pb.collection(COLECAO_VENDAS).getOne(vendaId, {
        expand: RELACAO_PERFIL,
      });
    } catch (error) {
      if (error.status === 404) {
        const notFound = new Error("Venda não encontrada.");
        notFound.statusCode = 404;
        throw notFound;
      }

      marcarErro(error);
    }

    const itensVenda = await buscarItensVenda(pb, [vendaId], {
      expandLivros: true,
    });

    return {
      ...mapearVenda(pb, venda),
      itensVenda: itensVenda.map((item) => mapearItemVenda(pb, item)),
    };
  }

  static async buscarLivrosParaVenda(livroIds) {
    const ids = [...new Set(livroIds.map(String))];

    if (!ids.length) return [];

    const pb = await criarClienteModel();

    try {
      return await pb.collection(COLECAO_LIVROS).getFullList({
        filter: pb.filter(
          `(${ids.map((_, index) => `id = {:id${index}}`).join(" || ")}) && ativo = true && estado = {:estado}`,
          {
            ...Object.fromEntries(ids.map((id, index) => [`id${index}`, id])),
            estado: LIVRO_ESTADO.PUBLICADO,
          },
        ),
        fields: "id,titulo,preco_fisico,preco_digital",
      });
    } catch (error) {
      marcarErro(error);
    }
  }

  static async realizarVenda(dadosVenda, itensVenda) {
    const pb = await criarClienteModel();
    const dados = { ...dadosVenda };

    let venda;

    try {
      venda = await pb.collection(COLECAO_VENDAS).create(dados);
    } catch (error) {
      marcarErro(error);
    }

    const itensCriados = [];

    try {
      for (const item of itensVenda) {
        itensCriados.push(
          await pb.collection(COLECAO_ITENS).create({
            ...item,
            [RELACAO_LIVRO_ITEM]: String(item[RELACAO_LIVRO_ITEM]),
            [RELACAO_VENDA]: venda.id,
          }),
        );
      }
    } catch (error) {
      await Promise.all(
        itensCriados.map((item) =>
          pb.collection(COLECAO_ITENS).delete(item.id),
        ),
      );

      await pb.collection(COLECAO_VENDAS).delete(venda.id);
      marcarErro(error);
    }

    return venda;
  }

  static async mudarStatusPagamento(vendaId, usuarioEmail) {
    const pb = await criarClienteModel();

    let venda;

    try {
      venda = await pb.collection(COLECAO_VENDAS).update(vendaId, {
        status_pagamento: "Pago",
      });
    } catch (error) {
      marcarErro(error);
    }

    let notificacao = {
      emailEnviado: false,
      motivo: "EMAIL_NAO_INFORMADO",
      quantidadeEnviada: 0,
      quantidadeFalhas: 0,
    };

    if (usuarioEmail) {
      try {
        const resultado = await this.enviarEbookAposPagamento(
          vendaId,
          usuarioEmail,
        );

        notificacao = {
          emailEnviado: resultado.sucesso,
          motivo: resultado.falhas[0]?.motivo || null,
          quantidadeEnviada: resultado.quantidadeEnviada,
          quantidadeFalhas: resultado.quantidadeFalhas,
          falhas: resultado.falhas,
        };
      } catch (error) {
        console.error(
          `[LojaModel:mudarStatusPagamento] Falha na notificação da venda ${vendaId}:`,
          error,
        );

        notificacao = {
          emailEnviado: false,
          motivo: "FALHA_PROCESSAMENTO",
          quantidadeEnviada: 0,
          quantidadeFalhas: 0,
        };
      }
    }

    return {
      ...venda,
      notificacao,
    };
  }

  static async enviarEbookAposPagamento(vendaId, usuarioEmail) {
    if (!usuarioEmail) {
      const error = new Error("E-mail do comprador não informado.");
      error.statusCode = 400;
      throw error;
    }

    const pb = await criarClienteModel();

    let venda;

    try {
      venda = await pb.collection(COLECAO_VENDAS).getOne(vendaId);
    } catch (error) {
      marcarErro(error);
    }

    if (venda.status_pagamento !== "Pago") {
      const error = new Error(
        "Os livros digitais só podem ser enviados após a confirmação do pagamento.",
      );

      error.statusCode = 400;
      throw error;
    }

    const itens = await buscarItensVenda(pb, [vendaId], {
      expandLivros: true,
    });

    const digitais = itens.filter((item) => !item.fisico);

    if (!digitais.length) {
      const error = new Error(
        "Este pedido não possui livros digitais para enviar.",
      );

      error.statusCode = 400;
      throw error;
    }

    let quantidadeEnviada = 0;
    const falhas = [];

    for (const item of digitais) {
      const livro = item.expand?.[RELACAO_LIVRO_ITEM];

      try {
        if (!livro) {
          throw new Error("Livro não encontrado.");
        }

        const nomesArquivos = Array.isArray(livro.manuscrito)
          ? livro.manuscrito
          : [livro.manuscrito];

        const links = nomesArquivos
          .filter((nome) => typeof nome === "string" && nome.length > 0)
          .map((nome) => pb.files.getURL(livro, nome));

        if (!links.length) {
          throw new Error(
            `O arquivo digital de "${livro.titulo || "um livro"}" não está disponível.`,
          );
        }

        const titulo = String(livro.titulo || "Livro digital");

        const tituloSeguro = titulo.replace(
          /[&<>"']/g,
          (c) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            })[c],
        );

        const linksSeguros = links.map((link, index) => {
          const linkSeguro = link
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;");

          return {
            text: `Arquivo ${index + 1}: ${link}`,
            html: `<a href="${linkSeguro}" style="display:inline-block;margin:4px;padding:12px 20px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">Acessar arquivo ${index + 1}</a>`,
          };
        });

        const resultadoEmail = await this.dispararEmailcomLivroDigital({
          to: usuarioEmail,
          subject: `Seu livro digital: ${titulo}`,

          text: [
            "Olá!",
            "Este é o acesso ao livro digital adquirido na Tropa Livresca.",
            `Livro: ${titulo}`,
            ...linksSeguros.map((arquivo) => arquivo.text),
          ].join("\n\n"),

          html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; color: #333;">
            <h2>Seu livro digital está disponível!</h2>

            <p>Olá! Obrigado por comprar na Tropa Livresca.</p>

            <p>
              Você adquiriu a versão digital de
              <strong>${tituloSeguro}</strong>.
            </p>

            <p>Utilize os botões abaixo para acessar os arquivos:</p>

            ${linksSeguros.map((arquivo) => arquivo.html).join("")}

            <p style="margin-top:20px;font-size:13px;color:#666;">
              Guarde este e-mail para consultar o acesso novamente.
            </p>
          </div>
        `,
        });

        if (!resultadoEmail.enviado) {
          falhas.push({
            livro: titulo,
            motivo: resultadoEmail.motivo,
          });

          continue;
        }

        quantidadeEnviada++;
      } catch (error) {
        console.error(
          `[LojaModel:enviarEbookAposPagamento] Falha no livro ${livro?.titulo || item.id}:`,
          error,
        );

        falhas.push({
          livro: livro?.titulo || "Livro digital",
          motivo: "ERRO_PROCESSAMENTO",
        });
      }
    }

    return {
      sucesso: falhas.length === 0,
      quantidadeEnviada,
      quantidadeFalhas: falhas.length,
      falhas,
    };
  }

  static async reenviarEmailLivrosDigitais(vendaId, usuarioId, usuarioEmail) {
    const pb = await criarClienteModel();

    let venda;

    try {
      venda = await pb.collection(COLECAO_VENDAS).getOne(vendaId);
    } catch (error) {
      if (error.status === 404) {
        const notFound = new Error("Pedido não encontrado.");
        notFound.statusCode = 404;
        throw notFound;
      }

      marcarErro(error);
    }

    if (venda[RELACAO_PERFIL] !== usuarioId) {
      const error = new Error(
        "Você não tem permissão para reenviar os livros deste pedido.",
      );

      error.statusCode = 403;
      throw error;
    }

    if (venda.status_pagamento !== "Pago") {
      const error = new Error(
        "O e-mail só pode ser reenviado para pedidos Pagos.",
      );

      error.statusCode = 400;
      throw error;
    }

    const resultado = await this.enviarEbookAposPagamento(
      vendaId,
      usuarioEmail,
    );

    return {
      mensagem: resultado.sucesso
        ? "Todos os livros digitais foram enviados."
        : "O envio foi realizado parcialmente ou não foi possível enviar os e-mails.",

      emailEnviado: resultado.sucesso,
      quantidadeEnviada: resultado.quantidadeEnviada,
      quantidadeFalhas: resultado.quantidadeFalhas,
      falhas: resultado.falhas,
    };
  }

  static async buscarHistoricoVendasUsuario({
    usuarioId,
    page = 1,
    limit = 12,
    busca = "",
    statusPagamento = "",
    statusEntrega = "",
    dataInicio = "",
    dataFim = "",
    ordem = "recentes",
  } = {}) {
    const pb = await criarClienteModel();

    try {
      const vendas = await pb.collection(COLECAO_VENDAS).getFullList({
        filter: pb.filter(`${RELACAO_PERFIL} = {:usuarioId}`, {
          usuarioId,
        }),
        sort: "-data",
      });

      if (!vendas.length) {
        return {
          data: [],
          count: 0,
          meta: {
            totalItems: 0,
            page: 1,
            limit,
            totalPages: 0,
          },
        };
      }

      const itens = await buscarItensVenda(
        pb,
        vendas.map((venda) => venda.id),
        { expandLivros: true },
      );

      const itensPorVenda = new Map();

      for (const item of itens) {
        const vendaId = item[RELACAO_VENDA];

        if (!itensPorVenda.has(vendaId)) {
          itensPorVenda.set(vendaId, []);
        }

        itensPorVenda.get(vendaId).push(mapearItemVenda(pb, item));
      }

      const termo = String(busca).trim().toLowerCase();

      let resultado = vendas.map((venda) => ({
        ...venda,
        itens_venda: itensPorVenda.get(venda.id) ?? [],
      }));

      if (termo) {
        resultado = resultado.filter((venda) => {
          const encontrouId = venda.id.toLowerCase().includes(termo);

          const encontrouLivro = venda.itens_venda.some((item) =>
            String(item.livros?.titulo || "")
              .toLowerCase()
              .includes(termo),
          );

          return encontrouId || encontrouLivro;
        });
      }

      if (statusPagamento) {
        resultado = resultado.filter(
          (venda) => venda.status_pagamento === statusPagamento,
        );
      }

      if (statusEntrega) {
        resultado = resultado.filter(
          (venda) => venda.status_entrega === statusEntrega,
        );
      }

      if (dataInicio) {
        const inicio = new Date(`${dataInicio}T00:00:00`).getTime();

        resultado = resultado.filter(
          (venda) => new Date(venda.data).getTime() >= inicio,
        );
      }

      if (dataFim) {
        const fim = new Date(`${dataFim}T23:59:59.999`).getTime();

        resultado = resultado.filter(
          (venda) => new Date(venda.data).getTime() <= fim,
        );
      }

      resultado.sort((a, b) => {
        switch (ordem) {
          case "antigos":
            return new Date(a.data) - new Date(b.data);

          case "maior_valor":
            return Number(b.total || 0) - Number(a.total || 0);

          case "menor_valor":
            return Number(a.total || 0) - Number(b.total || 0);

          case "recentes":
          default:
            return new Date(b.data) - new Date(a.data);
        }
      });

      const pagina = Math.max(1, Number(page) || 1);
      const limite = Math.max(1, Number(limit) || 12);

      const count = resultado.length;
      const totalPages = Math.ceil(count / limite);
      const inicio = (pagina - 1) * limite;

      return {
        data: resultado.slice(inicio, inicio + limite),
        count,
        meta: {
          totalItems: count,
          page: pagina,
          limit: limite,
          totalPages,
        },
      };
    } catch (error) {
      marcarErro(error);
    }
  }

  static async buscarNumeroVendasLivro(livroId) {
    const pb = await criarClienteModel();

    try {
      const itens = await pb.collection(COLECAO_ITENS).getFullList({
        filter: pb.filter(`${RELACAO_LIVRO_ITEM} = {:livroId}`, {
          livroId: String(livroId),
        }),
        fields: "id,fk_vendas_id",
      });

      const vendaIds = [...new Set(itens.map((item) => item[RELACAO_VENDA]))];

      const vendas = await buscarVendasPorId(
        pb,
        vendaIds,
        "status_pagamento = 'Pago'",
      );

      const pagas = new Set(vendas.map((venda) => venda.id));

      const data = itens
        .filter((item) => pagas.has(item[RELACAO_VENDA]))
        .map((item) => ({
          id: item.id,
          vendas: { status_pagamento: "Pago" },
        }));

      return { data, count: data.length };
    } catch (error) {
      marcarErro(error);
    }
  }

  static async buscarRelatorioFinanceiroAutor(autorId) {
    const pb = await criarClienteModel();

    try {
      const livros = await pb.collection(COLECAO_LIVROS).getFullList({
        filter: pb.filter(`${RELACAO_PERFIL} = {:autorId}`, { autorId }),
        fields: "id,titulo,fk_user_profile_id",
      });

      if (!livros.length) {
        return { vendas: [], totalFaturado: 0, count: 0 };
      }

      const livroIds = livros.map((livro) => livro.id);

      const itens = await pb.collection(COLECAO_ITENS).getFullList({
        filter: filtrarIds(pb, RELACAO_LIVRO_ITEM, livroIds),
      });

      const vendas = await buscarVendasPorId(
        pb,
        [...new Set(itens.map((item) => item[RELACAO_VENDA]))],
        "status_pagamento = 'Pago'",
      );

      const vendaMap = new Map(vendas.map((venda) => [venda.id, venda]));
      const livroMap = new Map(livros.map((livro) => [livro.id, livro]));

      const relatorio = itens
        .filter((item) => vendaMap.has(item[RELACAO_VENDA]))
        .map((item) => ({
          id: item.id,
          qtd: item.qtd,
          subtotal: item.subtotal,
          fisico: item.fisico,
          vendas: vendaMap.get(item[RELACAO_VENDA]),
          livros: livroMap.get(item[RELACAO_LIVRO_ITEM]),
        }));

      return {
        vendas: relatorio,
        totalFaturado: relatorio.reduce(
          (total, item) => total + Number(item.subtotal),
          0,
        ),
        count: relatorio.length,
      };
    } catch (error) {
      marcarErro(error);
    }
  }

  static async calcularFretePrazo(userId, produtos) {
    const pb = await criarClienteModel();

    try {
      const produtosFisicos = produtos.filter(
        (produto) => produto.tipo === "Físico",
      );

      if (!produtosFisicos.length) {
        return [
          {
            transportadora: "Plataforma",
            modalidade: "Download Digital",
            preco: 0,
            prazo_dias: 0,
            descricao: "Envio imediato por e-mail após aprovação do pagamento.",
          },
        ];
      }

      const enderecos = await pb.collection("enderecos").getFullList({
        filter: pb.filter(
          "fk_user_profile_id = {:userId} && principal = true && ativo = true",
          { userId },
        ),
      });

      const endereco = enderecos[0];

      if (!endereco) {
        const error = new Error("Endereço principal não encontrado.");
        error.statusCode = 404;
        throw error;
      }

      const cepLimpo = String(endereco.cep || "").replace(/\D/g, "");

      if (cepLimpo.length !== 8) {
        const error = new Error(
          "CEP de destino inválido. O CEP deve conter 8 dígitos.",
        );
        error.statusCode = 400;
        throw error;
      }

      const pesoTotalKg = produtosFisicos.reduce(
        (total, produto) => total + Number(produto.quantidade || 1) * 0.4,
        0,
      );

      const regiao = Number.parseInt(cepLimpo.charAt(0), 10);

      const tarifas = {
        0: [12.9, 18.5, 1],
        1: [12.9, 18.5, 1],
        2: [16.2, 24.9, 2],
        3: [15.5, 23, 2],
        4: [26, 42, 4],
        5: [32, 58, 5],
        6: [32, 58, 5],
        7: [26, 42, 4],
        8: [18, 29, 3],
        9: [18, 29, 3],
      };

      const [pac, sedex, multiplicador] = tarifas[regiao] || [20, 35, 3];

      const taxaPeso = pesoTotalKg * 3.5;

      return [
        {
          transportadora: "Correios",
          modalidade: "PAC",
          preco: Math.round((pac + taxaPeso) * 100) / 100,
          prazo_dias: 3 + multiplicador * 2,
        },
        {
          transportadora: "Correios",
          modalidade: "SEDEX",
          preco: Math.round((sedex + taxaPeso) * 100) / 100,
          prazo_dias: 1 + multiplicador,
        },
      ];
    } catch (error) {
      if (error.statusCode) throw error;
      marcarErro(error);
    }
  }

  static async dispararEmailcomLivroDigital(dadosMail) {
    const porta = Number.parseInt(process.env.SMTP_PORT || "465", 10);

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS
    ) {
      return {
        enviado: false,
        motivo: "SMTP_NAO_CONFIGURADO",
      };
    }

    let transporte;

    try {
      const tempoMinimo = Math.max(
        0,
        Number.parseInt(process.env.SMTP_MIN_DELAY_MS || "5000", 10) || 0,
      );

      if (tempoMinimo > 0) {
        await new Promise((resolve) => setTimeout(resolve, tempoMinimo));
      }

      transporte = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: porta,
        secure: porta === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        family: 4,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
      });

      const resultado = await transporte.sendMail({
        ...dadosMail,
        from: `"Tropa Livresca" <${process.env.SMTP_USER}>`,
      });

      return {
        enviado: true,
        messageId: resultado.messageId,
      };
    } catch (error) {
      console.error("[LojaModel:dispararEmailcomLivroDigital]", {
        message: error?.message,
        code: error?.code,
        command: error?.command,
        responseCode: error?.responseCode,
      });

      return {
        enviado: false,
        motivo: "FALHA_ENVIO",
      };
    } finally {
      transporte?.close();
    }
  }
  static async buscarBibliotecaPessoal({
    userId,
    page = 1,
    limit = 12,
    busca = "",
    filtro = "",
    ordem = "",
    categoria = "",
    idioma = "",
    livroId = "",
  }) {
    const pb = await criarClienteModel();

    try {
      const vendas = await pb.collection(COLECAO_VENDAS).getFullList({
        filter: pb.filter(
          `${RELACAO_PERFIL} = {:userId} && status_pagamento = 'Pago'`,
          { userId },
        ),
      });

      const itens = (
        await buscarItensVenda(
          pb,
          vendas.map((venda) => venda.id),
          { expandLivros: true },
        )
      ).filter((item) => !item.fisico);

      const vendaMap = new Map(vendas.map((venda) => [venda.id, venda]));

      let resultado = itens
        .map((item) => ({
          ...item,
          livros: formatarLivro(pb, item.expand?.[RELACAO_LIVRO_ITEM] || null),
          vendas: vendaMap.get(item[RELACAO_VENDA]),
        }))
        .filter(({ livros }) => {
          if (!livros) return false;
          if (livroId && livros.id !== String(livroId)) return false;

          if (
            busca &&
            !String(livros.titulo || "")
              .toLowerCase()
              .includes(busca.toLowerCase())
          ) {
            return false;
          }

          if (categoria && livros.categoria !== categoria) return false;

          return !(
            idioma &&
            !String(livros.idioma || "")
              .toLowerCase()
              .includes(idioma.toLowerCase())
          );
        });

      const comparar = (a, b) => {
        const campo = filtro === "data" ? "data_de_publicacao" : "titulo";

        const ordemVal = String(a.livros[campo] || "").localeCompare(
          String(b.livros[campo] || ""),
        );

        if (campo === "data_de_publicacao" && ordem !== "ascendente") {
          return -ordemVal;
        }

        return ordem === "descendente" && campo === "titulo"
          ? -ordemVal
          : ordemVal;
      };

      resultado.sort(comparar);

      const start = (Math.max(1, Number(page) || 1) - 1) * limit;

      return {
        data: resultado.slice(start, start + limit),
        count: resultado.length,
      };
    } catch (error) {
      marcarErro(error);
    }
  }

  static async autorizarEntrega(vendaId) {
    const pb = await criarClienteModel();

    try {
      return await pb
        .collection(COLECAO_VENDAS)
        .update(vendaId, { status_entrega: "A caminho" });
    } catch (error) {
      marcarErro(error);
    }
  }

  static async alterarStatusEntrega(vendaId) {
    const pb = await criarClienteModel();

    try {
      return await pb
        .collection(COLECAO_VENDAS)
        .update(vendaId, { status_entrega: "Entregue" });
    } catch (error) {
      marcarErro(error);
    }
  }

  static async obterEstatisticasVendas(periodo = "30d") {
    const { inicio, fim } = calcularPeriodo(periodo);
    const pb = await criarClienteModel();

    try {
      const vendas = await pb.collection(COLECAO_VENDAS).getFullList({
        filter: pb.filter(
          "data >= {:inicio} && data < {:fim} && status_pagamento = 'Pago'",
          { inicio, fim },
        ),
      });

      const itens = await buscarItensVenda(
        pb,
        vendas.map((venda) => venda.id),
      );

      const livros = await pb.collection(COLECAO_LIVROS).getFullList();
      const perfis = await pb.collection(COLECAO_PERFIL).getFullList();

      const livroMap = new Map(livros.map((livro) => [livro.id, livro]));
      const perfilMap = new Map(perfis.map((perfil) => [perfil.id, perfil]));

      const topLivros = new Map();
      const generos = new Map();
      const autores = new Map();

      for (const item of itens) {
        const livro = livroMap.get(item[RELACAO_LIVRO_ITEM]);
        if (!livro) continue;

        const qtd = Number(item.qtd) || 0;

        topLivros.set(livro.id, {
          titulo: livro.titulo,
          total_vendido: (topLivros.get(livro.id)?.total_vendido || 0) + qtd,
        });

        const genero = livro.categoria || "";
        generos.set(genero, (generos.get(genero) || 0) + qtd);

        const autor = perfilMap.get(livro[RELACAO_PERFIL]);

        if (autor) {
          const key = autor.id;

          autores.set(key, {
            nome: autor.nome || "",
            sobrenome: autor.sobrenome || "",
            total_vendido: (autores.get(key)?.total_vendido || 0) + qtd,
          });
        }
      }

      return {
        periodo: { inicio, fim },
        topLivros: [...topLivros.values()]
          .sort((a, b) => b.total_vendido - a.total_vendido)
          .slice(0, 10),
        generos: [...generos].map(([genero, total_vendido]) => ({
          genero,
          total_vendido,
        })),
        autores: [...autores.values()]
          .sort((a, b) => b.total_vendido - a.total_vendido)
          .slice(0, 10),
      };
    } catch (error) {
      marcarErro(error);
    }
  }
}
