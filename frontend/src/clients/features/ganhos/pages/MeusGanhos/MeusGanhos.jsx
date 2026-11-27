import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowDownLeft, FiArrowUpRight } from "react-icons/fi";
import styles from "./MeusGanhos.module.css";
import { useGanhos } from "../../hooks/useGanhos";
import Carregando from "../../../../components/Carregando/Carregando";
import { useDadosBancarios } from "../../../perfil/hooks/useDadosBancarios.js";

const formatarPreco = (valor) =>
  `R$ ${Number(valor || 0)
    .toFixed(2)
    .replace(".", ",")}`;

const formatarData = (data) =>
  data ? new Date(data).toLocaleDateString("pt-BR") : "";

export default function MeusGanhos() {
  const { dadosBancarios, buscarDadosBancarios, solicitarSaque } =
    useDadosBancarios();

  const { ganhos, carregando, erro, buscarGanhos } = useGanhos();

  const [valorSaque, setValorSaque] = useState("");
  const [solicitandoSaque, setSolicitandoSaque] = useState(false);
  const [mensagemSaque, setMensagemSaque] = useState("");
  const [erroSaque, setErroSaque] = useState("");

  useEffect(() => {
    buscarDadosBancarios();
  }, [buscarDadosBancarios]);

  useEffect(() => {
    buscarGanhos();
  }, [buscarGanhos]);

  const extrato = ganhos?.extrato || [];
  const saldoDisponivel = Number(ganhos?.saldo ?? 0);

  const somarMovimentacoes = (tipo) =>
    extrato
      .filter((mov) => mov.tipo === tipo)
      .reduce((acc, mov) => acc + Number(mov.valor || 0), 0);
  const totalRecebido = somarMovimentacoes("entrada");
  const totalRetirado = somarMovimentacoes("saida");

  const existeConta = dadosBancarios && Object.keys(dadosBancarios).length > 0;

  const [periodo, setPeriodo] = useState("");
  const [pagina, setPagina] = useState(1);

  const LIMITE = 10;

  const extratoFiltrado = extrato.filter((mov) => {
    if (!periodo) return true;

    const dataMovimentacao = new Date(mov.data);

    if (Number.isNaN(dataMovimentacao.getTime())) return false;

    const hoje = new Date();
    const inicio = new Date(hoje);

    if (periodo === "7") inicio.setDate(hoje.getDate() - 7);
    if (periodo === "30") inicio.setDate(hoje.getDate() - 30);
    if (periodo === "90") inicio.setDate(hoje.getDate() - 90);

    if (periodo === "ano") {
      inicio.setMonth(0, 1);
      inicio.setHours(0, 0, 0, 0);
    }

    return dataMovimentacao >= inicio && dataMovimentacao <= hoje;
  });

  const totalPaginas = Math.ceil(extratoFiltrado.length / LIMITE);

  const movimentacoesPaginadas = extratoFiltrado.slice(
    (pagina - 1) * LIMITE,
    pagina * LIMITE,
  );

  const handleSolicitarSaque = async (e) => {
    e.preventDefault();

    setMensagemSaque("");
    setErroSaque("");

    const valor = Number(valorSaque);

    if (!existeConta) {
      setErroSaque(
        "Cadastre seus dados bancários antes de solicitar um saque.",
      );
      return;
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      setErroSaque("Informe um valor de saque válido.");
      return;
    }

    if (valor > saldoDisponivel) {
      setErroSaque(
        "O valor solicitado não pode ser maior que seu saldo disponível.",
      );
      return;
    }

    if (valor < 50) {
      setErroSaque("O valor solicitado não pode ser inferior a R$ 50,00.");
      return;
    }

    try {
      setSolicitandoSaque(true);

      await solicitarSaque(valor);

      setMensagemSaque("Solicitação de saque enviada com sucesso.");
      setValorSaque("");

      await buscarGanhos();
    } catch (error) {
      console.error("Erro ao solicitar saque:", error);
      setErroSaque(
        error?.message ||
          "Não foi possível solicitar o saque. Tente novamente.",
      );
    } finally {
      setSolicitandoSaque(false);
    }
  };

  const formatarContaMovimentacao = (mov) => {
    const conta = mov.dados_bancarios;

    if (!conta || typeof conta !== "object") {
      return "Não se aplica";
    }

    const banco = conta.numero_banco || "Banco não informado";
    const agencia = conta.numero_agencia || "—";
    const numeroConta = String(conta.numero_conta || "");

    const contaMascarada = numeroConta
      ? `****${numeroConta.slice(-4)}`
      : "Conta não informada";

    return {
      banco,
      agencia,
      conta: contaMascarada,
      titular: conta.nome_completo || "Titular não informado",
    };
  };

  return (
    <main>
      <div className={styles.topo}>
        <h1 className={styles.titulo}>Meus ganhos</h1>
        <p>
          A cada livro seu vendido na loja, você recebe{" "}
          <span className={styles.numero2}>30%</span> do valor como direitos
          autorais.
        </p>
      </div>

      <div className={styles.container}>
        {carregando && !ganhos ? (
          <Carregando mensagem="Carregando seus ganhos..." />
        ) : erro ? (
          <p className={styles.erro}>{erro}</p>
        ) : (
          <div className={styles.conteudo}>
            <div className={styles.cartoes}>
              <div className={`${styles.cartaoResumo} ${styles.destaque}`}>
                <span>Saldo disponível</span>
                <strong>{formatarPreco(saldoDisponivel)}</strong>
                <small>Valor disponível para saque</small>
              </div>

              <div className={styles.cartaoResumo}>
                <span>Total recebido</span>
                <strong>{formatarPreco(totalRecebido)}</strong>
                <small>Soma dos direitos autorais recebidos</small>
              </div>

              <div className={styles.cartaoResumo}>
                <span>Total retirado</span>
                <strong>{formatarPreco(totalRetirado)}</strong>
                <small>Soma dos saques realizados</small>
              </div>
            </div>

            <section className={styles.cartao}>
              <h2
                className={saldoDisponivel <= 0 ? styles.labelDesabilitado : ""}
              >
                Solicitar saque
              </h2>

              {existeConta ? (
                <span
                  className={`${styles.des} ${
                    saldoDisponivel <= 0 ? styles.labelDesabilitado : ""
                  }`}
                >
                  O valor solicitado será encaminhado para a conta bancária
                  cadastrada.
                </span>
              ) : (
                <p
                  className={`${styles.aviso1} ${
                    saldoDisponivel <= 0 ? styles.labelDesabilitado : ""
                  }`}
                >
                  Você precisa cadastrar seus dados bancários antes de solicitar
                  um saque.{" "}
                  <Link to="/perfil/dadosbancarios">
                    Cadastrar dados bancários
                  </Link>
                </p>
              )}

              <form
                onSubmit={handleSolicitarSaque}
                className={
                  saldoDisponivel <= 0 ? styles.formularioDesabilitado : ""
                }
              >
                <label
                  htmlFor="valorSaque"
                  className={`${styles.label} ${
                    !existeConta || saldoDisponivel <= 0
                      ? styles.labelDesabilitado
                      : ""
                  }`}
                >
                  Valor do saque (R$)
                </label>

                <input
                  className={styles.input}
                  name="valorSaque"
                  type="number"
                  min="0.01"
                  max={saldoDisponivel}
                  step="0.01"
                  value={valorSaque}
                  onChange={(e) => {
                    setValorSaque(e.target.value);
                    setErroSaque("");
                    setMensagemSaque("");
                  }}
                  placeholder="Ex.: 50,00"
                  required
                  disabled={
                    solicitandoSaque || !existeConta || saldoDisponivel <= 0
                  }
                />

                <p
                  className={`${styles.saldo} ${
                    !existeConta || saldoDisponivel <= 0
                      ? styles.labelDesabilitado
                      : ""
                  }`}
                >
                  Saldo disponível:{" "}
                  <span className={styles.numero}>
                    {formatarPreco(saldoDisponivel)}
                  </span>
                </p>

                {erroSaque && (
                  <p role="alert" className={styles.erro}>
                    {erroSaque}
                  </p>
                )}

                {mensagemSaque && <p role="status">{mensagemSaque}</p>}

                <button
                  type="submit"
                  disabled={
                    solicitandoSaque || !existeConta || saldoDisponivel <= 0
                  }
                >
                  {solicitandoSaque ? "Solicitando..." : "Solicitar saque"}
                </button>
              </form>
            </section>

            <section className={styles.cartao}>
              <strong className={styles.ex}>Extrato</strong>

              <div className={styles.filtrosExtrato}>
                <label htmlFor="periodoExtrato">Filtrar por período</label>

                <select
                  id="periodoExtrato"
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
              </div>

              {extratoFiltrado.length === 0 ? (
                <p className={styles.aviso}>
                  {extrato.length === 0
                    ? "Você ainda não possui movimentações financeiras."
                    : "Nenhuma movimentação encontrada para o período selecionado."}{" "}
                  <Link to="/meuslivros">Ver meus livros</Link>
                </p>
              ) : (
                <>
                  <div className={styles.tabelaContainer}>
                    <table className={styles.tabelaExtrato}>
                      <thead>
                        <tr>
                          <th>Movimentação</th>
                          <th>Data</th>
                          <th>Conta da movimentação</th>
                          <th>Valor</th>
                        </tr>
                      </thead>

                      <tbody>
                        {movimentacoesPaginadas.map((mov) => {
                          const entrada = mov.tipo === "entrada";
                          const conta = formatarContaMovimentacao(mov);

                          return (
                            <tr key={mov.id}>
                              <td>
                                <span
                                  className={`${styles.icone} ${
                                    entrada
                                      ? styles.iconeEntrada
                                      : styles.iconeSaida
                                  }`}
                                >
                                  {entrada ? (
                                    <FiArrowDownLeft />
                                  ) : (
                                    <FiArrowUpRight />
                                  )}
                                </span>

                                <strong>
                                  {entrada ? (
                                    <>
                                      Direitos autorais
                                      {mov.fk_vendas_id && (
                                        <>
                                          {" · Pedido "}
                                          <span className={styles.numero2}>
                                            #{mov.fk_vendas_id}
                                          </span>
                                        </>
                                      )}
                                    </>
                                  ) : (
                                    "Saque"
                                  )}
                                </strong>
                              </td>

                              <td className={styles.numero2}>
                                {formatarData(mov.data)}
                              </td>

                              <td>
                                {typeof conta === "string" ? (
                                  <span>{conta}</span>
                                ) : (
                                  <div className={styles.dadosConta}>
                                    <strong>{conta.banco}</strong>
                                    <small>
                                      Agência:{" "}
                                      <span className={styles.numero2}>
                                        {conta.agencia}
                                      </span>
                                    </small>
                                    <small>
                                      Conta:{" "}
                                      <span className={styles.numero2}>
                                        {conta.conta}
                                      </span>
                                    </small>
                                    <small>Titular: {conta.titular}</small>
                                  </div>
                                )}
                              </td>

                              <td>
                                <strong
                                  className={
                                    entrada
                                      ? styles.valorEntrada
                                      : styles.valorSaida
                                  }
                                >
                                  {entrada ? "+" : "−"}{" "}
                                  {formatarPreco(mov.valor)}
                                </strong>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {totalPaginas > 1 && (
                    <div className={styles.paginacao}>
                      <button
                        type="button"
                        disabled={pagina === 1}
                        onClick={() => setPagina((atual) => atual - 1)}
                      >
                        Anterior
                      </button>

                      <span>
                        Página {pagina} de {totalPaginas}
                      </span>

                      <button
                        type="button"
                        disabled={pagina === totalPaginas}
                        onClick={() => setPagina((atual) => atual + 1)}
                      >
                        Próxima
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
