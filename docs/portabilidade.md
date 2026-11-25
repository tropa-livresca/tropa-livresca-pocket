# Tropa Livresca --- manual de geração dos executáveis

Este manual reúne somente os pré-requisitos e os comandos necessários
para preparar a versão portátil da Tropa Livresca no Windows.

## 1. Pré-requisitos

Na máquina de desenvolvimento:

-   Windows 64 bits;
-   Node.js 20.12 ou superior;
-   npm;
-   dependências do projeto instaladas;
-   `esbuild` e `postject` instalados no projeto;
-   executável do PocketBase para Windows x64;
-   banco de dados em `pocketbase/pb_data`.

Abra o terminal na **raiz do projeto** (`tropa-livresca-pocket`).

Se as dependências ainda não estiverem instaladas, execute:

``` bash
npm install
```

Se `esbuild` e `postject` ainda não estiverem disponíveis, instale-os:

``` bash
npm install -D esbuild postject -w backend
```

## 2. Gerar os executáveis

Execute os comandos abaixo, na ordem indicada, sempre a partir da raiz
do projeto.

### Etapa 1 --- Compilar o frontend

``` bash
npm run build -w frontend
```

### Etapa 2 --- Agrupar o código do backend

``` bash
npm run build:bundle -w backend
```

### Etapa 3 --- Gerar o `Backend.exe`

``` bash
npm run build:exe -w backend
```

### Etapa 4 --- Gerar o inicializador `TropaLivresca.exe`

``` bash
node build-launcher.cjs
```

Ao concluir, os executáveis estarão nestes caminhos:

``` text
backend/build/Backend.exe
TropaLivresca.exe
```

## 3. Aplicar o ícone

Com `TropaLivresca.ico` e `rcedit-x64.exe` na raiz do projeto, faça
primeiro uma cópia de segurança:

``` powershell
Copy-Item ".\TropaLivresca.exe" ".\TropaLivresca-backup.exe"
```

Aplique o ícone:

``` powershell
.\rcedit-x64.exe ".\TropaLivresca.exe" --set-icon ".\TropaLivresca.ico"
```

Depois, teste o executável. Mantenha a cópia de segurança até confirmar
que ele inicia normalmente.

## 4. Testar a versão portátil

1.  Encerre qualquer execução anterior da aplicação.
2.  Confirme que `backend/.env` está presente e configurado.
3.  Confirme que `pocketbase/pb_data` contém os dados que serão usados.
4.  Execute `TropaLivresca.exe`, na raiz do projeto.
5.  Verifique se o navegador abre em `http://127.0.0.1:3000`.
6.  Teste as funcionalidades necessárias para a apresentação.
7.  Encerre a aplicação pelo terminal exibido pelo inicializador.

Faça também um teste com a pasta copiada para o pendrive ou para outra
unidade. Preserve a estrutura de diretórios.

**Não execute duas instâncias simultaneamente utilizando o mesmo
diretório `pocketbase/pb_data`.**

## 5. Recompilar após alterações

  -----------------------------------------------------------------------
  O que foi alterado                  Comando
  ----------------------------------- -----------------------------------
  Frontend                            `npm run build -w frontend`

  Backend                             `npm run build:bundle -w backend` e
                                      depois
                                      `npm run build:exe -w backend`

  `TropaLivresca.bat`                 `node build-launcher.cjs`

  `launcher.cjs`                      `node build-launcher.cjs`

  Ícone                               Reaplicar o comando do `rcedit`
  -----------------------------------------------------------------------

Se houver alterações tanto no frontend quanto no backend, execute as
respectivas compilações antes de gerar novamente o inicializador, se
necessário.

Alterações apenas no `backend/.env` ou nos dados do PocketBase não
exigem recompilação. Basta reiniciar a aplicação.

## 6. Arquivos que devem acompanhar a versão de apresentação

Mantenha, no mínimo, esta estrutura:

``` text
tropa-livresca-pocket/
├── TropaLivresca.exe
├── TropaLivresca.bat
├── backend/
│   ├── .env
│   └── build/
│       └── Backend.exe
├── frontend/
│   └── dist/
└── pocketbase/
    ├── pocketbase.exe
    └── pb_data/
```

Copie **todo o conteúdo** de `pocketbase/pb_data`, não apenas `data.db`.

O computador de apresentação não precisa ter Node.js instalado. Os
executáveis gerados, o PocketBase, os arquivos de dados, o frontend
compilado, o `.env` e o BAT precisam estar presentes nos caminhos
indicados.

**Atenção:** proteja o arquivo `backend/.env`, pois ele pode conter
credenciais e segredos da aplicação.
