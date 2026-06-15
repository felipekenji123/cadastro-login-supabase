import './Perfil.css'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
// useState - guarda valores que podem mudar e fazem a tela "redesenhar" quando mudam (o "quadro na parede")
// useEffect - permite executar código automaticamente quando o componente aparece na tela, sem precisar de clique/evento
// useNavigate - permite mudar de página via código (ex: depois de validar algo)
// Link - cria links de navegação sem recarregar a página (parecido com <a>, mas controlado pelo React Router)

function Perfil() {

  // Aqui guardamos os dados do usuário (nome, email, telefone) que vamos buscar do backend.
  // Começa como "null" porque, quando a página abre, ainda NÃO temos esses dados - 
  // eles só vão chegar depois que a requisição para o backend responder.
  const [usuario, setUsuario] = useState(null);

  // navigate é a função que usamos para redirecionar o usuário para outra rota (ex: '/'),
  // sem precisar que ele clique em nenhum link.
  const navigate = useNavigate();

  
  ///////////////////////////////////////// LOGOUT ////////////////////////////////////////////

  function handleLogout(e) {
    localStorage.removeItem('token')
  }

  ////////////////////////////// BUSCAR OS DADOS DO PERFIL AO ABRIR A PÁGINA //////////////////////////////

  useEffect(() => {
    // Tudo dentro do useEffect com [] no final roda UMA VEZ SÓ, 
    // logo quando a página de Perfil é exibida pela primeira vez.

    // Criamos uma função "async" separada aqui dentro, porque o useEffect 
    // não pode receber uma função async diretamente.
    async function buscarPerfil() {

      // Pegamos o token que foi salvo no localStorage durante o Login.
      // O localStorage é como uma "caixinha" do navegador que guarda informações 
      // mesmo depois de fechar a aba/navegador.
      const token = localStorage.getItem('token');

      // Se não existe token (usuário nunca fez login, ou já saiu/expirou),
      // não tem porque tentar buscar o perfil - mandamos direto pro Login.
      if (!token) {
        navigate('/');
        return; // para a função aqui, não executa o resto
      }

      try {
        // Fazemos uma requisição GET para a rota /perfil do backend.
        // Essa rota é "protegida" pelo middleware autenticarToken - 
        // ou seja, o backend só responde se recebermos um token válido.

        // O segundo argumento do axios.get é um objeto de CONFIGURAÇÕES da requisição.
        // "headers" são informações extras enviadas junto, fora do corpo principal.
        const resposta = await axios.get(`${import.meta.env.VITE_API_URL}/perfil`, { //tem que ser assim pois ao subir o projeto, ele muda a porta, então usamos uma variavel de ambiente
          headers: {
            // O backend espera o token no formato: "Bearer eyJhbGc..."
            // `Bearer ${token}` monta essa string juntando o texto "Bearer " com o valor da variável token.
            Authorization: `Bearer ${token}`,
          },
        });

        // Se deu tudo certo, o backend devolve { usuario: {...} }.
        // Guardamos esses dados no estado "usuario" - isso faz a tela ser redesenhada,
        // e agora ela vai mostrar os dados reais em vez de "Carregando...".
        setUsuario(resposta.data.usuario);

      } catch (erro) {
        // Se der erro aqui, normalmente significa que o token é inválido ou expirou
        // (o "porteiro" do backend bloqueou com 401 ou 403).

        // Removemos o token inválido do localStorage, já que ele não serve mais.
        localStorage.removeItem('token');

        // E mandamos o usuário de volta para o Login.
        navigate('/');
      }
    }

    // Chamamos a função que criamos acima. Sem essa chamada, ela nunca executaria.
    buscarPerfil();

  }, []); // array vazio = roda só uma vez, quando a página aparece


  ////////////////////////////// O QUE MOSTRAR NA TELA //////////////////////////////

  // Enquanto "usuario" ainda for null (a requisição ainda não respondeu),
  // mostramos "Carregando..." em vez do resto da página.
  // Isso evita tentar acessar "usuario.nome_usuario" quando "usuario" ainda é null
  // (o que daria erro, porque null não tem propriedades).
  if (!usuario) {
    return <p>Carregando...</p>;
  }

  // Se chegou até aqui, é porque "usuario" já tem os dados vindos do backend.
  return (
    <div className='pagina-perfil'>
      <div className="card-perfil">
          <h1>Perfil</h1>
          <p>Nome: {usuario.nome_usuario}</p>
          <p>Email: {usuario.email}</p>
          <p>Telefone: {usuario.telefone}</p>
          <p>Parabéns, essa é sua página!</p>

          
          <p><Link to="/" onClick={handleLogout}>LOGOUT</Link></p>
      </div>
    </div>
  );
}

export default Perfil;