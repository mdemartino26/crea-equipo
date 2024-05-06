import React, { useState, useRef, useEffect } from 'react';
import Header2 from '../../components/header2/header2';
import './finDeJuego.css';
import PremioSound from '../../assets/sounds/prize.mp3'; 

function FinDeJuego() {
    const respuestaGuardada = localStorage.getItem('respuestaNumero6');
    const [mostrarRespuestas, setMostrarRespuestas] = useState(false);
    const prizeSoundRef = useRef(null);

    const handleVerRespuestas = () => {
        setMostrarRespuestas(true);
    };

    const handleOcultarRespuestas = () => {
        setMostrarRespuestas(false);
    };

    useEffect(() => {
        prizeSoundRef.current.play();
    }, []);


    return (
        <div className='confetti2'>
            <Header2/>
            <div className="main">
            <h1> <strong>¡Felicitaciones! <br /> Han ganado el juego :)</strong></h1>
            {!mostrarRespuestas && <button onClick={handleVerRespuestas} className='buttonPpal'>Ver respuestas</button>}
            {mostrarRespuestas && (
                <div>
                    <button className='buttonPpal' onClick={handleOcultarRespuestas}>Ocultar respuestas</button>
                    <br />
                    <br /><br />
                    <p>{respuestaGuardada}</p>
                    
                </div>
            )}
        </div>
        <audio ref={prizeSoundRef} src={PremioSound}></audio>
        </div>
    );
}

export default FinDeJuego;
