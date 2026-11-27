# Tropa Livresca — Dicionário de Dados

Este documento apresenta as tabelas da plataforma Tropa Livresca e seus respectivos campos, com tipo de dado, indicação de autoincremento, chave estrangeira (FK), chave primária (PK) e descrição.

**Critérios utilizados**

- **Autoincremento:** os identificadores `varchar(15)` foram considerados não autoincrementais. O esquema informa que são identificadores textuais, não sequenciais.
- **PK:** indica a chave primária da tabela.
- **FK:** indica uma referência a outra tabela, conforme os relacionamentos fornecidos.
- **Descrições:** foram elaboradas com base nos nomes dos campos. Quando o esquema não especifica a finalidade exata, a descrição é indicativa.

---

## 1. Tabela `users_profile`

Armazena os dados dos perfis de usuários, incluindo informações de cadastro, administração e dados associados à conta.

| Nome              | Tipo          | Autoincremento |  FK |  PK | Descrição                                                       |
| ----------------- | ------------- | -------------: | --: | --: | --------------------------------------------------------------- |
| `id`              | `varchar(15)` |            Não | Não | Sim | Identificador único do perfil do usuário.                       |
| `email`           | `varchar`     |            Não | Não | Não | Endereço de e-mail do usuário. Campo único e obrigatório.       |
| `emailVisibility` | `boolean`     |            Não | Não | Não | Indica se o e-mail pode ser exibido publicamente.               |
| `verified`        | `boolean`     |            Não | Não | Não | Indica se o endereço de e-mail foi verificado.                  |
| `nome`            | `text`        |            Não | Não | Não | Nome do usuário.                                                |
| `sobrenome`       | `text`        |            Não | Não | Não | Sobrenome do usuário.                                           |
| `descricao`       | `text`        |            Não | Não | Não | Descrição ou apresentação do perfil.                            |
| `redes_sociais`   | `json`        |            Não | Não | Não | Dados das redes sociais associadas ao perfil.                   |
| `is_admin`        | `boolean`     |            Não | Não | Não | Indica se o usuário possui perfil administrativo.               |
| `senha_admin`     | `text`        |            Não | Não | Não | Campo relacionado à senha de acesso administrativo.             |
| `primeiro_acesso` | `boolean`     |            Não | Não | Não | Indica se o usuário está realizando o primeiro acesso.          |
| `is_master`       | `boolean`     |            Não | Não | Não | Indica se o usuário possui nível de administrador master.       |
| `dados_bancarios` | `json`        |            Não | Não | Não | Armazena os dados bancários associados ao usuário.              |
| `imagem`          | `file`        |            Não | Não | Não | Arquivo de imagem associado ao perfil, como a imagem de perfil. |
| `telefone`        | `text`        |            Não | Não | Não | Número de telefone do usuário.                                  |
| `created`         | `timestamp`   |            Não | Não | Não | Data e horário de criação do registro.                          |
| `updated`         | `timestamp`   |            Não | Não | Não | Data e horário da última atualização do registro.               |

## 2. Tabela `avaliacoes`

Armazena as avaliações relacionadas aos livros e aos usuários que as realizaram.

| Nome                 | Tipo          | Autoincremento |                       FK |  PK | Descrição                                        |
| -------------------- | ------------- | -------------: | -----------------------: | --: | ------------------------------------------------ |
| `id`                 | `varchar(15)` |            Não |                      Não | Sim | Identificador único da avaliação.                |
| `data_criacao`       | `date`        |            Não |                      Não | Não | Data de criação da avaliação. Campo obrigatório. |
| `qtd_estrelas`       | `decimal`     |            Não |                      Não | Não | Quantidade de estrelas atribuída à avaliação.    |
| `fk_livros_id`       | `varchar(15)` |            Não |        Sim — `livros.id` | Não | Identifica o livro relacionado à avaliação.      |
| `fk_user_profile_id` | `varchar(15)` |            Não | Sim — `users_profile.id` | Não | Identifica o usuário que realizou a avaliação.   |

