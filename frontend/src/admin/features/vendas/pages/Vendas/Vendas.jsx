import { useEffect, useState } from "react";
import styles from "./Vendas.module.css";
import { useVendas } from "../../hooks/useVendas";
import useAdmin from "../../../../../common/hooks/useAdmin";
import Carregando from "../../../../components/Carregando/Carregando";
import Paginacao from "../../../../../common/components/Paginacao/Paginacao";

const POR_PAGINA = 10;
const PERCENTUAL_AUTOR = 0.3;

const formatarPreco = (valor) =>
  `R$ ${Number(valor || 0)
    .toFixed(2)
    .replace(".", ",")}`;

const formatarData = (data) =>
  data ? new Date(data).toLocaleDateString("pt-BR") : "";

export default function Vendas() {
  const {
    vendas,
    meta,
    carregando,
    erro,
    buscarVendas,
    autorizarRepasse,
    enviarPedido,
    marcarEntregue,
  } = useVendas();

  const { user } = useAdmin();

  const [pagina, setPagina] = useState(1);
  const [emAndamento, setEmAndamento] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const [busca, setBusca] = useState("");
  const [statusPagamento, setStatusPagamento] = useState("");
  const [statusEntrega, setStatusEntrega] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [ordem, setOrdem] = useState("recentes");

  useEffect(() => {
    const hoje = new Date();
    const inicio = new Date(hoje);

    if (periodo === "7") inicio.setDate(hoje.getDate() - 7);
    if (periodo === "30") inicio.setDate(hoje.getDate() - 30);
    if (periodo === "90") inicio.setDate(hoje.getDate() - 90);

    if (periodo === "ano") {
      inicio.setMonth(0, 1);
      inicio.setHours(0, 0, 0, 0);
    }

    const converterData = (data) => {
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const dia = String(data.getDate()).padStart(2, "0");
      return `${ano}-${mes}-${dia}`;
    };

    buscarVendas(
      pagina,
      POR_PAGINA,
      busca.trim(),
      statusPagamento,
      statusEntrega,
      periodo ? converterData(inicio) : "",
      periodo ? converterData(hoje) : "",
      ordem,
    );
  }, [
    pagina,
    buscarVendas,
    busca,
    statusPagamento,
    statusEntrega,
    periodo,
    ordem,
  ]);

  const limparFiltros = () => {
    setBusca("");
    setStatusPagamento("");
    setStatusEntrega("");
    setPeriodo("");
    setOrdem("recentes");
    setPagina(1);
  };

  const executarAcao = async (vendaId, acao, sucesso) => {
    setEmAndamento(vendaId);
    setMensagem(null);

    const erroAcao = await acao(vendaId);

    setMensagem(
      erroAcao
        ? { tipo: "erro", texto: `Pedido #${vendaId}: ${erroAcao}` }
        : { tipo: "sucesso", texto: `Pedido #${vendaId}: ${sucesso}` },
    );

    setEmAndamento(null);

    await buscarVendas(
      pagina,
      POR_PAGINA,
      busca.trim(),
      statusPagamento,
      statusEntrega,
      "",
      "",
      ordem,
    );
  };

  const renderAcoes = (venda) => {
    const pago = venda.status_pagamento === "Pago";
    const ocupado = emAndamento === venda.id;
    const botoes = [];

    if (pago && !venda.repassado && user?.is_master) {
      botoes.push(
        <button
          key="repasse"
          type="button"
          className={styles.botaoPrincipal}
          disabled={ocupado}
          onClick={() =>
            executarAcao(
              venda.id,
              autorizarRepasse,
              "repasse de 30% autorizado.",
            )
          }
        >
          Autorizar repasse
        </button>,
      );
    }

    if (pago && venda.status_entrega === "Pendente") {
      botoes.push(
        <button
          key="enviar"
          type="button"
          className={styles.botao}
          disabled={ocupado}
          onClick={() =>
            executarAcao(venda.id, enviarPedido, "marcado como enviado.")
          }
        >
          Marcar como enviado
        </button>,
      );
    }

    if (venda.status_entrega === "A caminho") {
      botoes.push(
        <button
          key="Entregue"
          type="button"
          className={styles.botao}
          disabled={ocupado}
          onClick={() =>
            executarAcao(venda.id, marcarEntregue, "marcado como entregue.")
          }
        >
          Marcar como entregue
        </button>,
      );
    }

    return botoes.length > 0 ? (
      botoes
    ) : (
      <span className={styles.semAcao}>—</span>
    );
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.topo}>
        <h1 className={styles.titulo}>Gerenciar Pedidos</h1>
        <p>
          Acompanhe as vendas, o envio dos livros físicos e o repasse de
          <span className={styles.numero}> {PERCENTUAL_AUTOR * 100}%</span> aos
          autores.
        </p>
      </div>

      <div className={styles.container}>
        {mensagem && (
          <p
            className={
              mensagem.tipo === "erro" ? styles.mensagemErro : styles.mensagemOk
            }
          >
            {mensagem.texto}
          </p>
        )}

        {!user?.is_master && (
          <p className={styles.aviso}>
            Apenas administradores master podem autorizar repasses.
          </p>
        )}

        <div>
          <input
            type="text"
            placeholder="Pesquisar pelo ID do pedido..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />

          <select
            value={statusPagamento}
            onChange={(e) => {
              setStatusPagamento(e.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todos os pagamentos</option>
            <option value="Pago">Pago</option>
            <option value="Pendente">Pendente</option>
          </select>

          <select
            value={statusEntrega}
            onChange={(e) => {
              setStatusEntrega(e.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todas as entregas</option>
            <option value="Pendente">Pendente</option>
            <option value="A caminho">A caminho</option>
          </select>

          <select
            value={periodo}
            onChange={(e) => {
              setPeriodo(e.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todo o período</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="ano">Este ano</option>
          </select>

          <select
            value={ordem}
            onChange={(e) => {
              setOrdem(e.target.value);
              setPagina(1);
            }}
          >
            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
            <option value="maior_valor">Maior valor</option>
            <option value="menor_valor">Menor valor</option>
          </select>

          <button type="button" onClick={limparFiltros}>
            Limpar filtros
          </button>
        </div>

        {carregando && vendas.length === 0 ? (
          <Carregando mensagem="Carregando vendas..." />
        ) : erro ? (
          <p className={styles.mensagemErro}>{erro}</p>
        ) : vendas.length === 0 ? (
          <p className={styles.vazio}>
            {busca || statusPagamento || statusEntrega || periodo
              ? "Nenhuma venda encontrada com os filtros selecionados."
              : "Nenhuma venda registrada ainda."}
          </p>
        ) : (
          <div className={styles.tabelaWrapper}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Comprador</th>
                  <th>Livros</th>
                  <th>Total</th>
                  <th>Pagamento</th>
                  <th>Entrega</th>
                  <th>Repasse ao autor</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {vendas.map((venda) => {
                  const totalLivros = (venda.itens_venda || []).reduce(
                    (acc, item) => acc + Number(item.subtotal),
                    0,
                  );

                  return (
                    <tr key={venda.id}>
                      <td>
                        <strong className={styles.numero}>#{venda.id}</strong>
                        <small className={styles.data}>
                          <span className={styles.numero}>
                            {formatarData(venda.data)}
                          </span>
                        </small>
                      </td>

                      <td>{venda.users_profile?.nome || "—"}</td>

                      <td>
                        <ul className={styles.livros}>
                          {(venda.itens_venda || []).map((item, index) => (
                            <li key={index}>
                              <span className={styles.numero}>{item.qtd}x</span>{" "}
                              {item.livros?.titulo || "Livro"}{" "}
                              <span className={styles.etiquetaMini}>
                                {item.fisico ? "Físico" : "E-book"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>

                      <td>
                        <span className={styles.numero}>
                          {formatarPreco(venda.total)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`${styles.etiqueta} ${
                            venda.status_pagamento === "Pago"
                              ? styles.ok
                              : styles.pendente
                          }`}
                        >
                          {venda.status_pagamento === "Pago"
                            ? "Pago"
                            : "Pendente"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`${styles.etiqueta} ${
                            venda.status_entrega === "Pendente"
                              ? styles.entregaPendente
                              : ""
                          }`}
                        >
                          {venda.status_entrega}
                        </span>
                      </td>

                      <td>
                        {venda.repassado ? (
                          <span className={`${styles.etiqueta} ${styles.ok}`}>
                            Repassado
                          </span>
                        ) : (
                          <span
                            className={`${styles.etiqueta} ${styles.valorRepasse}`}
                          >
                            {formatarPreco(totalLivros * PERCENTUAL_AUTOR)}
                          </span>
                        )}
                      </td>

                      <td>
                        <div className={styles.acoes}>{renderAcoes(venda)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Paginacao
          totalPaginas={meta?.totalPages}
          paginaAtual={pagina}
          onMudarPagina={setPagina}
          totalItems={meta?.totalItems}
        />
      </div>
    </main>
  );
}
