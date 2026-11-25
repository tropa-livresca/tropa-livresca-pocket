# Frontend React e Vite

Este documento descreve a estrutura, configuração e diretrizes de desenvolvimento do frontend da aplicação Tropa Livresca.

## Visão Geral

O frontend é desenvolvido com React e Vite, oferecendo uma estrutura de desenvolvimento baseada em componentes, atualização automática durante o desenvolvimento (HMR) e análise estática de código com ESLint.

A aplicação é organizada em três áreas principais:

- **Admin:** interfaces e funcionalidades administrativas.
- **Clients:** interfaces e funcionalidades destinadas aos usuários.
- **Common:** componentes, configurações, contextos, hooks, serviços e funcionalidades compartilhadas.

O Vite é responsável pelo servidor de desenvolvimento e pela compilação dos arquivos estáticos utilizados na execução da aplicação.

## Configuração do Vite

O projeto utiliza o Vite como ferramenta de desenvolvimento e build.

O ecossistema disponibiliza diferentes plugins para integração com React:

- `@vitejs/plugin-react`: integração do React com o Vite, incluindo suporte a Fast Refresh.
- `@vitejs/plugin-react-swc`: alternativa que utiliza SWC para transformar o código.

A aplicação deve utilizar o plugin efetivamente configurado no arquivo `vite.config.js`, sem necessidade de manter as duas alternativas simultaneamente.

## Configuração das variáveis de ambiente

Diferentemente de projetos em que o frontend mantém suas próprias credenciais de infraestrutura, o Tropa Livresca centraliza as configurações no arquivo `backend/.env`.

O frontend não necessita de um arquivo `frontend/.env` para acessar o PocketBase, pois a comunicação com o banco de dados é intermediada pela API Express.

As requisições são realizadas por meio dos serviços e configurações da aplicação, utilizando o endereço da API definido para cada ambiente.

### Acesso às configurações

Quando uma variável de ambiente com prefixo `VITE_` for necessária no frontend, ela poderá ser acessada por meio da sintaxe:

```javascript
import.meta.env.VITE_NOME_DA_VARIAVEL;
```

Entretanto, variáveis `VITE_` são incorporadas ao código disponibilizado no navegador. Portanto, não devem conter senhas, chaves privadas, credenciais administrativas ou outras informações sigilosas.

## Comunicação com o backend

O fluxo de comunicação da aplicação segue esta arquitetura:

```text
React + Vite
     |
     | Requisições HTTP
     v
API Express
     |
     | Comunicação com o PocketBase
     v
PocketBase + SQLite
```

O frontend não realiza operações administrativas diretamente no PocketBase. As operações de autenticação, consulta e manipulação de dados são intermediadas pelos serviços do backend, conforme as regras de segurança da aplicação.

## React Compiler

O React Compiler é uma ferramenta de otimização que automatiza determinadas técnicas de memoização de componentes e funções.

Sua utilização depende da configuração do projeto. Não deve ser considerada habilitada apenas pela utilização do React.

Consulte a documentação oficial do React para conhecer os requisitos e procedimentos de configuração.

## Expansão da configuração do ESLint

O ESLint é utilizado para identificar problemas no código e manter a consistência durante o desenvolvimento.

Caso o projeto seja expandido para TypeScript, poderá ser integrado ao `typescript-eslint`, que disponibiliza regras de análise estática específicas para arquivos TypeScript e JavaScript com tipagem.

## Diretrizes de segurança

- Não armazenar credenciais administrativas no frontend.
- Não disponibilizar segredos por meio de variáveis `VITE_`.
- Centralizar as operações de acesso ao banco de dados no backend.
- Manter a autenticação e a validação de permissões sob responsabilidade dos mecanismos de segurança do servidor.
- Utilizar os cookies de sessão e os mecanismos de autenticação implementados pela aplicação.
