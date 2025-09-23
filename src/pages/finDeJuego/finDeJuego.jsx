import React, { useRef, useEffect } from 'react';
import Header2 from '../../components/header2/header2';
import './finDeJuego.css';
import PremioSound from '../../assets/sounds/prize.mp3'; 
import { useNavigate } from 'react-router-dom';

function FinDeJuego() {
    const prizeSoundRef = useRef(null);
    const navigate = useNavigate(); // Hook para navegación programática

    useEffect(() => {
        prizeSoundRef.current.play();
    }, []);

    // Función para borrar el localStorage y redirigir al inicio
    const handleRestart = () => {
        localStorage.clear();  // Borra todo el localStorage
        navigate('/');         // Redirige a la página de inicio
    };

    return (
        <div className='confetti2'>
            <Header2/>
            <div className="main">
                <h1> <strong>¡Felicitaciones!</strong></h1>
                <h2><strong>Han ganado el juego :)</strong></h2>
                {/* Botón para reiniciar el juego */}
                <button className="buttonPpal" onClick={handleRestart}>
                    Volver al inicio
                </button>
            </div>
            <audio ref={prizeSoundRef} src={PremioSound}></audio>
        </div>
    );
}

export default FinDeJuego;
