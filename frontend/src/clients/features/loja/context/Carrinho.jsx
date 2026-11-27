import { useState, useEffect, useCallback } from "react";
import { CarrinhoContext } from "./CarrinhoContext";
import { apiFetch } from "../../../../common/services/api";

export const CarrinhoProvider = ({ children }) => {
  const [carregando, setCarregando] = useState(false);
  const [frete, setFrete] = useState(0);

  const [itens, setItens] = useState(() => {
    try {
      const salvo = localStorage.getItem("@loja-livros:carrinho");
      return salvo ? JSON.parse(salvo) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("@loja-livros:carrinho", JSON.stringify(itens));
  }, [itens]);

  const adicionarItem = (produto) => {
    const produtoNormalizado = {
      ...produto,
      id: String(produto.id ?? "").trim(),
      quantidade: Number(produto.quantidade) || 1,
    };

    if (!produtoNormalizado.id) {
      console.error("Produto sem identificador:", produto);
      return;
    }

    setItens((itensAtuais) => {
      const itemExistente = itensAtuais.find(
        (item) =>
          item.id === produtoNormalizado.id &&
          item.tipo === produtoNormalizado.tipo,
      );

      if (itemExistente) {
        return itensAtuais.map((item) =>
          item.id === produtoNormalizado.id &&
          item.tipo === produtoNormalizado.tipo &&
          item.tipo === "Físico"
            ? {
                ...item,
                quantidade:
                  Number(item.quantidade) + produtoNormalizado.quantidade,
              }
            : item,
        );
      }

      return [...itensAtuais, produtoNormalizado];
    });
  };

  const removerQuantidade = (id, tipo) => {
    setItens((itensAtuais) => {
      const itemExistente = itensAtuais.find(
        (item) => item.id === id && item.tipo === tipo,
      );

      if (!itemExistente) return itensAtuais;

      if (itemExistente.quantidade === 1) {
        return itensAtuais.filter(
          (item) => !(item.id === id && item.tipo === tipo),
        );
      }

      return itensAtuais.map((item) =>
        item.id === id && item.tipo === tipo
          ? { ...item, quantidade: item.quantidade - 1 }
          : item,
      );
    });
  };

  const excluirItem = (id, tipo) => {
    setItens((itensAtuais) =>
      itensAtuais.filter((item) => !(item.id === id && item.tipo === tipo)),
    );
  };

  const calcularFrete = useCallback(async (produtos) => {
    const produtosFisicos = produtos
      .filter((produto) => produto.tipo === "Físico")
      .map((produto) => ({
        tipo: produto.tipo,
        quantidade: Number(produto.quantidade),
      }))
      .filter(
        (produto) =>
          Number.isInteger(produto.quantidade) && produto.quantidade > 0,
      );

    if (produtosFisicos.length === 0) {
      setFrete(null);
      setCarregando(false);
      return;
    }

    setCarregando(true);

    try {
      const queryProdutos = encodeURIComponent(JSON.stringify(produtosFisicos));

      const response = await apiFetch(
        `/api/v1/clients/loja/frete?itensVenda=${queryProdutos}`,
      );

      if (!response.ok) {
        throw new Error(response.error || "Não foi possível calcular o frete.");
      }

      const res = await response.json();

      if (!Array.isArray(res.frete) || res.frete.length < 2) {
        throw new Error("Resposta de frete inválida.");
      }

      if (!Array.isArray(res.frete) || res.frete.length < 2) {
        throw new Error("Opções de frete indisponíveis.");
      }

      setFrete({
        precoPac: Number(res.frete[0].preco),
        precoSedex: Number(res.frete[1].preco),
      });
    } catch (err) {
      console.error("Erro ao calcular frete:", err);
      setFrete(null);
    } finally {
      setCarregando(false);
    }
  }, []);

  const limparCarrinho = () => setItens([]);

  const quantidadeTotal = itens.reduce(
    (acc, item) => acc + Number(item.quantidade),
    0,
  );
  const valorSubtotal = itens.reduce(
    (acc, item) => acc + item.preco * Number(item.quantidade),
    0,
  );

  const temFisico = itens.some((item) => item.tipo === "Físico");
  const valorFrete = temFisico && valorSubtotal < 150 ? 15.0 : 0.0;
  const valorTotal = valorSubtotal + valorFrete;

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        carregando,
        adicionarItem,
        removerQuantidade,
        excluirItem,
        limparCarrinho,
        calcularFrete,
        quantidadeTotal,
        valorSubtotal,
        valorFrete,
        valorTotal,
        frete,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
};
