# Tropa Livresca

Aplicação web de uma editora fictícia, desenvolvida como um monorepo que reúne frontend, backend, testes, banco de dados, documentação e arquivos para geração de uma versão portátil para Windows.

## Estrutura do projeto

```text
tropa-livresca/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── livros/
│   │   │   │   ├── loja/
│   │   │   │   ├── movimentacoes/
│   │   │   │   ├── revisao/
│   │   │   │   └── usuarios/
│   │   │   ├── clients/
│   │   │   │   ├── autopublicacao/
│   │   │   │   ├── autores/
│   │   │   │   ├── avaliacoes/
│   │   │   │   ├── enderecos/
│   │   │   │   ├── livro/
│   │   │   │   ├── loja/
│   │   │   │   ├── movimentacoes/
│   │   │   │   ├── perfil/
│   │   │   │   └── suporte/
│   │   │   └── common/
│   │   │       ├── auth/
│   │   │       ├── config/
│   │   │       ├── middlewares/
│   │   │       ├── models/
│   │   │       └── utils/
│   │   ├── api.js
│   │   └── portable.js
│   ├── build/
│   │   └── backend.cjs
│   ├── tests/
│   │   ├── fixtures/
│   │   ├── helpers/
│   │   ├── integration/
│   │   │   └── routes/
│   │   ├── mocks/
│   │   └── setup/
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   └── hooks/
│   │   ├── clients/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── features/
│   │   │   └── hooks/
│   │   ├── common/
│   │   │   ├── components/
│   │   │   ├── config/
│   │   │   ├── context/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── images/
│   │   │   ├── lib/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── dist/
├── pocketbase/
│   ├── pocketbase.exe
│   ├── pb_data/
│   ├── pb_hooks/
│   └── pb_migrations/
├── docs/
│   ├── api/
│   ├── database/
│   ├── diagramas/
│   ├── funcionalidades/
│   ├── arquitetura.md
│   ├── autenticacao.md
│   ├── deploy.md
|   ├── portabilidade.md
│   └── instalacao.md
├── TropaLivresca.ico
├── iniciar.bat
├── encerrar.bat
├── TropaLivresca.exe
├── Backend.exe
├── package.json
├── package-lock.json
├── CONTRIBUTING
└── LICENSE
```

_Observação: os arquivos e diretórios de compilação e distribuição são gerados durante o processo de portabilidade. Nem todos precisam existir simultaneamente no ambiente de desenvolvimento._

## Tecnologias

- **Frontend:** React e Vite.
- **Backend:** Node.js e Express.
- **Banco de dados:** PocketBase, com SQLite embutido.
- **Autenticação:** PocketBase e JWT para autenticação administrativa.
- **Armazenamento:** sistema de arquivos gerenciado pelo PocketBase.
- **Envio de e-mails:** Nodemailer.
- **Testes:** estrutura de testes unitários e de integração.

## Aplicação

- **`backend/src/api`:** reúne os endpoints da API, organizados por contexto, como administração, clientes e funcionalidades compartilhadas.
- **`backend/src/portable.js`:** prepara a inicialização do backend na versão empacotada.
- **`backend/tests`:** agrupa os testes, com diretórios para fixtures, helpers, integração, mocks e configurações.
- **`frontend/src`:** contém as interfaces da aplicação, organizadas entre as áreas administrativa, de clientes e componentes comuns.
- **`frontend/dist`:** armazena os arquivos estáticos gerados pela compilação do frontend.
- **`pocketbase`:** contém o executável, os dados persistidos, os hooks e as migrações do banco de dados.
- **`docs`:** reúne a documentação de instalação, arquitetura, autenticação, API, banco de dados e funcionalidades.

## Geração da versão portátil

O projeto possui arquivos específicos para preparar a distribuição portátil para Windows.

- **`backend/src/portable.js`:** prepara o carregamento das configurações e a inicialização do backend empacotado.
- **`backend/build/backend.cjs`:** arquivo intermediário gerado durante a preparação do backend.
- **`TropaLivresca.ico`:** ícone utilizado na geração do inicializador.
- **`TropaLivresca.bat`:** inicia os serviços necessários para executar a aplicação.
- **`Backend.exe`:** executável do backend, empacotado para dispensar a instalação do Node.js no computador de destino.
- **`TropaLivresca.exe`:** inicializador da aplicação, gerado a partir do arquivo BAT.

### Componentes da distribuição

A versão portátil reúne:

- Frontend compilado em `frontend/dist`.
- Backend empacotado em `Backend.exe`.
- Executável do PocketBase em `pocketbase/pocketbase.exe`.
- Banco de dados e arquivos persistidos em `pocketbase/pb_data`.
- Migrações em `pocketbase/pb_migrations`.
- Configurações externas em `backend/.env`.
- Arquivos de inicialização e encerramento.

O inicializador executa o PocketBase e o backend, disponibilizando a aplicação pelo navegador. Os caminhos são definidos de forma relativa à pasta da distribuição, permitindo executar o sistema a partir de diferentes diretórios ou unidades de armazenamento.

## Executar em desenvolvimento

Na raiz do projeto, instale as dependências:

```bash
npm install
```

Em seguida, inicie os serviços conforme os comandos definidos no `package.json`:

```bash
npm run dev
```

O ambiente de desenvolvimento utiliza o frontend, o backend e o PocketBase, executados em seus respectivos serviços.

Para consultar os procedimentos de configuração, inicialização e execução, acesse [docs/instalacao.md](docs/instalacao.md).

Para gerar a versão portátil, consulte [docs/portabilidade.md](docs/portabilidade.md).
