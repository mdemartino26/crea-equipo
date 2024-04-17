import React, { useState } from 'react';

function FinDeJuego() {
    const respuestaGuardada = localStorage.getItem('respuestaNumero6');
    const [mostrarRespuestas, setMostrarRespuestas] = useState(false);

    const handleVerRespuestas = () => {
        setMostrarRespuestas(true);
    };

    const handleOcultarRespuestas = () => {
        setMostrarRespuestas(false);
    };

    return (
        <div>
            <h2>Felicitaciones! han ganado el juego :)</h2>
            {!mostrarRespuestas && <button onClick={handleVerRespuestas}>Ver respuestas</button>}
            {mostrarRespuestas && (
                <div>
                    <p>{respuestaGuardada}</p>
                    <button onClick={handleOcultarRespuestas}>Ocultar respuestas</button>
                </div>
            )}
        </div>
    );
}

export default FinDeJuego;
