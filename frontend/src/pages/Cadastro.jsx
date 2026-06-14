import './Cadastro.css';
import { useState } from 'react';
import axios from 'axios'; // conecta o frontend com o backend, para enviar os dados do cadastro e receber a resposta.
import { useNavigate } from 'react-router-dom'; //para mudar de página depois do cadastro bem-sucedido autmaticamente, serm ter que clicar em algum link ou botão.

//Quando você clica em "Cadastrar", o frontend precisa:

// Escrever uma carta com os dados (nome, email, senha, telefone)
// Enviar essa carta para o endereço do backend (http://localhost:3000/cadastro)
// Esperar a resposta chegar de volta
// Ler o que veio na resposta (deu certo? deu erro?)
// O axios é a "ferramenta de correio" que faz esses passos 2 e 3 para você.

function Cadastro() {
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [fone, setFone] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  
  //para verificar senha
  const temMinimo8 = senha.length >= 8;
  const temMaiuscula = /[A-Z]/.test(senha);
  const temMinuscula = /[a-z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[^A-Za-z0-9]/.test(senha);

  const senhaValida = temMinimo8 && temMaiuscula && temMinuscula && temNumero && temEspecial; //só vai ser valido se todas as condições forem verdadeiras

  const navigate = useNavigate(); 
  // useNavigate é um hook do react-router-dom que te dá uma função para mudar de página programaticamente. 
  // Depois de um cadastro bem-sucedido, a gente vai chamar navigate('/') para ir para a página inicial.

  async function handleSubmit(e) {
    // Enviar a carta e esperar a resposta leva tempo (mesmo que seja uma fração de segundo) — o frontend precisa "pausar" naquele ponto até a resposta chegar, sem travar o resto da aplicação.
    // Por isso, a função handleSubmit precisa se tornar async:
    // async function handleSubmit(e) {
    // E, quando formos chamar o axios, usamos await na frente — isso significa "pausa aqui até a resposta chegar, depois continue para a próxima linha".

        e.preventDefault();
        {/*e é o evento de "submit". Por padrão, quando um <form> é submetido, o navegador tenta recarregar a página (enviando os dados como faria um site tradicional).*/}
        {/* preventDefault() cancela esse comportamento padrão, deixando o React no controle total do que acontece. */}

        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }

        if (!senhaValida) {
          alert("Senha não cumpre os requisitos necessários")
          return;
        }

        try {
            // axios.post(endereco (para quem está mandando os dados), conteudoDaCarta ( que dados estamos mandando))
             // post é o "tipo de envio" (lembra que no backend criamos a rota com app.post('/cadastro', ...)? Os dois lados — quem envia e quem recebe — precisam "combinar" o mesmo tipo)
            const resposta = await axios.post('http://localhost:3000/cadastro', {
              //nomes a esqerda são os campos esperados pelo backend, e os valores à direita são as variáveis de estado do frontend.
                nome_usuario: nomeUsuario, 
                email: email,
                senha: senha,
                telefone: fone,
            });

            setMensagemSucesso('Cadastro realizado com sucesso!'); 
            setTimeout(() => {
              navigate('/');
            }, 1000);
            // Se o cadastro for bem-sucedido, redireciona para a página inicial, de login (ou qualquer outra página que você queira). 
            // E tem o timeout para dar um tempinho de mostrar a mensagem de sucesso antes de mudar de página. (1000 milissegundos = 1 segundo), isso é uma função nativa de JavaScript
        } catch (erro) {
            if (erro.response) { 
              //verifica se o erro tem uma resposta do backend (ou seja, se o backend respondeu com um status de erro, como 400 ou 409, ou se é apenas undefined, o que daria erro e cairia no else)
              setMensagemErro(erro.response.data.erro);
            } else {
              setMensagemErro('Erro de conexão com o servidor');
            }
            // quando o backend responde com um erro (ex: status 409 "Email já cadastrado"), o axios trata isso como uma "carta de erro" e cai no catch. 
            // O conteúdo dessa carta de erro (o JSON { erro: 'Email já cadastrado' } que o seu backend manda) fica em erro.response.data.erro
        }
    }

    function voltarLogin() {
      navigate('/');
    }

  return (
    <div className="pagina-cadastro">
      <div className="card-cadastro">

      <h1>CADASTRO</h1>

        <form onSubmit={handleSubmit}>

          <div>
            <label htmlFor="email">Email: </label> {/* O htmlFor aqui é importante para acessibilidade, ele "liga" o label ao input. */}
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo: email@email.com"
              max-lenght="255"
            />
          </div>

          <div>
            <label htmlFor="nomeUsuario">Nome de usuário: </label> {/* O htmlFor aqui é importante para acessibilidade, ele "liga" o label ao input. */}
            <input
              type="text"
              id="nomeUsuario"
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              placeholder='max: 50 caracteres'
              maxLength="50"
            />
          </div>

          <div>
            <label htmlFor="senha">Senha: </label> {/* O htmlFor aqui é importante para acessibilidade, ele "liga" o label ao input. */}
            <input
              type="password"
              id="senha"
              minLength="8"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

              <p style={{color: !temMinimo8? '#FF6D00' : '#8A8A8A', textDecoration: !temMinimo8? 'none' : 'line-through', fontWeight: 'bold'}}> - Pelo menos 8 caracteres </p> 
              {/* condicao ? valorSeVerdadeiro : valorSeFalso é uma forma "compacta" de if/else, usada dentro de expressões (como dentro de {} no JSX, 
              onde não podemos colocar um if "normal"). Aqui: "se temMinimo8 for true, a cor é white; senão, lightgray". */}
              <p style={{color: !temMaiuscula? '#FF6D00' : '#8A8A8A', textDecoration: !temMaiuscula? 'none' : 'line-through', fontWeight: 'bold' }}> - Letras maiusculas </p>
              <p style={{color: !temMinuscula? '#FF6D00' : '#8A8A8A', textDecoration: !temMinuscula? 'none' : 'line-through', fontWeight: 'bold' }}> - Letras minusculas </p> 
              <p style={{color: !temNumero? '#FF6D00' : '#8A8A8A', textDecoration: !temNumero? 'none' : 'line-through', fontWeight: 'bold' }}> - Números </p> 
              <p style={{color: !temEspecial? '#FF6D00' : '#8A8A8A', textDecoration: !temEspecial? 'none' : 'line-through', fontWeight: 'bold' }}> - Cáracteres especiais </p> 
            
          </div>

          <div>
            <label htmlFor="ConfirmarSenha">Confirmar Senha: </label> {/* O htmlFor aqui é importante para acessibilidade, ele "liga" o label ao input. */}
            <input
              type="password"
              id="ConfirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />

            {confirmarSenha && senha !== confirmarSenha && ( <p style={{ color: 'red' }}>As senhas não coincidem</p> )}
            {/* A linha acima é uma renderização condicional com && em react,  
            O operador && em JS funciona assim: ele avalia da esquerda para a direita, e para no primeiro valor "falsy" (false, vazio, etc.) — se encontrar um, retorna ele. 
            Se todos forem "truthy" (verdadeiros), retorna o último valor.
            - Se confirmarSenha for uma string vazia '' (falsy) → a expressão toda já "para" aqui e retorna '' → o React não renderiza nada (string vazia não aparece)
            - Se confirmarSenha não for vazio (truthy) → continua para senha !== confirmarSenha
            - Se forem iguais → false → a expressão para aqui, retorna false → React não renderiza nada
            - Se forem diferentes → true → continua e retorna o <p>...</p>, que é renderizado */}

          </div>

          <div>
            <label htmlFor="telefone">Telefone (opcional):</label> {/* O htmlFor aqui é importante para acessibilidade, ele "liga" o label ao input. */}
            <input
              type="tel"
              id="telefone"
              value={fone}
              onChange={(e) => setFone(e.target.value)}
              placeholder="exemplo: 11999999999"
              maxLength="11"
            />
          </div>

          {mensagemErro && <p style={{ color: 'red' }}>{mensagemErro}</p>}
          {/* A linha acima é outra renderização condicional: se mensagemErro for uma string vazia (falsy), a expressão para no primeiro valor e retorna '', e o React não renderiza nada.
          Se mensagemErro tiver algum texto (truthy), a expressão continua e retorna o <p>...</p>, que é renderizado, mostrando a mensagem de erro vinda do backend. */}
          {mensagemSucesso && <p style={{ color: 'gold' }}>{mensagemSucesso}</p>}

          <button type="submit">Cadastrar</button> 
          {/* type="submit" no botão — diz ao navegador "esse botão deve disparar o evento onSubmit do form ao qual pertence". */}
          {/* O onSubmit do form é o evento que ocorre quando o formulário é submetido, seja clicando no botão de submit ou pressionando Enter dentro de um campo de input. */}

          <button type="button" onClick={voltarLogin}>Voltar para Login</button> 
        </form>
        
      </div>
    </div>
  );
}

export default Cadastro;