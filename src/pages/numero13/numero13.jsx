import React from 'react';
import { Link } from 'react-router-dom';

function Numero13() {
    return (
        <div>
            <h2>Han llegado a la meta y ahora tienen dos opciones:</h2>
            <Link to="/Fin1">
                <button>Premio asegurado</button>
            </Link>
            <Link to="/pitch">
                <button>Seguir jugando</button>
            </Link>
        </div>
    );
}

export default Numero13;
