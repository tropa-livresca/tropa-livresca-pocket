# Modelo de dados PocketBase

O modelo de dados da Tropa Livresca foi adaptado do PostgreSQL/Supabase para o PocketBase. Os registros são armazenados em um banco SQLite, e cada registro possui um identificador textual (`id`) gerado automaticamente pelo PocketBase.

O PocketBase também gerencia os arquivos enviados à aplicação, como imagens de perfil, capas, manuscritos e documentos de revisão.

## Collections principais

| Collection                  | Tipo | Finalidade                                               |
| --------------------------- | ---- | -------------------------------------------------------- |
| `users_profile`             | Auth | Autenticação, perfil, contato e privilégios dos usuários |
| `livros`                    | Base | Livros e metadados editoriais                            |
| `vendas`                    | Base | Pedidos e informações de pagamento e entrega             |
| `itens_venda`               | Base | Livros e quantidades associados às vendas                |
| `avaliacoes`                | Base | Avaliações dos livros                                    |
| `movimentacoes_financeiras` | Base | Registro de movimentações financeiras                    |
| `enderecos`                 | Base | Endereços dos usuários                                   |
| `revisoes`                  | Base | Registros de revisão dos livros                          |

Além dessas collections, o PocketBase mantém collections internas de autenticação, como `_superusers`, `_authOrigins`, `_externalAuths`, `_mfas` e `_otps`. Elas são gerenciadas pelo próprio sistema e não fazem parte do modelo funcional da aplicação.

## Identificadores

O PocketBase utiliza identificadores textuais para os registros. Nas collections do projeto, o campo `id` é gerado automaticamente e possui 15 caracteres.

Os identificadores anteriores do PostgreSQL não são convertidos automaticamente para os novos IDs do PocketBase.

Em uma eventual importação de dados existentes:

1. Preserve os identificadores antigos em campos auxiliares, caso seja necessário manter a rastreabilidade.
2. Importe primeiro os registros de usuários.
3. Importe os registros das demais collections.
4. Atualize os campos de relação (`relation`) para utilizar os novos IDs gerados pelo PocketBase.

## `users_profile`

É a collection de autenticação nativa da aplicação. Além dos campos de autenticação gerenciados pelo PocketBase, contém informações de perfil e controle de acesso.

| Campo             | Tipo     | Uso                                           |
| ----------------- | -------- | --------------------------------------------- |
| `id`              | text     | Identificador do registro                     |
| `email`           | email    | E-mail de autenticação                        |
| `password`        | password | Senha de autenticação                         |
| `tokenKey`        | text     | Chave interna de autenticação                 |
| `emailVisibility` | bool     | Visibilidade do e-mail                        |
| `verified`        | bool     | Indica se o e-mail foi verificado             |
| `nome`            | text     | Nome                                          |
| `sobrenome`       | text     | Sobrenome                                     |
| `telefone`        | text     | Contato                                       |
| `imagem`          | file     | Imagem do perfil                              |
| `descricao`       | text     | Descrição do perfil                           |
| `redes_sociais`   | json     | Redes sociais                                 |
| `is_admin`        | bool     | Indica acesso administrativo                  |
| `senha_admin`     | text     | Campo relacionado à credencial administrativa |
| `primeiro_acesso` | bool     | Indica primeiro acesso                        |
| `is_master`       | bool     | Indica privilégio de administrador master     |
| `dados_bancarios` | json     | Dados bancários                               |
| `created`         | autodate | Data de criação                               |
| `updated`         | autodate | Data da última atualização                    |

**Observação:** `email`, `password`, `tokenKey`, `emailVisibility` e `verified` são campos próprios da collection de autenticação do PocketBase. Não existe uma collection separada `users` relacionada a `users_profile` no esquema atual.

## `livros`

Armazena os dados editoriais, comerciais e os arquivos associados aos livros.

| Campo                    | Tipo     | Uso                                    |
| ------------------------ | -------- | -------------------------------------- |
| `direitos_de_publicacao` | bool     | Declaração dos direitos de publicação  |
| `data_de_publicacao`     | date     | Data de publicação                     |
| `preco_digital`          | number   | Preço da versão digital                |
| `preco_fisico`           | number   | Preço da versão física                 |
| `titulo`                 | text     | Título                                 |
| `subtitulo`              | text     | Subtítulo                              |
| `descricao`              | text     | Descrição do livro                     |
| `ativo`                  | bool     | Situação de ativação                   |
| `estado`                 | text     | Estado do livro no fluxo de publicação |
| `idioma`                 | text     | Idioma                                 |
| `colaboradores`          | json     | Informações dos colaboradores          |
| `categoria`              | text     | Categoria literária                    |
| `ISBN`                   | text     | Código ISBN                            |
| `numero_paginas`         | number   | Quantidade de páginas                  |
| `manuscrito`             | file     | Arquivo PDF do manuscrito              |
| `capa_frente`            | file     | Imagem da capa frontal                 |
| `capa_verso`             | file     | Imagem da capa traseira                |
| `fk_user_profile_id`     | relation | Relação com `users_profile`            |

## `vendas`

Armazena os pedidos realizados na loja.

