# Autenticação e Autorização

A autenticação da aplicação é realizada por meio do PocketBase, com gerenciamento de sessões através de cookies e validação centralizada no backend Express. O sistema possui fluxos distintos de autenticação para usuários comuns e administradores, garantindo o controle de acesso aos recursos protegidos.

---

## Fluxo Principal

1. **Cadastro:** O usuário realiza o cadastro por meio do frontend, enviando os dados obrigatórios para a API.
2. **Autenticação:** O backend utiliza os recursos de autenticação do PocketBase para validar as credenciais e registrar a sessão do usuário.
3. **Geração de Sessão:** Após a autenticação, o token de acesso é armazenado em cookie HTTP, identificado como `auth-token`.
4. **Validação Contínua:** O middleware `checkAuth` recupera o token do cookie, restaura a autenticação no PocketBase e executa `authRefresh()` para validar a sessão.
5. **Identificação do Usuário:** Após a validação, os dados do usuário autenticado são disponibilizados na requisição por meio de `req.user`.
6. **Encerramento:** No logout, a sessão local é encerrada e o cookie de autenticação é removido.

---

## Recursos Contemplados

- **Cadastro e Login:** Fluxos de autenticação para usuários comuns por meio da coleção `users` do PocketBase.
- **Autenticação de Administradores (ADM):** O acesso administrativo utiliza um fluxo independente, baseado em JWT assinado com `JWT_SECRET` e armazenado no cookie `admin-token`.
- **Controle de Privilégios:** A autorização administrativa consulta a coleção `users_profile`, vinculada ao usuário autenticado por meio do campo `auth_user`.
- **Administrador:** O acesso administrativo exige que a propriedade `is_admin` esteja ativa.
- **Administrador Master:** Além de possuir privilégios administrativos, exige que a propriedade `is_master` esteja ativa.
- **Validação de Sessão:** O backend utiliza `authRefresh()` do PocketBase para verificar a validade da sessão dos usuários comuns.
- **Perfil do Usuário:** Os dados cadastrais e informações complementares são gerenciados pela coleção `users_profile`.
- **Logout:** Encerramento da sessão e remoção dos cookies de autenticação correspondentes.
- **Acesso Restrito:** Proteção de rotas no React Router para autopublicação, painel administrativo e funcionalidades que exigem autenticação.

---

## Autenticação com Google

A autenticação com Google utiliza o fluxo OAuth2 disponibilizado pelo PocketBase.

O frontend consulta os métodos de autenticação disponíveis na coleção `users_profile`, obtém a URL de autorização do provedor e abre uma janela de autenticação.

Após a autorização, o fluxo utiliza o callback OAuth2 do PocketBase:

`/api/oauth2-redirect`

O código de autorização e o verificador PKCE são utilizados para concluir a autenticação por meio de `authWithOAuth2Code()`. Em seguida, o token obtido é enviado ao backend para estabelecer a sessão da aplicação.

Para habilitar esse fluxo:

1. No Google Cloud Console, crie um cliente OAuth do tipo **Aplicativo da Web**.
2. Nas configurações do provedor Google no PocketBase, configure o Client ID e o Client Secret fornecidos pelo Google.
3. Configure no Google Cloud Console a URI de redirecionamento disponibilizada pelo PocketBase, correspondente ao endpoint `/api/oauth2-redirect`.
4. Verifique se o endereço público do PocketBase está corretamente configurado e acessível pelo provedor.
5. Mantenha as credenciais privadas exclusivamente nas configurações do PocketBase e do ambiente do backend.

O callback `/api/oauth2-redirect` pertence ao PocketBase e não deve ser confundido com uma rota de callback do frontend.

---

## Detalhes Técnicos de Infraestrutura

- **Cookies de Autenticação:** O cookie `auth-token` armazena o token da sessão dos usuários comuns. O cookie `admin-token` armazena o JWT utilizado na autenticação administrativa.
- **Validação de Sessão:** O backend utiliza o SDK do PocketBase para restaurar e validar a sessão por meio de `authStore.save()` e `users.authRefresh()`.
- **Gerenciamento de Administradores:** A autenticação administrativa utiliza JWT e verifica os privilégios associados ao perfil do usuário na coleção `users_profile`.
- **Separação de Identificadores:** A coleção `users` armazena os registros de autenticação, enquanto `users_profile` mantém os dados complementares dos perfis. O campo `auth_user` estabelece o vínculo entre essas coleções.
- **Middleware `checkAuth`:** Recupera o cookie `auth-token`, valida a sessão no PocketBase e disponibiliza os dados do usuário autenticado em `req.user`.
- **Middleware Administrativo:** Valida o JWT recebido pelo cookie `admin-token`, verifica a assinatura com `JWT_SECRET` e consulta o perfil correspondente para confirmar as permissões administrativas.
- **Controle Master:** O acesso às funcionalidades exclus
