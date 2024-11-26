import React, { useRef, useEffect } from 'react';
import Header2 from '../../components/header2/header2';
import Decor2 from '../../components/decor2/decor2';
import './fin1.css';
import Premio from '../../assets/img/award.svg';
import PremioSound from '../../assets/sounds/prize.mp3'; 
import { useNavigate } from 'react-router-dom';

function Fin1() {
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
        <>
            <div className='findj'>
                <Header2 />
                <div className="main">
                    <h2>¡Felicitaciones! han ganado el juego </h2>
                    <p> ¡Pueden buscar su premio! </p>
                    <br />
                    <br />
                    <img src={Premio} alt="Felicitaciones" />
                    <p>Gracias por participar</p>
                </div>

                <button className="buttonPpal" onClick={handleRestart}>
                    Volver al inicio
                </button>

                <Decor2 />
                <audio ref={prizeSoundRef} src={PremioSound}></audio>
            </div>
        </>
    );
}

export default Fin1;
