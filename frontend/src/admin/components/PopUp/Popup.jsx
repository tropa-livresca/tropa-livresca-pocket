import styles from "./Popup.module.css";
import { FaCheckCircle, FaTimesCircle, FaTimes } from "react-icons/fa";

export default function Popup({
  tipo,
  mensagem,
  conteudo,
  credenciais,
  emailEnviado,
  fechar,
  confirmar,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
}) {
  const sucesso = tipo === "sucesso";
  const ehConfirmacao = typeof confirmar === "function";

  return (
    <div className={styles.container}>
      <div
        className={`${styles.popup} ${sucesso ? styles.sucesso : styles.erro}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-titulo"
      >
        <button
          className={styles.fechar}
          onClick={fechar}
          type="button"
          aria-label="Fechar"
        >
          <FaTimes />
        </button>

        <div className={styles.icone}>
          {sucesso ? <FaCheckCircle /> : <FaTimesCircle />}
        </div>

        <h3 id="popup-titulo">
          {ehConfirmacao ? "Confirmar ação" : sucesso ? "Sucesso!" : "Erro!"}
        </h3>

        <div className={styles.conteudo}>
          {conteudo || <p>{mensagem}</p>}

          {credenciais && (
            <div className={styles.secaoCredenciais}>
              <div className={styles.campoCredencial}>
                <span className={styles.rotuloCredencial}>Usuário</span>
                <strong className={styles.valorCredencial}>
                  {credenciais.usuario}
                </strong>
              </div>

              <div className={styles.campoCredencial}>
                <span className={styles.rotuloCredencial}>
                  Senha temporária
                </span>
                <strong className={styles.valorCredencial}>
                  {credenciais.senhaTemporaria}
                </strong>
              </div>
            </div>
          )}

          {emailEnviado === false && (
            <div className={styles.avisoEmail}>
              Não foi possível enviar o e-mail de notificação. Entregue as
              credenciais ao funcionário por um canal seguro.
            </div>
          )}

          {emailEnviado === true && (
            <div className={styles.sucessoEmail}>
              E-mail de notificação enviado com sucesso.
            </div>
          )}
        </div>

        {ehConfirmacao ? (
          <div className={styles.acoes}>
            <button
              className={styles.btnCancelar}
              onClick={fechar}
              type="button"
            >
              {textoCancelar}
            </button>

            <button
              className={`${styles.btnOk} ${styles.btnConfirmar}`}
              onClick={() => {
                fechar();
                confirmar();
              }}
              type="button"
            >
              {textoConfirmar}
            </button>
          </div>
        ) : (
          <button className={styles.btnOk} onClick={fechar} type="button">
            OK
          </button>
        )}
      </div>
    </div>
  );
}
