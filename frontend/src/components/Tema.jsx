import { useState, useEffect } from "react";
import './Tema.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons';

function Tema() {

    const [tema, setTema] = useState (() =>{return localStorage.getItem('tema') || 'dark';});
    //"se getItem retornar algo verdadeiro (uma string com texto), use isso; se retornar null (que é "falsy"), use 'dark'"
    // useState pode receber uma função como valor inicial.

   /*  Por que uma função, em vez de só useState(localStorage.getItem('tema') || 'dark')? 

    Pensa no "desenhista": o valor inicial de um useState só importa na primeira vez que o componente é desenhado. Se você escrever 
    localStorage.getItem(...) direto (sem função), essa leitura do localStorage aconteceria a cada renderização, 
    mesmo sendo desnecessário depois da primeira vez. Passando uma função, o React garante que ela só roda uma vez — na primeira renderização. 
    É uma otimização, mas também uma boa prática quando o "cálculo" do valor inicial dá um pouco mais de trabalho (como ler do localStorage). */

    useEffect(() => { //acontece quando abre a página (todas as páginas) mas tambem sempre que o componente tema for clicado
        document.documentElement.setAttribute('data-theme', tema);
        localStorage.setItem('tema', tema);
    }, [tema]);

    function alternarTema() {
        if (tema === 'dark') {
            setTema('light')
        } else {
            setTema('dark')
        }
    }

    return (
        <>
            <button className="contraste" onClick={alternarTema}>
                <FontAwesomeIcon icon={faCircleHalfStroke} />
            </button>
        </>
    ) 
}

export default Tema;