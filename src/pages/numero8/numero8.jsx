import React from 'react';
import relojDeArena from '../../assets/img/reloj-de-arena.gif';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';

function Numero8() {
    return (
        <div className='overf'>
            <Header2/>
            <div className="main">
            <p>Dejando atrás el candombe, un nuevo desafío encontrarán. ¡No pierdan la cabeza pues la necesitarán!</p>
            <img src={relojDeArena} alt="Reloj de arena" />
            <br />
            <Link to="/numero9">
                <button className='buttonPpal'>Continuar</button>
            </Link>
            </div>
        </div>
    );
}

export default Numero8;
