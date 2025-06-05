const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = 'chave_super_secreta';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));



const users = [
  {
    username: "user",
    password: bcrypt.hashSync("123456", 10),
    id: 123,
    email: "user@dominio.com",
    perfil: "user"
  },
  {
    username: "admin",
    password: bcrypt.hashSync("123456789", 10),
    id: 124,
    email: "admin@dominio.com",
    perfil: "admin"
  },
  {
    username: "colab",
    password: bcrypt.hashSync("123", 10),
    id: 125,
    email: "colab@dominio.com",
    perfil: "user"
  }
];


function sanitize(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[^a-zA-Z0-9-_@.]/g, '');
}


function doLogin(credentials) {
  return users.find(u => u.username === credentials.username);
}


function generateToken(user) {
  const payload = {
    id: user.id,
    perfil: user.perfil,
    email: user.email
  };
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
}


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}


function onlyAdmin(req, res, next) {
  if (req.user.perfil !== 'admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores' });
  }
  next();
}


class Repository {
  execute(query) {
    console.log("Query executada (fake):", query);
    
    return [
      {
        contrato_id: 1,
        empresa: 'AcmeCorp',
        data_inicio: '2024-01-01',
        descricao: 'Contrato de prestação de serviços'
      }
    ];
  }
}


function getContracts(empresa, inicio) {
  const sanitizedEmpresa = sanitize(empresa);
  const sanitizedInicio = sanitize(inicio);
  const query = `SELECT * FROM contracts WHERE empresa = '${sanitizedEmpresa}' AND data_inicio = '${sanitizedInicio}'`;
  const repository = new Repository();
  return repository.execute(query);
}


app.post('/api/auth/login',
  body('username').notEmpty().withMessage('Usuário obrigatório'),
  body('password').notEmpty().withMessage('Senha obrigatória'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const credentials = req.body;
    const user = doLogin(credentials);
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    const passwordValid = bcrypt.compareSync(credentials.password, user.password);
    if (!passwordValid) return res.status(401).json({ message: 'Credenciais inválidas' });

    const token = generateToken(user);
    res.json({ token });
  }
);


app.get('/api/auth/profile', authenticateToken, (req, res) => {
  res.status(200).json({ user: req.user });
});


app.get('/api/users', authenticateToken, onlyAdmin, (req, res) => {
  res.status(200).json({ data: users });
});


app.get('/api/contracts/:empresa/:inicio', authenticateToken, onlyAdmin, (req, res) => {
  const { empresa, inicio } = req.params;
  const result = getContracts(empresa, inicio);
  if (result.length > 0)
    res.status(200).json({ data: result });
  else
    res.status(404).json({ message: 'Dados não encontrados' });
});


app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});