# Deploy

O projeto Tropa Livresca utiliza uma arquitetura baseada em Node.js, React e PocketBase, com possibilidade de execução em ambiente de desenvolvimento remoto e distribuição portátil para apresentação.

## Arquitetura de execução

- **Backend:** Node.js com Express, responsável pela API e pelas regras de negócio.
- **Frontend:** React com Vite, responsável pela interface da aplicação.
- **Banco de dados:** PocketBase, responsável pelo armazenamento de dados, autenticação e gerenciamento de arquivos.
- **Ambiente de desenvolvimento remoto:** GitHub Codespaces.
- **Versão portátil:** executáveis próprios para Windows, utilizando Node.js SEA e PocketBase.

## GitHub Codespaces

O projeto pode ser executado no GitHub Codespaces, permitindo o desenvolvimento em ambiente remoto.

- O backend disponibiliza a API na porta configurada.
- O frontend é executado pelo servidor de desenvolvimento do Vite.
- O PocketBase disponibiliza os serviços de banco de dados e autenticação.
- As variáveis de ambiente são carregadas a partir de `backend/.env`.

## Versão portátil para Windows

A aplicação também pode ser distribuída para execução local sem exigir a instalação do Node.js no computador de apresentação.

- O `TropaLivresca.exe` inicia o processo de execução da aplicação.
- O arquivo BAT inicializa o PocketBase e o backend.
- O `Backend.exe` executa a API utilizando o runtime do Node.js incorporado.
- O frontend é compilado previamente e servido pelo backend.
- Os dados do PocketBase são mantidos no diretório `pocketbase/pb_data`.

A distribuição deve preservar a estrutura de diretórios, o arquivo `backend/.env`, os executáveis necessários, a compilação do frontend e todo o conteúdo do banco de dados.

## Considerações principais

- O backend centraliza o processamento das requisições e das regras de negócio.
- O frontend realiza as requisições à API do backend.
- O PocketBase deve estar disponível antes da inicialização da API.
- As configurações de ambiente devem corresponder ao ambiente de execução.
- O diretório `pocketbase/pb_data` deve ser preservado para manter os
