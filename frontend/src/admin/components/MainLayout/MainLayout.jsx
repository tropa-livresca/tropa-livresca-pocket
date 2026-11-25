import { Outlet } from "react-router-dom";
import Cabecalho from "../Cabecalho/Cabecalho";
import NavBarLateral from "../NavBarLateral/NavBarLateral";
import { useLoginAdmin } from "../../../common/features/autenticacao/hooks/useLoginAdmin";
import { useAdmin } from "../../../common/hooks/useAdmin";

import styles from "./MainLayout.module.css";

export default function MainLayout() {
  const { signoutAdmin } = useLoginAdmin();
  const { user } = useAdmin();

  const primeiroAcessoConcluido = user && !user.primeiro_acesso;

  return (
    <div className={styles.layout}>
      <Cabecalho signoutAdmin={signoutAdmin} />

      <div className={styles.areaPrincipal}>
        {primeiroAcessoConcluido && <NavBarLateral />}

        <main className={styles.conteudo}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
