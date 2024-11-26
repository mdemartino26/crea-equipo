import React from 'react';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';
import './numero12.css';
import Decor from '../../components/decor/decor';

function Numero12() {

    const handleClick = () => {
        localStorage.setItem('currentPage', '/fin1');
        console.log('Ruta guardada en localStorage: /fin1');
    }

    const handleClick2 = () => {
        localStorage.setItem('currentPage', '/pitch');
        console.log('Ruta guardada en localStorage: /pitch');
    }

    return (
        <div className='confetti'>
            <Header2/>
            <div className="mainHeight">
            <h2>Han llegado a la meta y ahora tienen dos opciones:</h2>
            <div id='botones'>
            <Link to="/Fin1">
                <button className='buttonNoConfirmar' onClick={handleClick}>Premio asegurado</button>
            </Link>
            <Link to="/pitch">
                <button className='buttonConfirmar' onClick={handleClick2}>Seguir jugando</button>
            </Link>
            </div>
        </div>
        <Decor/>
        </div>
    );
}

export default Numero12;