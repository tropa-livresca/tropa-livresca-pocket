# Instalação

Este documento descreve a instalação e a configuração local do PocketBase para o projeto Tropa Livresca.

## Pré-requisitos

- Windows com PowerShell.
- Node.js 20 ou superior.
- npm.
- Executável do PocketBase na pasta `pocketbase`.
- Arquivo de configuração `backend/.env`.

## Instalação das dependências

Na raiz do projeto, execute:

```powershell
npm install
```

Esse comando instala as dependências definidas no projeto e nos seus workspaces.

## Configuração do PocketBase

O executável do PocketBase deve estar localizado em:

```text
pocketbase/
└── pocketbase.exe
```

Os dados da aplicação são armazenados no diretório:

```text
pocketbase/
└── pb_data/
```

Esse diretório contém o banco SQLite e os arquivos armazenados pelo PocketBase. Não o exclua durante a instalação se precisar preservar os dados existentes.

## Variáveis de ambiente

As configurações do projeto ficam centralizadas em um único arquivo:

```text
backend/.env
```

A conexão do backend com o PocketBase é configurada pela variável:

```env
POCKETBASE_URL=http://127.0.0.1:8090
```

O backend carrega as variáveis desse arquivo durante sua inicialização.

Não é necessário criar um `frontend/.env` para configurar o PocketBase. O frontend se comunica com a API Express, enquanto o backend realiza as operações de persistência e autenticação no PocketBase.

Não exponha credenciais administrativas, senhas ou segredos no frontend nem em variáveis com prefixo `VITE_`.

## Inicialização do PocketBase

Para iniciar o PocketBase manualmente durante o desenvolvimento, abra um terminal na raiz do projeto e execute:

```powershell
cd pocketbase
.\pocketbase.exe serve --http=127.0.0.1:8090
```

O servidor ficará disponível em:

```text
http://127.0.0.1:8090
```

O painel administrativo pode ser acessado em:

[http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/)

No primeiro acesso, configure a conta de superusuário. As credenciais devem permanecer protegidas e fora do repositório.

**Importante:** mantenha o PocketBase em execução enquanto o backend precisar acessar o banco de dados.

## Migrações

As migrações JavaScript ficam armazenadas em:

```text
pocketbase/
└── pb_migrations/
```

O PocketBase aplica automaticamente as migrações pendentes durante a inicialização.

Para aplicá-las manualmente, com o servidor parado, execute:

```powershell
cd pocketbase
.\pocketbase.exe migrate up
```

Para gerar uma migração a partir das alterações nas collections:

```powershell
.\pocketbase.exe migrate collections
```

As migrações devem ser mantidas no projeto e versionadas junto com o código-fonte.

## Execução da aplicação

A execução local envolve três componentes:

1. **PocketBase:** responsável pelo banco de dados, autenticação e armazenamento de arquivos.
2. **Backend Express:** responsável pela API, regras de negócio e comunicação com o PocketBase.
3. **Frontend React:** responsável pela interface e comunicação com a API do backend.

Durante o desenvolvimento, mantenha o PocketBase em execução e inicie o backend e o frontend conforme os scripts definidos na raiz do projeto.

Na versão portátil para Windows, a inicialização é automatizada pelo lançador do projeto, que executa os componentes necessários sem exigir que a pessoa usuária inicie cada serviço manualmente.

## Portas locais

| Componente            | Endereço                   |
| --------------------- | -------------------------- |
| Frontend Vite         | `http://localhost:5173`    |
| Backend Express       | `http://localhost:3000`    |
| PocketBase            | `http://127.0.0.1:8090`    |
| Painel administrativo | `http://127.0.0.1:8090/_/` |

## Observações

- O PocketBase precisa estar disponível antes das operações do backend que dependem dele.
- Não execute duas instâncias do PocketBase utilizando simultaneamente o mesmo diretório `pb_data`.
- Preserve o diretório `pb_data` para manter o banco e os arquivos da aplicação.
- Mantenha o arquivo `backend/.env` fora do controle de versão.
- Em ambientes como GitHub Codespaces, os endereços e configurações de rede devem respeitar as variáveis específicas desse ambiente.
