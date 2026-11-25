# Configuração do Arquivo .env

Para configurar o ambiente de execução do projeto, é necessário criar um arquivo `.env` no diretório principal do backend. Esse arquivo centraliza as configurações utilizadas pelo backend e pelos serviços integrados.

## Passo a Passo para Configuração

1. **Criação do arquivo:** crie um arquivo chamado `.env` diretamente na pasta `backend`.
2. **Inserção das variáveis:** adicione as configurações necessárias utilizando o modelo apresentado abaixo.
3. **Preenchimento dos valores:** substitua os valores fictícios pelos endereços e pelas credenciais correspondentes ao ambiente.
4. **Salvamento:** salve o arquivo para que o Node.js possa carregar as variáveis durante a inicialização.
5. **Segurança:** certifique-se de que `backend/.env` esteja incluído no `.gitignore`, impedindo o envio de credenciais ao repositório.
6. **Inicialização:** execute os comandos de inicialização definidos no projeto.

## Modelo Base de Configuração (`backend/.env`)

```env
# Ambiente de execução
NODE_ENV=development

# Configurações do servidor
PORT=3000

# Endereços da aplicação
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# Integração com o PocketBase
POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_SUPERUSER_EMAIL=seu-email-administrador
POCKETBASE_SUPERUSER_PASSWORD=sua-senha-segura

# Segurança e autenticação administrativa
JWT_SECRET=sua-chave-jwt-segura

# Serviço de e-mail (SMTP / Nodemailer)
SMTP_HOST=seu-servidor-smtp
SMTP_PORT=587
SMTP_USER=seu-usuario-smtp
SMTP_PASS=sua-senha-smtp
```

## Configuração por ambiente

Os valores devem ser ajustados conforme o ambiente em que a aplicação será executada:

- **Desenvolvimento local:** utilize os endereços locais do frontend, backend e PocketBase.
- **GitHub Codespaces:** configure os endereços públicos correspondentes aos serviços disponibilizados pelo Codespaces.
- **Produção:** utilize os endereços e as credenciais dos serviços de produção.

## Carregamento das variáveis

O projeto utiliza o mecanismo nativo do Node.js para carregar as variáveis do arquivo `.env`, por meio de `process.loadEnvFile()`. Portanto, não é necessário instalar ou utilizar o pacote `dotenv`.

O frontend não possui um arquivo `.env` independente nesse modelo. As configurações são centralizadas no backend, e o frontend realiza suas requisições por meio da API.

## Segurança das credenciais

- Nunca compartilhe o arquivo `.env` contendo credenciais reais.
- Não versione o arquivo em repositórios públicos.
- Não exponha a senha do superusuário do PocketBase.
- Utilize uma chave JWT segura e exclusiva.
- Não utilize credenciais fictícias em ambientes de produção.
- Mantenha os valores de produção protegidos e separados dos exemplos da documentação.
