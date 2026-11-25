import { useState, useEffect } from "react";
import Input from "../../../../../common/components/Input/Input";
import styles from "./Orcamento.module.css";
import { Link } from "react-router-dom";

const CUSTO_POR_PAGINA_CENTAVOS = 8;
const CUSTO_MINIMO_DIGITAL_CENTAVOS = 599;
const PORCENTAGEM_PLATAFORMA = 70;

export default function Orcamento({
  dados,
  onChange,
  irParaProximaEtapa,
  numeroPaginas,
  voltarEtapa,
}) {
  const orcamento = dados || {};

  numeroPaginas = Math.max(0, Number(numeroPaginas) || 0);

  const custoMinimoFisico = numeroPaginas * CUSTO_POR_PAGINA_CENTAVOS;
  const custoMinimoDigital = CUSTO_MINIMO_DIGITAL_CENTAVOS;

  const [valoresDigitados, setValoresDigitados] = useState({
    valorLivroFisico: "",
    valorLivroDigital: "",
  });

  const converterParaCentavos = (valor) => {
    const limpo = String(valor ?? "")
      .replace(",", ".")
      .trim();

    if (!limpo || !/^\d+(\.\d{0,2})?$/.test(limpo)) {
      return 0;
    }

    return Math.round(Number(limpo) * 100);
  };

  const formatarMoeda = (centavos) =>
    (centavos / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const calcularValores = (precoTotal, custoMinimo) => {
    const precoTotalCentavos = converterParaCentavos(precoTotal);

    const valorDesejadoAutor = Math.max(0, precoTotalCentavos - custoMinimo);

    const valorPlataforma = Math.round(
      (precoTotalCentavos * PORCENTAGEM_PLATAFORMA) / 100,
    );

    const valorAutor = precoTotalCentavos - valorPlataforma;

    return {
      custoMinimo: formatarMoeda(custoMinimo),
      valorDesejadoAutor: formatarMoeda(valorDesejadoAutor),
      precoTotal: formatarMoeda(precoTotalCentavos),
      valorPlataforma: formatarMoeda(valorPlataforma),
      valorAutor: formatarMoeda(valorAutor),
    };
  };

  useEffect(() => {
    const sincronizarValor = (precoTotal, custoMinimo) => {
      const total = converterParaCentavos(precoTotal);
      const desejado = Math.max(0, total - custoMinimo);

      return formatarMoeda(desejado);
    };

    setValoresDigitados({
      valorLivroFisico: sincronizarValor(
        orcamento.valorLivroFisico,
        custoMinimoFisico,
      ),
      valorLivroDigital: sincronizarValor(
        orcamento.valorLivroDigital,
        custoMinimoDigital,
      ),
    });
  }, [
    orcamento.valorLivroFisico,
    orcamento.valorLivroDigital,
    custoMinimoFisico,
    custoMinimoDigital,
  ]);

  const atualizarPrecoTotal = (chave, valor, custoMinimo) => {
    const valorValidado = valor.replace(/[^0-9.,]/g, "");

    setValoresDigitados((anterior) => ({
      ...anterior,
      [chave]: valorValidado,
    }));

    const normalizado = valorValidado.replace(",", ".");

    if (!/^\d*(\.\d{0,2})?$/.test(normalizado)) {
      return;
    }

    const valorDesejadoCentavos = converterParaCentavos(normalizado);

    const precoTotalCentavos = custoMinimo + valorDesejadoCentavos;

    onChange({
      ...orcamento,
      [chave]: formatarMoeda(precoTotalCentavos),
    });
  };

  const valoresFisico = calcularValores(
    orcamento.valorLivroFisico,
    custoMinimoFisico,
  );

  const valoresDigital = calcularValores(
    orcamento.valorLivroDigital,
    custoMinimoDigital,
  );

  const renderizarResumo = (valores) => (
    <div className={styles.div2}>
      <p>
        Custo mínimo: R${" "}
        <span className={styles.numero}>{valores.custoMinimo}</span>
      </p>

      <p>
        Valor desejado pelo autor: R${" "}
        <span className={styles.numero}>{valores.valorDesejadoAutor}</span>
      </p>

      <p>
        Valor recebido pela plataforma{" "}
        <span className={styles.numero}>(70%)</span>: R${" "}
        <span className={styles.numero}>{valores.valorPlataforma}</span>
      </p>

      <p>
        Valor destinado ao autor <span className={styles.numero}>(30%)</span>:
        R$ <span className={styles.numero}>{valores.valorAutor}</span>
      </p>

      <small className={styles.strong}>
        Preço total de venda: R${" "}
        <span className={styles.numero}>{valores.precoTotal}</span>
      </small>
    </div>
  );

  return (
    <main>
      <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
        <h1 className={styles.titulo}>Orçamento</h1>

        <p className={styles.descricao}>
          Defina os valores de venda dos seus livros e acompanhe como será
          distribuído o valor de cada venda.
        </p>

        <div className={styles.card}>
          <legend>Preço do Livro Físico</legend>

          <div className={styles.informacoesPreco}>
            <p>
              Custo mínimo de fabricação{" "}
              <span className={styles.numero}>(R$ 0,08 por página): R$ </span>
              <span className={styles.numero}>
                {formatarMoeda(custoMinimoFisico)}
              </span>
            </p>

            <label htmlFor="valorLivroFisico">
              Valor desejado pelo autor (R$):
            </label>

            <Input
              id="valorLivroFisico"
              type="text"
              placeholder="0,00"
              className={styles.inputmodificado}
              value={valoresDigitados.valorLivroFisico}
              handleOnChange={(e) =>
                atualizarPrecoTotal(
                  "valorLivroFisico",
                  e.target.value,
                  custoMinimoFisico,
                )
              }
            />

            {renderizarResumo(valoresFisico)}
          </div>
        </div>

        <div className={styles.card}>
          <legend>Preço do Livro Digital</legend>

          <div className={styles.informacoesPreco}>
            <p>
              Custo mínimo digital: R${" "}
              <span className={styles.numero}>
                {formatarMoeda(custoMinimoDigital)}
              </span>
            </p>

            <label htmlFor="valorLivroDigital">
              Valor desejado pelo autor (R$):
            </label>

            <Input
              id="valorLivroDigital"
              type="text"
              placeholder="0,00"
              className={styles.inputmodificado}
              value={valoresDigitados.valorLivroDigital}
              handleOnChange={(e) =>
                atualizarPrecoTotal(
                  "valorLivroDigital",
                  e.target.value,
                  custoMinimoDigital,
                )
              }
            />

            {renderizarResumo(valoresDigital)}
          </div>
        </div>

        <div className={styles.botao}>
          <Link to="/meuslivros" className={styles.btnmeu}>
            Voltar a Meus Livros
          </Link>

          <div className={styles.navegacao}>
            <button
              type="button"
              onClick={voltarEtapa}
              className={styles.btnmeu}
            >
              Anterior
            </button>

            <button
              type="button"
              onClick={irParaProximaEtapa}
              className={styles.btn2meu}
            >
              Posterior
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