## 3. Tabela `enderecos`

Armazena os endereços cadastrados pelos usuários.

| Nome                 | Tipo          | Autoincremento |                       FK |  PK | Descrição                                          |
| -------------------- | ------------- | -------------: | -----------------------: | --: | -------------------------------------------------- |
| `id`                 | `varchar(15)` |            Não |                      Não | Sim | Identificador único do endereço.                   |
| `estado`             | `text`        |            Não |                      Não | Não | Estado do endereço. Campo obrigatório.             |
| `bairro`             | `text`        |            Não |                      Não | Não | Bairro do endereço. Campo obrigatório.             |
| `rua`                | `text`        |            Não |                      Não | Não | Nome da rua ou logradouro. Campo obrigatório.      |
| `num`                | `decimal`     |            Não |                      Não | Não | Número do endereço. Campo obrigatório.             |
| `cep`                | `text`        |            Não |                      Não | Não | Código de Endereçamento Postal. Campo obrigatório. |
| `cidade`             | `text`        |            Não |                      Não | Não | Cidade do endereço. Campo obrigatório.             |
| `complemento`        | `text`        |            Não |                      Não | Não | Complemento do endereço, quando houver.            |
| `pais`               | `text`        |            Não |                      Não | Não | País do endereço.                                  |
| `ativo`              | `boolean`     |            Não |                      Não | Não | Indica se o endereço está ativo.                   |
| `principal`          | `boolean`     |            Não |                      Não | Não | Indica se o endereço está marcado como principal.  |
| `fk_user_profile_id` | `varchar(15)` |            Não | Sim — `users_profile.id` | Não | Identifica o usuário proprietário do endereço.     |

## 4. Tabela `itens_venda`

Armazena os livros e as respectivas quantidades e valores que compõem cada venda.

| Nome                 | Tipo          | Autoincremento |                FK |  PK | Descrição                                                          |
| -------------------- | ------------- | -------------: | ----------------: | --: | ------------------------------------------------------------------ |
| `id`                 | `varchar(15)` |            Não |               Não | Sim | Identificador único do item da venda.                              |
| `qtd`                | `decimal`     |            Não |               Não | Não | Quantidade do livro no item da venda. Campo obrigatório.           |
| `subtotal`           | `decimal`     |            Não |               Não | Não | Valor total do item, considerando a quantidade. Campo obrigatório. |
| `fisico`             | `boolean`     |            Não |               Não | Não | Indica se o item corresponde à versão física do livro.             |
| `preco_unitario`     | `decimal`     |            Não |               Não | Não | Preço de uma unidade do livro. Campo obrigatório.                  |
| `fk_livros_itens_id` | `varchar(15)` |            Não | Sim — `livros.id` | Não | Identifica o livro incluído no item da venda.                      |
| `fk_vendas_id`       | `varchar(15)` |            Não | Sim — `vendas.id` | Não | Identifica a venda à qual o item pertence.                         |

## 5. Tabela `livros`

Armazena as informações dos livros cadastrados na plataforma, incluindo dados editoriais, preços, arquivos e vínculo com o usuário responsável.