| Campo                | Tipo     | Uso                                    |
| -------------------- | -------- | -------------------------------------- |
| `data`               | date     | Data da venda                          |
| `total`              | number   | Valor total                            |
| `metodo_pagamento`   | number   | Identificador do método de pagamento   |
| `status_pagamento`   | text     | Situação do pagamento                  |
| `endereco_entrega`   | json     | Cópia dos dados do endereço de entrega |
| `status_entrega`     | text     | Situação da entrega                    |
| `fk_user_profile_id` | relation | Relação com `users_profile`            |

## `itens_venda`

Registra os livros incluídos em cada venda.

| Campo                | Tipo     | Uso                                          |
| -------------------- | -------- | -------------------------------------------- |
| `qtd`                | number   | Quantidade                                   |
| `subtotal`           | number   | Subtotal do item                             |
| `fisico`             | bool     | Indica se o item corresponde à versão física |
| `preco_unitario`     | number   | Preço unitário                               |
| `fk_livros_itens_id` | relation | Relação com `livros`                         |
| `fk_vendas_id`       | relation | Relação com `vendas`                         |

## `avaliacoes`

Armazena as avaliações realizadas pelos usuários.

| Campo                | Tipo     | Uso                         |
| -------------------- | -------- | --------------------------- |
| `data_criacao`       | date     | Data da avaliação           |
| `qtd_estrelas`       | number   | Quantidade de estrelas      |
| `fk_livros_id`       | relation | Relação com `livros`        |
| `fk_user_profile_id` | relation | Relação com `users_profile` |

## `movimentacoes_financeiras`

Registra as movimentações financeiras associadas aos usuários e, quando aplicável, às vendas.

| Campo                | Tipo     | Uso                          |
| -------------------- | -------- | ---------------------------- |
| `data`               | date     | Data da movimentação         |
| `tipo`               | text     | Tipo de movimentação         |
| `valor`              | number   | Valor movimentado            |
| `descricao`          | text     | Descrição                    |
| `status`             | text     | Situação da movimentação     |
| `dados_bancarios`    | json     | Dados bancários relacionados |
| `fk_user_profile_id` | relation | Relação com `users_profile`  |
| `fk_vendas_id`       | relation | Relação com `vendas`         |

## `enderecos`

Armazena os endereços cadastrados pelos usuários.

| Campo                | Tipo     | Uso                              |
| -------------------- | -------- | -------------------------------- |
| `estado`             | text     | Estado                           |
| `bairro`             | text     | Bairro                           |
| `rua`                | text     | Logradouro                       |
| `num`                | number   | Número                           |
| `cep`                | text     | CEP                              |
| `cidade`             | text     | Cidade                           |
| `complemento`        | text     | Complemento                      |
| `pais`               | text     | País                             |
| `ativo`              | bool     | Indica se o endereço está ativo  |
| `principal`          | bool     | Indica se é o endereço principal |
| `fk_user_profile_id` | relation | Relação com `users_profile`      |

## `revisoes`

Armazena os registros de revisão dos livros.

| Campo                | Tipo     | Uso                                       |
| -------------------- | -------- | ----------------------------------------- |
| `apontamento`        | text     | Observações da revisão                    |
| `nome`               | text     | Nome associado à revisão                  |
| `completado`         | bool     | Indica se a revisão foi concluída         |
| `fk_livro_id`        | relation | Relação com `livros`                      |
| `fk_user_profile_id` | relation | Relação com `users_profile`               |
| `arquivo`            | file     | Arquivo PDF associado à revisão           |
| `data_criacao`       | autodate | Data de criação ou atualização automática |

## Armazenamento de arquivos

Os arquivos não são armazenados em uma collection funcional chamada `storage_files`. O gerenciamento é realizado pelo próprio sistema de arquivos do PocketBase.

Os campos do tipo `file` presentes nas collections permitem anexar e recuperar arquivos vinculados aos registros.

No esquema atual, os principais campos de arquivo são:

- `users_profile.imagem`: imagem do perfil.
- `livros.manuscrito`: manuscrito em PDF.
- `livros.capa_frente`: imagem da capa frontal.
- `livros.capa_verso`: imagem da capa traseira.
- `revisoes.arquivo`: documento PDF da revisão.

Os arquivos e seus registros são mantidos pelo PocketBase dentro da estrutura de dados da aplicação.

## Relações entre as collections

As relações são estabelecidas por campos do tipo `relation`, que armazenam os IDs dos registros relacionados.

```text
users_profile --> livros
users_profile --> vendas
users_profile --> avaliacoes
users_profile --> movimentacoes_financeiras
users_profile --> enderecos
users_profile --> revisoes

livros --> itens_venda
livros --> avaliacoes
livros --> revisoes

vendas --> itens_venda
vendas --> movimentacoes_financeiras
```

A collection `users_profile` é a própria collection de autenticação. Portanto, não existe uma relação adicional entre `users` e `users_profile`.

## Backup

O diretório `pb_data` contém os dados necessários para a persistência da aplicação, incluindo o banco SQLite e os arquivos armazenados.

Para realizar um backup manual, interrompa o servidor PocketBase antes de copiar o diretório. Como alternativa, utilize o recurso de backup disponibilizado pelo próprio PocketBase.

Não copie somente o arquivo `data.db`: os arquivos auxiliares e o diretório de armazenamento de arquivos também fazem parte dos dados da aplicação.

Em ambientes portáteis, mantenha uma cópia de segurança completa de `pb_data` antes de realizar alterações importantes ou atualizações.
