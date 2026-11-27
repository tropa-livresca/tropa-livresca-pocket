import styles from "./Carrinho.module.css";
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useCarrinho } from "../../hooks/useCarrinho";
import { useEndereco } from "../../../perfil/hooks/useEndereco";
import { useEffect, useState } from "react";

export default function Carrinho() {
  const navigate = useNavigate();

  const {
    limparCarrinho,
    calcularFrete,
    frete,
    itens,
    excluirItem,
    removerQuantidade,
    adicionarItem,
  } = useCarrinho();

  const { enderecos = [], BuscarEnderecos } = useEndereco();

  const [modDeEntrega, setModDeEntrega] = useState("");
  const [erro, setErro] = useState("");

  // Verifica se existem livros físicos no carrinho.
  const possuiLivroFisico = itens.some((item) => item.tipo === "Físico");

  // Verifica se o usuário possui pelo menos um endereço.
  const possuiEndereco = enderecos.length > 0;

  const precisaCadastrarEndereco = possuiLivroFisico && !possuiEndereco;

  // Valida os preços e as quantidades dos produtos.
  const carrinhoValido = itens.every((item) => {
    const preco = Number(item.preco);
    const quantidade = Number(item.quantidade);

    return (
      Number.isFinite(preco) &&
      preco >= 0 &&
      Number.isInteger(quantidade) &&
      quantidade > 0
    );
  });

  // Calcula o subtotal sem permitir valores inválidos.
  const subtotalSeguro = itens.reduce((total, item) => {
    const preco = Number(item.preco);
    const quantidade = Number(item.quantidade);

    if (
      !Number.isFinite(preco) ||
      preco < 0 ||
      !Number.isInteger(quantidade) ||
      quantidade <= 0
    ) {
      return total;
    }

    return total + preco * quantidade;
  }, 0);

  // Obtém o valor da modalidade selecionada.
  const freteEscolhido =
    modDeEntrega === "sedex"
      ? Number(frete?.precoSedex)
      : modDeEntrega === "pac"
        ? Number(frete?.precoPac)
        : 0;

  // Valida a disponibilidade e o valor do frete.
  const freteValido =
    !possuiLivroFisico ||
    (frete !== null &&
      (modDeEntrega === "sedex" || modDeEntrega === "pac") &&
      Number.isFinite(freteEscolhido) &&
      freteEscolhido >= 0);

  const totalFinal = subtotalSeguro + freteEscolhido;

  const totalValido =
    carrinhoValido &&
    Number.isFinite(totalFinal) &&
    totalFinal >= 0 &&
    freteValido;

  // Busca os endereços cadastrados.
  useEffect(() => {
    BuscarEnderecos();
  }, [BuscarEnderecos]);

  // Calcula o frete quando houver livros físicos.
  useEffect(() => {
    if (possuiLivroFisico) {
      calcularFrete(itens);
    } else {
      setModDeEntrega("");
    }
  }, [itens, calcularFrete, possuiLivroFisico]);

  const handleConcluirCompra = () => {
    setErro("");

    if (itens.length === 0) {
      setErro("Seu carrinho está vazio.");
      return;
    }

    if (!carrinhoValido) {
      setErro("Existem produtos com preços ou quantidades inválidos.");
      return;
    }

    if (precisaCadastrarEndereco) {
      setErro("Cadastre um endereço para continuar a compra.");
      return;
    }

    if (possuiLivroFisico && !frete) {
      setErro("Não foi possível calcular o frete.");
      return;
    }

    if (possuiLivroFisico && !modDeEntrega) {
      setErro("Selecione uma modalidade de entrega.");
      return;
    }

    if (!totalValido) {
      setErro("Não foi possível calcular o valor total da compra.");
      return;
    }

    if (possuiLivroFisico) {
      navigate(`/checkout/${freteEscolhido}/${modDeEntrega}`);
      return;
    }

    navigate("/checkout/0/digital");
  };

  return (
    <main>
      <div className={styles.topo}>
        <h1 className={styles.titulo}>Carrinho</h1>
        <p>Confira seus livros e finalize seu pedido.</p>
      </div>

      <div className={styles.container}>
        <div className={styles.conteudo}>
          {itens.length === 0 ? (
            <section
              className={styles.listaProdutos2}
              style={{
                textAlign: "center",
                padding: "40px 0",
              }}
            >
              <p>Seu carrinho está vazio no momento.</p>

              <Link
                to="/loja"
                className={styles.continuar2}
                style={{
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                <FiArrowLeft /> Voltar para a Loja
              </Link>
            </section>
          ) : (
            <section className={styles.listaProdutos}>
              <div className={styles.cabecalhoProdutos}>
                <span>Produto</span>
                <span>Preço</span>
                <span>Quantidade</span>
                <span>Total</span>
                <span></span>
              </div>

              {itens.map((item) => {
                const itemChave = `${item.id}-${item.tipo || "unico"}`;

                const preco = Number(item.preco);
                const quantidade = Number(item.quantidade);

                const totalItem =
                  Number.isFinite(preco) &&
                  Number.isInteger(quantidade) &&
                  preco >= 0 &&
                  quantidade > 0
                    ? preco * quantidade
                    : null;

                return (
                  <div key={itemChave} className={styles.produto}>
                    <div className={styles.produtoInfo}>
                      <Link
                        to={`/loja/livro/${item.id}`}
                        className={styles.capa}
                      >
                        {item.capa ? (
                          <img src={item.capa} alt={`Capa de ${item.titulo}`} />
                        ) : (
                          <div className={styles.semImagem}>Sem imagem</div>
                        )}
                      </Link>

                      <div className={styles.desc}>
                        <Link
                          to={`/loja/livro/${item.id}`}
                          className={styles.nome}
                        >
                          {item.titulo}
                        </Link>

                        <p className={styles.autor}>
                          {item.autor || "Autor Desconhecido"}
                        </p>

                        {item.tipo && (
                          <small
                            style={{
                              color: "#666",
                              display: "block",
                              marginTop: "4px",
                            }}
                          >
                            Formato:{" "}
                            <strong>
                              {item.tipo === "Físico" ? "Físico" : "E-book"}
                            </strong>
                          </small>
                        )}
                      </div>
                    </div>

                    <strong className={styles.preco}>
                      {Number.isFinite(preco) && preco >= 0
                        ? `R$ ${preco.toFixed(2).replace(".", ",")}`
                        : "—"}
                    </strong>

                    {item.tipo === "Físico" ? (
                      <div className={styles.quantidade}>
                        <div className={styles.redondo}>
                          <button
                            type="button"
                            onClick={() =>
                              removerQuantidade(item.id, item.tipo)
                            }
                          >
                            <FiMinus />
                          </button>

                          <span>{item.quantidade}</span>

                          <button
                            type="button"
                            onClick={() =>
                              adicionarItem({
                                ...item,
                                quantidade: 1,
                              })
                            }
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.quantidade}>
                        <div className={styles.redondo}>
                          <button type="button" disabled>
                            <FiMinus />
                          </button>

                          <span>1</span>

                          <button type="button" disabled>
                            <FiPlus />
                          </button>
                        </div>
                      </div>
                    )}

                    <strong className={styles.totalProduto}>
                      {totalItem !== null
                        ? `R$ ${totalItem.toFixed(2).replace(".", ",")}`
                        : "—"}
                    </strong>

                    <button
                      type="button"
                      className={styles.excluir}
                      onClick={() => excluirItem(item.id, item.tipo)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                );
              })}

              <div className={styles.lim}>
                <button
                  type="button"
                  onClick={limparCarrinho}
                  className={styles.limpar}
                >
                  Limpar todo o carrinho
                </button>
              </div>
            </section>
          )}

          <aside className={styles.resumo}>
            <h2>Resumo</h2>

            <div className={styles.subtotal}>
              <span className={styles.sub}>Subtotal</span>

              <strong>
                {carrinhoValido
                  ? `R$ ${subtotalSeguro.toFixed(2).replace(".", ",")}`
                  : "—"}
              </strong>
            </div>

            <div className={styles.cep}>
              <span className={styles.sub}>Frete</span>

              {possuiLivroFisico ? (
                frete !== null ? (
                  <>
                    <div>
                      <input
                        type="radio"
                        value="sedex"
                        name="modalidade"
                        checked={modDeEntrega === "sedex"}
                        onChange={() => {
                          setModDeEntrega("sedex");
                          setErro("");
                        }}
                      />

                      <h5>Sedex</h5>

                      <strong>
                        {Number.isFinite(Number(frete.precoSedex))
                          ? `R$ ${Number(frete.precoSedex).toFixed(2).replace(".", ",")}`
                          : "Indisponível"}
                      </strong>
                    </div>

                    <div>
                      <input
                        type="radio"
                        value="pac"
                        name="modalidade"
                        checked={modDeEntrega === "pac"}
                        onChange={() => {
                          setModDeEntrega("pac");
                          setErro("");
                        }}
                      />

                      <h5>PAC</h5>

                      <strong>
                        {Number.isFinite(Number(frete.precoPac))
                          ? `R$ ${Number(frete.precoPac).toFixed(2).replace(".", ",")}`
                          : "Indisponível"}
                      </strong>
                    </div>
                  </>
                ) : (
                  <p>
                    {precisaCadastrarEndereco
                      ? "Cadastre um endereço para calcular o frete."
                      : "Calculando frete..."}
                  </p>
                )
              ) : (
                <div>Livro Digital</div>
              )}
            </div>

            <div className={styles.Total}>
              <span className={styles.sub}>Total</span>

              <strong>
                {totalValido
                  ? `R$ ${totalFinal.toFixed(2).replace(".", ",")}`
                  : "—"}
              </strong>
            </div>

            {precisaCadastrarEndereco && (
              <div className={styles.enderecoObrigatorio}>
                <p>
                  Para comprar livros físicos, você precisa cadastrar um
                  endereço de entrega.
                </p>

                <Link to="/perfil/endereco" className={styles.finalizar}>
                  Cadastrar endereço
                </Link>
              </div>
            )}

            {possuiLivroFisico && possuiEndereco && (
              <button
                type="button"
                className={styles.finalizar}
                disabled={itens.length === 0 || !carrinhoValido || !totalValido}
                onClick={handleConcluirCompra}
              >
                Concluir minha compra
              </button>
            )}

            {erro && <h5>{erro}</h5>}

            <Link to="/loja" className={styles.continuar}>
              <FiArrowLeft />
              Continuar comprando
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