| Nome                     | Tipo          | Autoincremento |                       FK |  PK | Descrição                                                            |
| ------------------------ | ------------- | -------------: | -----------------------: | --: | -------------------------------------------------------------------- |
| `id`                     | `varchar(15)` |            Não |                      Não | Sim | Identificador único do livro.                                        |
| `direitos_de_publicacao` | `boolean`     |            Não |                      Não | Não | Indica a declaração relacionada aos direitos de publicação do livro. |
| `data_de_publicacao`     | `date`        |            Não |                      Não | Não | Data de publicação do livro. Campo obrigatório.                      |
| `preco_digital`          | `decimal`     |            Não |                      Não | Não | Preço de venda da versão digital. Campo obrigatório.                 |
| `preco_fisico`           | `decimal`     |            Não |                      Não | Não | Preço de venda da versão física. Campo obrigatório.                  |
| `titulo`                 | `text`        |            Não |                      Não | Não | Título do livro. Campo obrigatório.                                  |
| `subtitulo`              | `text`        |            Não |                      Não | Não | Subtítulo do livro. Campo obrigatório.                               |
| `descricao`              | `text`        |            Não |                      Não | Não | Descrição ou sinopse do livro. Campo obrigatório.                    |
| `ativo`                  | `boolean`     |            Não |                      Não | Não | Indica se o cadastro do livro está ativo.                            |
| `estado`                 | `text`        |            Não |                      Não | Não | Estado ou situação atual do livro na plataforma. Campo obrigatório.  |
| `idioma`                 | `text`        |            Não |                      Não | Não | Idioma em que o livro foi escrito. Campo obrigatório.                |
| `colaboradores`          | `json`        |            Não |                      Não | Não | Dados dos colaboradores associados à produção do livro.              |
| `categoria`              | `text`        |            Não |                      Não | Não | Categoria ou gênero literário do livro.                              |
| `ISBN`                   | `text`        |            Não |                      Não | Não | Número ISBN (International Standard Book Number) do livro.           |
| `numero_paginas`         | `decimal`     |            Não |                      Não | Não | Quantidade de páginas do livro.                                      |
| `manuscrito`             | `file`        |            Não |                      Não | Não | Arquivo do manuscrito do livro.                                      |
| `capa_frente`            | `file`        |            Não |                      Não | Não | Arquivo da capa frontal do livro.                                    |
| `capa_verso`             | `file`        |            Não |                      Não | Não | Arquivo da capa traseira do livro.                                   |
| `fk_user_profile_id`     | `varchar(15)` |            Não | Sim — `users_profile.id` | Não | Identifica o usuário responsável pelo cadastro do livro.             |

## 6. Tabela `movimentacoes_financeiras`

Registra as movimentações financeiras associadas aos usuários e, quando aplicável, às vendas.

| Nome                 | Tipo          | Autoincremento |                       FK |  PK | Descrição                                                       |
| -------------------- | ------------- | -------------: | -----------------------: | --: | --------------------------------------------------------------- |
| `id`                 | `varchar(15)` |            Não |                      Não | Sim | Identificador único da movimentação financeira.                 |
| `data`               | `date`        |            Não |                      Não | Não | Data da movimentação financeira. Campo obrigatório.             |
| `tipo`               | `text`        |            Não |                      Não | Não | Tipo da movimentação, como entrada ou saída. Campo obrigatório. |
| `valor`              | `decimal`     |            Não |                      Não | Não | Valor financeiro movimentado. Campo obrigatório.                |
| `descricao`          | `text`        |            Não |                      Não | Não | Descrição da movimentação. Campo obrigatório.                   |
| `status`             | `text`        |            Não |                      Não | Não | Situação atual da movimentação. Campo obrigatório.              |
| `fk_vendas_id`       | `varchar(15)` |            Não |        Sim — `vendas.id` | Não | Identifica a venda relacionada à movimentação, quando houver.   |
| `dados_bancarios`    | `json`        |            Não |                      Não | Não | Dados bancários associados à movimentação, quando aplicáveis.   |
| `fk_user_profile_id` | `varchar(15)` |            Não | Sim — `users_profile.id` | Não | Identifica o usuário ao qual a movimentação está vinculada.     |

## 7. Tabela `revisoes`

Armazena os registros de revisão dos livros, incluindo apontamentos, arquivos e identificação dos usuários envolvidos.

