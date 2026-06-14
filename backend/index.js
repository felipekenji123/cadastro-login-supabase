require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
// para permitir que o frontend (que roda em um domínio diferente, ex: localhost:3000) consiga fazer requisições para o backend (localhost:3001, por exemplo). 
// Sem isso, o navegador bloqueia as requisições por questões de segurança (CORS - Cross-Origin Resource Sharing).
const jwt = require('jsonwebtoken'); //para gerar token de login, e manter o loogin do usuario mesmo depois de fechar o navegador.
const bcrypt = require('bcrypt'); 
//para senhas seguras, mas não vamos usar agora. O bcrypt é uma biblioteca que ajuda a proteger as senhas dos usuários,
// transformando-as em um formato que é difícil de decifrar, mesmo se alguém conseguir acessar o banco de dados. Ele faz isso usando um processo chamado hashing, 
// que é como uma função matemática que pega a senha original e a transforma em uma sequência de caracteres aparentemente aleatória. 
// Além disso, o bcrypt adiciona um "sal" (salt) à senha antes de fazer o hash, o que torna ainda mais difícil para os hackers quebrarem as senhas usando 
// técnicas como ataques de força bruta ou tabelas rainbow.

const app = express();
app.use(express.json());
//app.use(express.json()); é uma função que "intercepta" todas as requisições antes de chegarem nas rotas. express.json() faz o Express entender requisições cujo corpo (body) está 
// em formato JSON, convertendo automaticamente esse JSON em um objeto JavaScript acessível via req.body. Sem esse middleware, quando o frontend mandar 
// { "email": "...", "senha": "..." },  o req.body apareceria undefined — o Express não saberia interpretar esses dados.
app.use(cors());
// Assim como express.json(), isso é outro middleware — ele intercepta as respostas do seu servidor e adiciona um "selo de autorização" (um header chamado Access-Control-Allow-Origin) dizendo 
// "pode confiar, qualquer origem pode acessar isso" (chamando cors() sem argumentos, ele libera para qualquer origem — ótimo para desenvolvimento; em produção, normalmente se restringe a origens específicas).

const { Pool } = require('pg'); 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

//const { Pool } = require('pg') — isso é destructuring. O require('pg') retorna um objeto com várias propriedades, 
// e estamos extraindo só a propriedade Pool dele, que é uma classe (um "molde" para criar objetos).

//new Pool({...}) — cria uma nova instância dessa classe, passando um objeto de configuração. A propriedade connectionString 
// recebe a URL completa que você colocou no .env.

const PORT = process.env.PORT;

/////////////////////////////////////////// MIDDLEWARE AUTENTICAÇÃO DE TOKEN (JWT) ////////////////////////////////////////

function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (erro, usuario) => {
    if (erro) {
      return res.status(403).json({ erro: 'Token inválido ou expirado' });
    }

    req.usuario = usuario;
    next();
  });
}

//////////////////////////////////////// TESTE DE CONEXÃO COM O BANCO DE DADOS ////////////////////////////////////////
app.get('/teste-db', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT NOW()');
    res.json({ horaAtual: resultado.rows[0] });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao conectar no banco' });
  }
});

/////////////////////////////////////////// ROTAS DE USUÁRIO (CADASTRO) ////////////////////////////////////////
app.post('/cadastro', async (req, res) => {
  try {
    const { nome_usuario, email, senha, telefone } = req.body;

    if (!nome_usuario || !email || !senha) { // Verificação básica para garantir que os campos obrigatórios (nome_usuario, email, senha) estão preenchidos
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }

    //////////////// Validação de formato de email, e da senha usando regex (expressão regular) ////////////////
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ erro: 'Formato de email inválido' });
    }

    // - ^ e $ — marcam início e fim da string (o padrão precisa "casar" com a string inteira)
    // - [^\s@]+ — "um ou mais caracteres que NÃO sejam espaço (\s) nem @"
    // - @ — precisa ter um @ literal no meio
    // - \. — precisa ter um ponto literal (o \ "escapa" o ponto, porque . sozinho em regex significa "qualquer caractere")

    // Ou seja: "algumacoisa@algumacoisa.algumacoisa" — sem espaços, com @ e . nos lugares certos.
    // .test(email) — método que retorna true ou false, dizendo se a string email "casa" com o padrão do regex

    /////////////////////////////////////////////////////////////////////////////////////////////////

    // 1. Gerar o hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);
    // 2. Inserir no banco
      await pool.query('insert into usuarios(nome_usuario, email, senha, telefone) values ($1, $2, $3, $4)', [nome_usuario, email, senhaHash, telefone]);

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso' });
  } catch (erro) {
    console.error(erro);

    if (erro.code === '23505') { 
      // código de erro do PostgreSQL para violação de chave única (unique constraint violation)
      // Isso significa que o email já existe no banco de dados, porque definimos a coluna email como UNIQUE.
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
  }
});

/////////////////////////////////////////// ROTAS DE USUÁRIO (LOGIN) ////////////////////////////////////////

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

      const resultado = await pool.query('select id, email, senha from usuarios where email = $1', [email]);

      if (resultado.rows.length === 0) {
        return res.status(400).json({ erro: 'Email ou senha inválidos' });
      } 
        
      const senhaHash = resultado.rows[0].senha;
      const senhaValida = await bcrypt.compare(senha, senhaHash);
          
      if (!senhaValida) {
        return res.status(400).json({ erro: 'Email ou senha inválidos' });
      }
    
      
    // res.status(200).json({ mensagem: 'Usuário encontrado' }); nesse caso o usuario teria que fazer login toda vez que entrasse no site, 
    // mesmo depois de fechar o navegador, o que não é ideal. Para resolver isso, vamos usar o JWT (JSON Web Token), que é uma forma de criar um token de autenticação que 
    // pode ser armazenado no frontend (por exemplo, no localStorage, ou nos cookies do navegador) e enviado junto com as requisições para o backend, permitindo que o usuário 
    // permaneça logado mesmo depois de fechar o navegador.

    const token = jwt.sign(
    { id: resultado.rows[0].id, email: resultado.rows[0].email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
    );

    res.status(200).json({ mensagem: 'Login realizado com sucesso', token });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao realizar login' });
  }
});

//////////////////////////////////////////// ROTAS DE USUÁRIO (PERFIL) ////////////////////////////////////////

app.get('/perfil', autenticarToken, async (req, res) => {
  try {
    const resultado = await pool.query(
      'select id, nome_usuario, email, telefone from usuarios where id = $1',
      [req.usuario.id]
    );

    res.status(200).json({ usuario: resultado.rows[0] });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
});

////////////////////////////////////////// AVISO DE QUE A API ESTÁ RODANDO, E A SUA PORTA ////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});