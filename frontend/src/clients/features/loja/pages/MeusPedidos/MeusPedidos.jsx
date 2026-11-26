import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronRight,
  FiChevronDown,
  FiX,
} from "react-icons/fi";

import { FaSearch } from "react-icons/fa";
import base from "../Compra/Compra.module.css";
import styles from "./MeusPedidos.module.css";
import { useCompra } from "../../hooks/useCompra";
import Carregando from "../../../../components/Carregando/Carregando";
import Paginacao from "../../../../../common/components/Paginacao/Paginacao";

const LIMITE = 12;

const ORDENACOES = [
  { valor: "recentes", rotulo: "Mais recentes" },
  { valor: "antigos", rotulo: "Mais antigos" },
  { valor: "maior_valor", rotulo: "Maior valor" },
  { valor: "menor_valor", rotulo: "Menor valor" },
];

const FILTROS_PAGAMENTO = [
  { valor: "", rotulo: "Todos os pagamentos" },
  { valor: "Pago", rotulo: "Pago" },
  { valor: "Pendente", rotulo: "Pendente" },
];

const FILTROS_ENTREGA = [
  { valor: "", rotulo: "Todas as entregas" },
  { valor: "Pendente", rotulo: "Aguardando envio" },
  { valor: "A caminho", rotulo: "Em trânsito" },
  { valor: "Entregue", rotulo: "Entregue" },
];

const PERIODOS = [
  { valor: "", rotulo: "Todo o período" },
  { valor: "7", rotulo: "Últimos 7 dias" },
  { valor: "30", rotulo: "Últimos 30 dias" },
  { valor: "90", rotulo: "Últimos 90 dias" },
  { valor: "ano", rotulo: "Este ano" },
];

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

function DropdownFiltro({ valor, opcoes, aberto, onToggle, onSelecionar }) {
  const opcaoAtual = opcoes.find((opcao) => opcao.valor === valor) || opcoes[0];

  return (
    <div className={styles.dropdown}>
      <button
        type="button"
        className={`${styles.dropdownBotao} ${
          aberto ? styles.dropdownAberto : ""
        }`}
        onClick={onToggle}
        aria-expanded={aberto}
      >
        <span className={styles.dropdownTexto}>
          <strong>{opcaoAtual.rotulo}</strong>
        </span>

        <FiChevronDown className={aberto ? styles.setaAberta : ""} />
      </button>

      {aberto && (
        <ul className={styles.dropdownOpcoes}>
          {opcoes.map((opcao) => (
            <li key={opcao.valor || "todos"}>
              <button
                type="button"
                className={valor === opcao.valor ? styles.opcaoAtiva : ""}
                onClick={() => onSelecionar(opcao.valor)}
              >
                {opcao.rotulo}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MeusPedidos() {
  const { pedidos, buscarPedidos, carregando, erro } = useCompra();

  const [busca, setBusca] = useState("");
  const [statusPagamento, setStatusPagamento] = useState("");
  const [statusEntrega, setStatusEntrega] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [ordem, setOrdem] = useState("recentes");
  const [pagina, setPagina] = useState(1);
  const [meta, setMeta] = useState({});
  const [dropdownAberto, setDropdownAberto] = useState(null);

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
    setDropdownAberto(null);
  };

  const alterarFiltro = (setter, valor) => {
    setter(valor);
    setPagina(1);
    setDropdownAberto(null);
  };

  const possuiFiltros = Boolean(
    busca.trim() ||
    statusPagamento ||
    statusEntrega ||
    periodo ||
    ordem !== "recentes",
  );

  return (
    <main>
      <header className={styles.topo}>
        <div className={styles.subcontainer}>
          <div>
            <h1 className={styles.titulo}>Meus pedidos</h1>
            <p>Acompanhe suas compras na Tropa Livresca.</p>
          </div>

          <button
            type="button"
            className={styles.limpar}
            onClick={limparFiltros}
            disabled={!possuiFiltros}
          >
            <FiX />
            Limpar Filtros
          </button>
        </div>
      </header>

      <div className={base.container}>
        <section className={styles.filtros}>
          <div className={styles.busca}>
            <FaSearch />

            <input
              type="search"
              placeholder="ID do pedido..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              aria-label="ID do pedido"
            />

            <DropdownFiltro
              valor={ordem}
              opcoes={ORDENACOES}
              aberto={dropdownAberto === "ordem"}
              onToggle={() =>
                setDropdownAberto(dropdownAberto === "ordem" ? null : "ordem")
              }
              onSelecionar={(valor) => alterarFiltro(setOrdem, valor)}
            />

            <DropdownFiltro
              valor={statusPagamento}
              opcoes={FILTROS_PAGAMENTO}
              aberto={dropdownAberto === "pagamento"}
              onToggle={() =>
                setDropdownAberto(
                  dropdownAberto === "pagamento" ? null : "pagamento",
                )
              }
              onSelecionar={(valor) => alterarFiltro(setStatusPagamento, valor)}
            />

            <DropdownFiltro
              valor={statusEntrega}
              opcoes={FILTROS_ENTREGA}
              aberto={dropdownAberto === "entrega"}
              onToggle={() =>
                setDropdownAberto(
                  dropdownAberto === "entrega" ? null : "entrega",
                )
              }
              onSelecionar={(valor) => alterarFiltro(setStatusEntrega, valor)}
            />

            <DropdownFiltro
              valor={periodo}
              opcoes={PERIODOS}
              aberto={dropdownAberto === "periodo"}
              onToggle={() =>
                setDropdownAberto(
                  dropdownAberto === "periodo" ? null : "periodo",
                )
              }
              onSelecionar={(valor) => alterarFiltro(setPeriodo, valor)}
            />

            <button type="submit" className={styles.btnbuscar}>
              Buscar
            </button>
          </div>

          <div className={styles.controles}></div>
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
                const pago = pedido.status_pagamento === "Pago";

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

            <Paginacao
              totalPaginas={meta?.totalPages}
              paginaAtual={pagina}
              onMudarPagina={setPagina}
              totalItems={meta?.totalItems}
            />
          </>
        )}
      </div>
    </main>
  );
}
