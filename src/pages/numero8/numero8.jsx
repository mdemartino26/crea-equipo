import React from 'react';
import relojDeArena from '../../assets/img/reloj-de-arena.gif';
import { Link } from 'react-router-dom';

function Numero8() {
    return (
        <div>
            
            <p>Dejando atrás el candombe, un nuevo desafío encontrarán. ¡No pierdan la cabeza pues la necesitarán!</p>
            <img src={relojDeArena} alt="Reloj de arena" />
            <Link to="/numero9">
                <button>Continuar</button>
            </Link>
        </div>
    );
}

export default Numero8;
