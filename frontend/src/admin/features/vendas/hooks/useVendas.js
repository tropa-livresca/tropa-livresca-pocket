import { useState, useCallback } from "react";
import { apiFetch } from "../../../../common/services/api";

const lerErro = async (response, padrao) => {
  try {
    const json = await response.json();
    return json.error || json.message || padrao;
  } catch {
    return padrao;
  }
};

export const useVendas = () => {
  const [vendas, setVendas] = useState([]);
  const [meta, setMeta] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const buscarVendas = useCallback(
    async (
      page = 1,
      limit = 10,
      busca = "",
      statusPagamento = "",
      statusEntrega = "",
      dataInicio = "",
      dataFim = "",
      ordem = "recentes",
    ) => {
      setCarregando(true);
      setErro(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          busca,
          statusPagamento,
          statusEntrega,
          dataInicio,
          dataFim,
          ordem,
        });

        const response = await apiFetch(
          `/api/v1/admin/loja?${params.toString()}`,
          { skipAuthRedirect: true },
        );

        if (!response.ok) {
          throw new Error(
            await lerErro(response, "Não foi possível carregar as vendas."),
          );
        }

        const json = await response.json();

        setVendas(json.data || []);
        setMeta(json.meta || null);

        return {
          data: json.data || [],
          meta: json.meta || null,
        };
      } catch (err) {
        setErro(err.message);
        setVendas([]);
        setMeta(null);

        return {
          data: [],
          meta: null,
        };
      } finally {
        setCarregando(false);
      }
    },
    [],
  );

  const executar = async (endpoint, method, padrao) => {
    const response = await apiFetch(endpoint, {
      method,
      skipAuthRedirect: true,
    });

    return response.ok ? null : lerErro(response, padrao);
  };

  const autorizarRepasse = (vendaId) =>
    executar(
      `/api/v1/admin/movimentacoes/${vendaId}`,
      "PATCH",
      "Não foi possível autorizar o repasse.",
    );

  const enviarPedido = (vendaId) =>
    executar(
      `/api/v1/admin/loja/autorizacao/${vendaId}`,
      "PATCH",
      "Não foi possível marcar como enviado.",
    );

  const marcarEntregue = (vendaId) =>
    executar(
      `/api/v1/admin/loja/entregue/${vendaId}`,
      "POST",
      "Não foi possível marcar como entregue.",
    );

  return {
    vendas,
    meta,
    carregando,
    erro,
    buscarVendas,
    autorizarRepasse,
    enviarPedido,
    marcarEntregue,
  };
};
