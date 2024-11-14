import React from 'react';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';

import Decor from '../../components/decor/decor';

function Numero13() {
    return (
        <div className='confetti'>
            <Header2/>
            <div className="mainHeight">
            <h2>Han llegado a la meta y ahora tienen dos opciones:</h2>
            <div id='botones'>
            <Link to="/Fin1">
                <button className='buttonNoConfirmar'>Premio asegurado</button>
            </Link>
            <Link to="/pitch">
                <button className='buttonConfirmar'>Seguir jugando</button>
            </Link>
            </div>
        </div>
        <Decor/>
        </div>
    );
}

export default Numero13;
