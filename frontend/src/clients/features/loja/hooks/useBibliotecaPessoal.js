import { useState, useCallback } from "react";
import { apiFetch } from "../../../../common/services/api";

export const useBibliotecaPessoal = () => {
  const [livros, setLivros] = useState([]);
  const [meta, setMeta] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [baixando, setBaixando] = useState(false);

  const buscarMeusLivros = useCallback(
    async (
      page = 1,
      limit = 12,
      busca = "",
      filtro = "",
      ordem = "",
      categoria = "",
      idioma = "",
      livroId = "",
    ) => {
      setCarregando(true);
      setErro(null);

      try {
        const parametros = {
          page: String(page),
          limit: String(limit),
          busca,
          filtro,
          ordem,
          categoria,
          idioma,
        };

        if (livroId) parametros.livroId = String(livroId);

        const params = new URLSearchParams(parametros);
        const response = await apiFetch(
          `/api/v1/clients/loja/bibliotecapessoal?${params.toString()}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              "Não foi possível carregar sua biblioteca.",
          );
        }

        setLivros(data.livros || []);
        setMeta(data.meta || null);

        return data.livros || [];
      } catch (error) {
        setErro(error.message);
        setLivros([]);
        setMeta(null);
        return null;
      } finally {
        setCarregando(false);
      }
    },
    [],
  );

  const baixarLivroDigital = useCallback(async (livroId) => {
    setBaixando(true);
    setErro(null);

    try {
      const response = await apiFetch(
        `/api/v1/clients/loja/bibliotecapessoal/${encodeURIComponent(livroId)}/download`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            data.mensagem ||
            "Não foi possível baixar o livro.",
        );
      }

      const arquivos = data.resultado?.arquivos || [];

      if (!arquivos.length) {
        throw new Error("Nenhum arquivo disponível para download.");
      }

      arquivos.forEach((arquivo) => {
        const link = document.createElement("a");
        link.href = arquivo.url;
        link.download = arquivo.nome || "";
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      return true;
    } catch (error) {
      setErro(error.message);
      return false;
    } finally {
      setBaixando(false);
    }
  }, []);

  return {
    livros,
    meta,
    buscarMeusLivros,
    baixarLivroDigital,
    carregando,
    baixando,
    erro,
  };
};
