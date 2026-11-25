import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiChevronRight, FiSearch, FiX } from "react-icons/fi";
import base from "../Compra/Compra.module.css";
import styles from "./MeusPedidos.module.css";
import { useCompra } from "../../hooks/useCompra";
import Carregando from "../../../../components/Carregando/Carregando";
import DescricaoTela from "../../../../components/DescricaoTela/DescricaoTela";

const LIMITE = 12;

const formatarPreco = (valor) =>
  `R$ ${Number(valor || 0)
    .toFixed(2)
    .replace(".", ",")}`;

const formatarData = (data) =>
  data ? new Date(data).toLocaleDateString("pt-BR") : "";

const resumoItens = (itens = []) =>
  itens
    .map((item) => item.livros?.titulo)
    .filter(Boolean)
    .join(", ");

export default function MeusPedidos() {
  const { pedidos, buscarPedidos, carregando, erro } = useCompra();

  const [busca, setBusca] = useState("");
  const [statusPagamento, setStatusPagamento] = useState("");
  const [statusEntrega, setStatusEntrega] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [ordem, setOrdem] = useState("recentes");
  const [pagina, setPagina] = useState(1);
  const [meta, setMeta] = useState({});

  const obterPeriodo = useCallback(() => {
    if (!periodo) return { dataInicio: "", dataFim: "" };

    const hoje = new Date();
    const inicio = new Date(hoje);

    if (periodo === "7") inicio.setDate(hoje.getDate() - 7);
    if (periodo === "30") inicio.setDate(hoje.getDate() - 30);
    if (periodo === "90") inicio.setDate(hoje.getDate() - 90);
    if (periodo === "ano") {
      inicio.setMonth(0, 1);
    }

    const converter = (data) => {
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const dia = String(data.getDate()).padStart(2, "0");
      return `${ano}-${mes}-${dia}`;
    };

    return {
      dataInicio: converter(inicio),
      dataFim: converter(hoje),
    };
  }, [periodo]);

  const carregarPedidos = useCallback(
    async (paginaAtual = 1) => {
      const { dataInicio, dataFim } = obterPeriodo();

      const resultado = await buscarPedidos(
        paginaAtual,
        LIMITE,
        busca.trim(),
        statusPagamento,
        statusEntrega,
        dataInicio,
        dataFim,
        ordem,
      );

      setMeta(resultado?.meta || {});
    },
    [buscarPedidos, busca, statusPagamento, statusEntrega, obterPeriodo, ordem],
  );

  useEffect(() => {
    carregarPedidos(pagina);
  }, [carregarPedidos, pagina]);

  const limparFiltros = () => {
    setBusca("");
    setStatusPagamento("");
    setStatusEntrega("");
    setPeriodo("");
    setOrdem("recentes");
    setPagina(1);
  };

  const alterarFiltro = (setter, valor) => {
    setter(valor);
    setPagina(1);
  };

  const totalPaginas = Number(meta.totalPages || 1);

  return (
    <main>
      <DescricaoTela
        titulo="Meus pedidos"
        descricao="Acompanhe suas compras na Tropa Livresca."
      />

      <div className={base.container}>
        <section className={styles.filtros}>
          <div className={styles.busca}>
            <FiSearch />
            <input
              type="text"
              placeholder="Pesquisar pelo ID do pedido..."
              value={busca}
              onChange={(e) => alterarFiltro(setBusca, e.target.value)}
            />
          </div>

          <div className={styles.controles}>
            <select
              value={statusPagamento}
              onChange={(e) =>
                alterarFiltro(setStatusPagamento, e.target.value)
              }
            >
              <option value="">Todos os pagamentos</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
            </select>

            <select
              value={statusEntrega}
              onChange={(e) => alterarFiltro(setStatusEntrega, e.target.value)}
            >
              <option value="">Todas as entregas</option>
              <option value="Pendente">Aguardando envio</option>
              <option value="A caminho">Em trânsito</option>
              <option value="Entregue">Entregue</option>
            </select>

            <select
              value={periodo}
              onChange={(e) => alterarFiltro(setPeriodo, e.target.value)}
            >
              <option value="">Todo o período</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="ano">Este ano</option>
            </select>

            <select
              value={ordem}
              onChange={(e) => alterarFiltro(setOrdem, e.target.value)}
            >
              <option value="recentes">Mais recentes</option>
              <option value="antigos">Mais antigos</option>
              <option value="maior_valor">Maior valor</option>
              <option value="menor_valor">Menor valor</option>
            </select>
          </div>

          <button
            type="button"
            className={styles.limpar}
            onClick={limparFiltros}
          >
            <FiX /> Limpar filtros
          </button>
        </section>

        {carregando ? (
          <Carregando mensagem="Carregando pedidos..." />
        ) : erro ? (
          <p className={base.erro}>{erro}</p>
        ) : pedidos.length === 0 ? (
          <section className={base.vazio}>
            <p>
              {busca || statusPagamento || statusEntrega || periodo
                ? "Nenhum pedido encontrado com os filtros selecionados."
                : "Você ainda não fez nenhum pedido."}
            </p>
            <Link to="/loja" className={base.voltar}>
              <FiArrowLeft /> Ir para a Loja
            </Link>
          </section>
        ) : (
          <>
            <ul className={styles.lista}>
              {pedidos.map((pedido) => {
                const pago = pedido.status_pagamento === "pago";

                return (
                  <li key={pedido.id}>
                    <Link to={`/pedido/${pedido.id}`} className={styles.pedido}>
                      <div className={styles.info}>
                        <strong>
                          Pedido{" "}
                          <span className={styles.numero}>#{pedido.id}</span>
                        </strong>
                        <small>{formatarData(pedido.data)}</small>
                        <span className={styles.livros}>
                          {resumoItens(pedido.itens_venda)}
                        </span>
                      </div>

                      <div className={styles.status}>
                        <span
                          className={`${styles.etiqueta} ${
                            pago ? styles.pago : styles.pendente
                          }`}
                        >
                          {pago ? "Pago" : "Aguardando pagamento"}
                        </span>

                        {pedido.status_entrega !== "Não se aplica" && (
                          <small>Entrega: {pedido.status_entrega}</small>
                        )}
                      </div>

                      <strong className={styles.total}>
                        {formatarPreco(pedido.total)}
                      </strong>

                      <FiChevronRight className={styles.seta} />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {totalPaginas > 1 && (
              <div className={styles.paginacao}>
                <button
                  type="button"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((atual) => atual - 1)}
                >
                  Anterior
                </button>

                <span>
                  Página {pagina} de {totalPaginas}
                </span>

                <button
                  type="button"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina((atual) => atual + 1)}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
