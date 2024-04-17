import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Numero10() {
    const [respuesta, setRespuesta] = useState('');
    const [error, setError] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const handlePopupSubmit = (respuestaPopup) => {
        if (respuestaPopup === 'si') {
            // Continuar a la página Numero11
            console.log('Continuar a Numero11');
        } else {
            // Permanecer en la página Numero10
            console.log('Permanecer en Numero10');
        }
    };

    return (
        <div>
            <p>Cómo le vendemos al cliente una obra que pudo haber hecho nuestro sobrino?</p>
            <p>Condición: NO USAR CONCEPTOS ARTÍSTICOS</p>
            {showPopup && (
                <div className="popup">
                    <p>¿Ya armaron el pitch de venta? Lo necesitarán luego!</p>
                    <Link to="/numero11"> <button>Si</button> </Link>
                    <Link to="/numero10"> <button>No</button></Link>
                </div>
            )}
            {!showPopup && (
                <button onClick={() => setShowPopup(true)}>Responder</button>
            )}
        </div>
    );
}

export default Numero10;
