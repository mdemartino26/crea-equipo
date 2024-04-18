import React, { useState } from 'react';
import Header2 from '../../components/header2/header2';
import './finDeJuego.css';

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
        <div className='confetti2'>
            <Header2/>
            <div className="main">
            <h2>Felicitaciones! han ganado el juego :)</h2>
            {!mostrarRespuestas && <button onClick={handleVerRespuestas} className='buttonPpal'>Ver respuestas</button>}
            {mostrarRespuestas && (
                <div>
                    <p>{respuestaGuardada}</p>
                    <button className='buttonPpal' onClick={handleOcultarRespuestas}>Ocultar respuestas</button>
                </div>
            )}
        </div>
        </div>
    );
}

export default FinDeJuego;
