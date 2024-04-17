import React from 'react';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';

function Reglas() {
    

    return (

        <div>
            <Header2 />
            <h1>Reglas</h1>
            <ul>
                <li>Leer bien las consignas</li>
                <li>Si se traban, pueden consutlar</li>
                <li>Tienen que observar bien</li>
                <li>¡Diviertanse!</li>
            </ul>
            <Link to="/numero1"><button>Siguiente</button></Link>
        </div>
    );
}

export default Reglas;