import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useMeusLivros } from "../../hooks/useMeusLivros.js";
import { ESTADOS_EDITAVEIS } from "../../../../../common/config/livroEstados";
import styles from "./RevisaoLivro.module.css";
import Carregando from "../../../../components/Carregando/Carregando";

export default function RevisaoLivro() {
  const { id } = useParams();
  const { buscarRevisaoLivro, carregando, livroSelecionado } = useMeusLivros();

  useEffect(() => {
    if (id) {
      buscarRevisaoLivro(id);
    }
  }, [id, buscarRevisaoLivro]);

  if (carregando) {
    return <Carregando mensagem="Carregando revisões..." />;
  }

  if (!livroSelecionado) {
    return <div className={styles.error}>Livro não encontrado</div>;
  }

  const { titulo, estado, subtitulo, revisoes = [] } = livroSelecionado;

  return (
    <main>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.titulo}>{titulo}</h1>
          {subtitulo && <p className={styles.subtitulo}>{subtitulo}</p>}
        </div>

        <div className={styles.headerActions}>
          {ESTADOS_EDITAVEIS.includes(estado) && (
            <Link
              to={`/editar-livro/${id}`}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              Editar Livro
            </Link>
          )}

          <Link
            to="/meuslivros"
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            Voltar ao Painel
          </Link>

          <Link
            to={`/visualizar-livro/${id}`}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            Visualizar Livro
          </Link>
        </div>
      </header>

      <div className={styles.container}>
        <section className={styles.layoutGrid}>
          <div className={styles.mainContent}>
            {revisoes.length === 0 ? (
              <div className={styles.card}>
                <h2>Revisões</h2>
                <p className={styles.vazio}>
                  Nenhuma revisão encontrada para este livro.
                </p>
              </div>
            ) : (
              revisoes.map((revisao) => (
                <div className={styles.card} key={revisao.id}>
                  <h2>Revisão</h2>

                  <p className={styles.descricao}>
                    {revisao.apontamento || "Nenhuma descrição informada."}
                  </p>

                  {revisao.arquivoUrl && (
                    <div className={styles.pdfWrapper}>
                      <object
                        data={revisao.arquivoUrl}
                        type="application/pdf"
                        width="100%"
                        height="650px"
                      >
                        <div className={styles.vaziodisplay}>
                          <p className={styles.vazio}>
                            Seu navegador não suporta a exibição de PDFs.{" "}
                            <p className={styles.click}>
                              <a
                                href={revisao.arquivoUrl}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className={styles.btnlivro}
                              >
                                Clique aqui para baixar o arquivo.
                              </a>
                            </p>
                          </p>
                        </div>
                      </object>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
