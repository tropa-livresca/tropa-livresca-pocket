# Autenticação

O PocketBase fornece a collection `users`, responsável pela autenticação nativa, incluindo cadastro, login, renovação de sessão e OAuth2.

A aplicação também utiliza a collection `users_profile`, que armazena os dados complementares dos usuários e as informações necessárias para o controle de privilégios.

## Fluxo principal

1. A pessoa cria uma conta ou realiza o login pela interface de autenticação.
2. O PocketBase valida as credenciais e fornece o token de autenticação.
3. O backend estabelece e mantém a sessão do usuário por meio do cookie `auth-token`.
4. Nas requisições protegidas, o frontend utiliza `apiFetch` com `credentials: "include"`, enviando os cookies ao backend.
5. O middleware `checkAuth` recupera o token, valida e renova a sessão com o PocketBase e disponibiliza os dados do usuário em `req.user`.
6. No logout, a sessão é encerrada e o cookie de autenticação é removido.

## Perfil e privilégios

A collection `users_profile` armazena informações complementares e administrativas relacionadas à collection nativa `users`.

O campo `auth_user` estabelece a relação entre o perfil e a conta de autenticação. O hook `main.pb.js` participa da criação automática do perfil correspondente ao usuário.

Os principais campos utilizados no controle de acesso são:

- `auth_user`: relação com a collection de autenticação `users`.
- `is_admin`: identifica usuários com acesso administrativo.
- `is_master`: identifica administradores com privilégios adicionais.
- `primeiro_acesso`: indica se o usuário precisa concluir o procedimento de primeiro acesso.
- `funcao`: identifica a função ou classificação do usuário.

A autorização é verificada no backend. O frontend pode utilizar as informações do perfil para controlar a apresentação das interfaces, mas não deve ser considerado responsável por garantir privilégios.

## Autenticação administrativa

O acesso administrativo possui um fluxo separado da autenticação comum do PocketBase.

Após a validação das credenciais administrativas, o backend gera um JWT assinado com a variável de ambiente `JWT_SECRET` e o armazena no cookie `admin-token`.

Os middlewares administrativos verificam o token e consultam o perfil correspondente na collection `users_profile`, utilizando a relação `auth_user`.

As permissões são determinadas pelos campos:

- `is_admin`: necessário para acessar os recursos administrativos.
- `is_master`: necessário para acessar funcionalidades exclusivas de administrador master.

O administrador master também possui as permissões gerais de administrador.

## Regras das collections

O PocketBase permite configurar regras de acesso para cada collection por meio de:

- `listRule`: consulta de registros.
- `viewRule`: visualização de um registro.
- `createRule`: criação de registros.
- `updateRule`: atualização de registros.
- `deleteRule`: exclusão de registros.

As regras devem considerar a finalidade de cada collection e as permissões necessárias para cada operação.

Exemplos de expressões:

- **Perfil próprio:** `@request.auth.id != "" && auth_user = @request.auth.id`.
- **Acesso administrativo:** `@request.auth.id != "" && auth_user.is_admin = true`.

As expressões são exemplos de configuração e devem ser adaptadas à estrutura e às relações de cada collection. O acesso realizado pelo backend também deve respeitar as verificações de autorização implementadas na API.

## OAuth2

A autenticação com provedores externos, como o Google, utiliza o sistema OAuth2 do PocketBase.

O fluxo implementado é composto pelas seguintes etapas:

1. O frontend consulta os métodos de autenticação disponíveis no PocketBase.
2. O provedor selecionado fornece a URL necessária para iniciar a autenticação.
3. A aplicação abre uma janela de autenticação externa.
4. Após a autorização, o frontend recebe os dados do retorno OAuth2 e conclui a autenticação com o PocketBase por meio de `authWithOAuth2Code`.
5. O token obtido é enviado ao endpoint `/api/v1/auth/session`.
6. O backend estabelece a sessão utilizada pela aplicação.

O endpoint `/api/oauth2-redirect` participa do fluxo de retorno OAuth2 do PocketBase.

Para utilizar o Google, é necessário configurar o Client ID e o Client Secret nas configurações de provedores de autenticação do PocketBase e cadastrar a URL de redirecionamento correspondente no Google Cloud Console.

Os campos adicionais `nome`, `sobrenome` e `telefone` complementam os dados do usuário e são definidos na estrutura da collection por meio das migrações do PocketBase.

## Segurança

- Utilize HTTPS em ambientes de produção.
- Proteja a conta de superusuário do PocketBase.
- Nunca exponha credenciais de superusuário ou `JWT_SECRET` no frontend.
- Mantenha as regras de acesso das collections configuradas de acordo com as permissões necessárias.
- Valide os privilégios administrativos no backend.
- Configure CORS e as origens permitidas conforme o ambiente de execução.
- Proteja os cookies de autenticação com as configurações adequadas ao ambiente.
- Faça backup de todo o diretório `pocketbase/pb_data` antes de atualizar o PocketBase ou realizar alterações importantes.