| Nome                 | Tipo          | Autoincremento |                       FK |  PK | Descrição                                                      |
| -------------------- | ------------- | -------------: | -----------------------: | --: | -------------------------------------------------------------- |
| `id`                 | `varchar(15)` |            Não |                      Não | Sim | Identificador único da revisão.                                |
| `apontamento`        | `text`        |            Não |                      Não | Não | Apontamentos ou observações feitos durante a revisão.          |
| `nome`               | `text`        |            Não |                      Não | Não | Nome associado ao registro de revisão.                         |
| `completado`         | `boolean`     |            Não |                      Não | Não | Indica se a revisão foi concluída.                             |
| `fk_livro_id`        | `varchar(15)` |            Não |        Sim — `livros.id` | Não | Identifica o livro que está sendo revisado. Campo obrigatório. |
| `fk_user_profile_id` | `varchar(15)` |            Não | Sim — `users_profile.id` | Não | Identifica o usuário associado à revisão.                      |
| `arquivo`            | `file`        |            Não |                      Não | Não | Arquivo associado ao registro de revisão.                      |
| `fk_autor_id`        | `varchar(15)` |            Não | Sim — `users_profile.id` | Não | Identifica o autor relacionado à revisão. Campo obrigatório.   |
| `data_criacao`       | `timestamp`   |            Não |                      Não | Não | Data e horário de criação do registro de revisão.              |

## 8. Tabela `vendas`

Armazena os dados gerais das vendas realizadas na plataforma.

| Nome                 | Tipo          | Autoincremento |                       FK |  PK | Descrição                                                                                          |
| -------------------- | ------------- | -------------: | -----------------------: | --: | -------------------------------------------------------------------------------------------------- |
| `id`                 | `varchar(15)` |            Não |                      Não | Sim | Identificador único da venda.                                                                      |
| `data`               | `date`        |            Não |                      Não | Não | Data da venda. Campo obrigatório.                                                                  |
| `total`              | `decimal`     |            Não |                      Não | Não | Valor total da venda. Campo obrigatório.                                                           |
| `metodo_pagamento`   | `decimal`     |            Não |                      Não | Não | Código ou valor associado ao método de pagamento, conforme definido no esquema. Campo obrigatório. |
| `status_pagamento`   | `text`        |            Não |                      Não | Não | Situação do pagamento da venda. Campo obrigatório.                                                 |
| `endereco_entrega`   | `json`        |            Não |                      Não | Não | Dados do endereço de entrega registrados na venda.                                                 |
| `status_entrega`     | `text`        |            Não |                      Não | Não | Situação da entrega da venda. Campo obrigatório.                                                   |
| `fk_user_profile_id` | `varchar(15)` |            Não | Sim — `users_profile.id` | Não | Identifica o usuário associado à venda.                                                            |

---

## Relacionamentos entre as tabelas

| Tabela de origem            | Campo FK             | Tabela de destino | Campo referenciado |
| --------------------------- | -------------------- | ----------------- | ------------------ |
| `avaliacoes`                | `fk_livros_id`       | `livros`          | `id`               |
| `avaliacoes`                | `fk_user_profile_id` | `users_profile`   | `id`               |
| `enderecos`                 | `fk_user_profile_id` | `users_profile`   | `id`               |
| `itens_venda`               | `fk_livros_itens_id` | `livros`          | `id`               |
| `itens_venda`               | `fk_vendas_id`       | `vendas`          | `id`               |
| `movimentacoes_financeiras` | `fk_vendas_id`       | `vendas`          | `id`               |
| `movimentacoes_financeiras` | `fk_user_profile_id` | `users_profile`   | `id`               |
| `revisoes`                  | `fk_livro_id`        | `livros`          | `id`               |
| `revisoes`                  | `fk_user_profile_id` | `users_profile`   | `id`               |
| `revisoes`                  | `fk_autor_id`        | `users_profile`   | `id`               |
| `vendas`                    | `fk_user_profile_id` | `users_profile`   | `id`               |

## Observações

1. Os campos `id` foram definidos como chaves primárias (`PK`) e são do tipo `varchar(15)`. Portanto, não foram classificados como autoincrementais.
2. Os campos iniciados por `fk_` foram classificados como chaves estrangeiras (`FK`) de acordo com os relacionamentos fornecidos.
3. Os campos marcados como obrigatórios no esquema original foram identificados nas descrições.
4. Os campos `file` representam arquivos armazenados pelo PocketBase.
5. As descrições são documentais e não substituem as regras de validação, permissões ou configurações existentes nas coleções do PocketBase.
