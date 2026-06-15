import './Login.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Login() {

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagemErro, setMensagemErro] = useState('');

    const navigate = useNavigate();

    useEffect ( () => { // useEffect verifica logo ao abrir a página se o usuario ja tem um login ou não
        const token = localStorage.getItem('token')

        if (token) {
            navigate('/perfil');
        }
    }, []);

    async function handleSubmit (e) {
        e.preventDefault();

        try {
            const resposta = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { //tem que ser assim pois ao subir o projeto, ele muda a porta, então usamos uma variavel de ambiente
                email: email,
                senha: senha,
            });

            localStorage.setItem('token', resposta.data.token); //guarda o token no localStorage do navegador, para que o usúario não seja deslogado sempre que sair do navegador
            navigate('/perfil');

        } catch (erro) {
            if (erro.response) {
                setMensagemErro (erro.response.data.erro);
            } else {
                setMensagemErro ("Erro de conexão com o servidor");
            }
        }
    }

    return (
        <div className="pagina-login">
            <div className="card-login">
                <h1>LOGIN</h1>

                <form onSubmit={handleSubmit}>

                    <div>
                        <label htmlFor="email">Email: </label>
                        <input 
                        type="email" 
                        id ="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="senha">Senha: </label>
                        <input 
                        type="password" 
                        id ="senha" 
                        value={senha} 
                        onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>

                    {mensagemErro && <p style={{ color: 'red' }}>{mensagemErro}</p>}

                    <button type="submit">Entrar</button>

                    <p> Ainda não tem uma conta? <Link to="/cadastro"> CADASTRE-SE </Link> </p>
                </form>        
            </div>
        </div>
    );
}

export default Login;