# Banco de dados PocketBase

O projeto utiliza o PocketBase como solução para banco de dados, autenticação e armazenamento de arquivos. Ele utiliza SQLite de forma embutida e organiza os dados em _collections_.

## Arquivos relacionados

- [Modelo de dados](./database.md)
- [Hooks e funções](./funcoes.md)
- [Gatilhos de aplicação](./trigger.md)
- [Migrações PocketBase](../../pocketbase/pb_migrations/README.md)
- [Hook de criação de perfil](../../pocketbase/pb_hooks/main.pb.js)

## Estrutura local

```text
pocketbase/
├── pocketbase.exe
├── pb_data/
├── pb_hooks/
└── pb_migrations/
```

- `pocketbase.exe`: executável responsável pelo funcionamento do PocketBase.
- `pb_data`: diretório que armazena o banco SQLite, os arquivos enviados e outros dados persistidos.
- `pb_migrations`: scripts responsáveis pela criação e alteração das collections.
- `pb_hooks`: scripts executados em eventos do PocketBase.

Os arquivos internos do banco, como `data.db`, `auxiliary.db` e seus arquivos WAL/SHM, não devem ser editados diretamente. As alterações na estrutura devem ser realizadas por meio das migrações ou do painel administrativo.

## Inicialização

No Windows, execute os comandos a partir da pasta raiz do projeto.

Para iniciar o PocketBase:

```powershell
cd pocketbase
.\pocketbase.exe serve --http=127.0.0.1:8090
```

As migrações pendentes são aplicadas automaticamente durante a inicialização do servidor.

Caso seja necessário executá-las manualmente, utilize outro terminal:

```powershell
cd pocketbase
.\pocketbase.exe migrate up
```

## Acesso administrativo

Em ambiente local, acesse o painel administrativo:

```text
http://127.0.0.1:8090/_/
```

Na primeira utilização, crie a conta de superusuário para administrar o PocketBase.

## Regras de acesso

As collections possuem regras de acesso que controlam as operações disponíveis para cada usuário:

- `listRule`: permite listar registros.
- `viewRule`: permite visualizar registros individuais.
- `createRule`: permite criar registros.
- `updateRule`: permite atualizar registros.
- `deleteRule`: permite excluir registros.

As regras devem ser configuradas e verificadas de acordo com as permissões previstas para cada funcionalidade. Antes de publicar a aplicação, confirme que nenhuma collection permite acesso indevido a dados ou operações restritas.

As configurações de regras devem ser mantidas de forma consistente com as migrações do projeto.
