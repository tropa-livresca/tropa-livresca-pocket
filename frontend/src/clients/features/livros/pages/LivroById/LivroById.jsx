import { useLivros } from "../../../../hooks/useLivros";
import styles from "./LivroById.module.css";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Carregando from "../../../../components/Carregando/Carregando";
import { useAvaliacoes } from "../../../loja/hooks/useAvaliacoes";
import ResumoAvaliacao from "../../../loja/components/Avaliacao/ResumoAvaliacao";
import AbasLivro from "../../../loja/components/AbasLivro/AbasLivro";
import {
  FaBookOpen,
  FaCalendarAlt,
  FaUsers,
  FaLanguage,
  FaShoppingCart,
  FaShieldAlt,
  FaTruck,
  FaUndo,
} from "react-icons/fa";

export default function LivroById() {
  const { id } = useParams();
  const avaliacoes = useAvaliacoes();
  const { resumo, buscarResumo } = avaliacoes;

  useEffect(() => {
    buscarResumo(id);
  }, [id, buscarResumo]);

  const { autor, colaboradores, livro, BuscarDetalhesLivro, carregando } =
    useLivros();

  const formatarData = (data) => {
    if (!data) return "";

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
      return "";
    }

    return dataConvertida.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (id) {
      BuscarDetalhesLivro(id);
    }
  }, [id, BuscarDetalhesLivro]);

  if (carregando) {
    return <Carregando mensagem="Carregando livro..." />;
  }

  if (!livro) {
    return <p className={styles.naoEncontrado}>Livro não encontrado.</p>;
  }

  const capaFrente = livro?.capa?.frente;

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.capaContainer}>
          {capaFrente ? (
            <img className={styles.foto} src={capaFrente} alt={livro.titulo} />
          ) : (
            <div className={styles.semfoto}>Sem foto</div>
          )}
        </div>

        <div className={styles.heroinfo}>
          <h1 className={styles.titulo}>{livro.titulo}</h1>

          {livro.subtitulo && (
            <h2 className={styles.subtitulo}>{livro.subtitulo}</h2>
          )}

          <div className={styles.infoTopo}>
            {livro.genero && (
              <span className={styles.genero}>{livro.genero}</span>
            )}

            <ResumoAvaliacao media={resumo.media} total={resumo.total} />

            <div className={styles.tags}>
              {livro.idioma && <span>{livro.idioma}</span>}
              {livro.categoria && <span>{livro.categoria}</span>}
            </div>
          </div>

          <div className={styles.informacoes}>
            {autor && (
              <Link
                to={`/autores/${autor.id}`}
                className={`${styles.informacaoAutor} ${styles.linkAutor}`}
              >
                {autor.imagem ? (
                  <img
                    className={styles.fotoAutor}
                    src={autor.imagem}
                    alt={`Foto de ${autor.nome}`}
                  />
                ) : (
                  <div className={styles.semFotoAutor}>Sem foto</div>
                )}

                <div className={styles.autorDados}>
                  <strong>Autor</strong>
                  <p>{autor.nome}</p>
                </div>
              </Link>
            )}

            <div
              className={`${styles.informacao} ${styles.informacaoPublicado}`}
            >
              <div className={styles.iconeInformacao}>
                <FaBookOpen />
              </div>

              <div>
                <strong>Publicado por</strong>
                <p>{autor?.nome || "Autor desconhecido"}</p>
              </div>
            </div>

            <div className={`${styles.informacao} ${styles.informacaoData}`}>
              <div className={styles.iconeInformacao}>
                <FaCalendarAlt />
              </div>

              <div>
                <strong>Data de publicação</strong>
                <p className={styles.numero}>
                  {formatarData(livro.data_de_publicacao)}
                </p>
              </div>
            </div>

            <div className={`${styles.informacao} ${styles.informacaoPublico}`}>
              <div className={styles.iconeInformacao}>
                <FaUsers />
              </div>

              <div>
                <strong>Categoria</strong>
                <p>{livro.categoria || "Não informado"}</p>
              </div>
            </div>

            <div className={`${styles.informacao} ${styles.informacaoIdioma}`}>
              <div className={styles.iconeInformacao}>
                <FaLanguage />
              </div>

              <div>
                <strong>Idioma</strong>
                <p>{livro.idioma || "Não informado"}</p>
              </div>
            </div>

            {colaboradores?.map((colaborador, index) => (
              <div
                className={styles.informacao}
                key={`${colaborador.nome}-${index}`}
              >
                <div className={styles.iconeInformacao}>
                  <FaUsers />
                </div>

                <div>
                  <strong>Colaborador(a)</strong>
                  <p>
                    {colaborador.nome} {colaborador.sobrenome} (
                    {colaborador.funcao || "Colaborador"})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.conteudo}>
        <div className={styles.conteudoPrincipal}>
          <AbasLivro
            livroId={id}
            descricao={livro.descricao}
            autor={autor}
            avaliacoes={avaliacoes}
          />
        </div>

        <aside className={styles.compra}>
          <p className={styles.chamadaLoja}>
            Veja os formatos e preços disponíveis na loja.
          </p>

          <Link to={`/loja/livro/${id}`} className={styles.btnCarrinho}>
            <FaShoppingCart />
            Comprar na loja
          </Link>

          <div className={styles.divisor}></div>

          <div className={styles.beneficio}>
            <FaTruck />
            <span>Entrega para todo o Brasil</span>
          </div>

          <div className={styles.beneficio}>
            <FaShieldAlt />
            <span>
              Compra <span className={styles.numero}>100%</span> segura
            </span>
          </div>

          <div className={styles.beneficio}>
            <FaUndo />
            <span>
              Troca e devolução em até <span className={styles.numero}>7</span>{" "}
              dias
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}