import React from 'react';
import { Link } from 'react-router-dom';

function Numero12() {
    return (
        <div>
            <h2>A mover el esqueleto</h2>
            <p>Elijan una obra de la sala de arte cinético y filmense haciendo una coreo entre TODOS inspirada en ella. (no más de 30 segs)</p>
            <p>Luego, envíen el video al WhatsApp de la coordinadora.</p>
            <p>Ya falta poco</p>
            <Link to="/numero13">
                <button>Continuar</button>
            </Link>
        </div>
    );
}

export default Numero12;