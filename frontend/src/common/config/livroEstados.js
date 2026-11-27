export const LIVRO_ESTADO = Object.freeze({
  RASCUNHO: "Rascunho",
  EM_REVISAO: "Em Revisão",
  PUBLICADO: "Publicado",
  NEGADO: "Negado",
  RECALL: "Para Correção",
});

export const ESTADOS_EDITAVEIS = Object.freeze([
  LIVRO_ESTADO.RASCUNHO,
  LIVRO_ESTADO.RECALL,
]);

export const ESTADOS_ENVIAVEIS_REVISAO = Object.freeze([
  LIVRO_ESTADO.RASCUNHO,
  LIVRO_ESTADO.RECALL,
]);
