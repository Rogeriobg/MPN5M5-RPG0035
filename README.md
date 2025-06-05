# 🔐 API de Autenticação com JWT (Node.js + Express)

## 🧠 Funções principais

### sanitize(input)

Sanitiza uma string de entrada, removendo caracteres potencialmente perigosos. Previne injeções simples em strings passadas por parâmetros.

### doLogin(credentials)

Busca um usuário na lista simulada com base no username fornecido nas credenciais. Simula uma verificação de login.

### generateToken(user)

Gera um token JWT contendo o ID, perfil e e-mail do usuário. O token expira em 1 hora.

### authenticateToken(req, res, next)

Middleware que verifica se o token JWT fornecido no cabeçalho Authorization é válido. Se for, o usuário é autenticado e segue para a próxima função.

### onlyAdmin(req, res, next)

Middleware que permite acesso apenas a usuários com perfil admin. Retorna erro 403 se o perfil não for autorizado.

### getContracts(empresa, inicio)

Função que simula a busca de contratos em um "banco de dados fake", baseado em parâmetros de empresa e data. Retorna um array de contratos simulados.

# 📌 Rotas da API

POST /api/auth/login
Realiza o login do usuário e retorna um token JWT.

Body:

json

{
"username": "admin",
"password": "123456789"
}

Retorno:

json

{
"token": "eyJhbGciOi..."
}

GET /api/auth/profile
Retorna os dados do usuário logado.
Necessita token JWT no cabeçalho:

Authorization: Bearer <token>
Retorno:

json

{
"user": {
"id": 123,
"perfil": "user",
"email": "user@dominio.com"
}
}

GET /api/users
Retorna a lista de usuários cadastrados.
Acesso restrito a administradores.

Cabeçalho: JWT válido com perfil admin.

Retorno:

json
Copiar
Editar
{
"data": [
{ "username": "user", ... },
{ "username": "admin", ... }
]
}

GET /api/contracts/:empresa/:inicio
Retorna os contratos de uma empresa com base na data de início.
Acesso restrito a administradores.

Parâmetros de rota:

empresa → nome da empresa

inicio → data de início (ex: 2024-01-01)

Exemplo de rota:
/api/contracts/AcmeCorp/2024-01-01

Retorno:

json

{
"data": [
{
"contrato_id": 1,
"empresa": "AcmeCorp",
"data_inicio": "2024-01-01",
"descricao": "Contrato de prestação de serviços"
}
]
}

# 🚀 Inicialização

Use o seguinte comando para iniciar a API em modo desenvolvimento:

## npm run dev

Para rodar o Frontend:

## localgost:3000

OBS: o Frontend foi criado apenas para facilitar os testes da Api
