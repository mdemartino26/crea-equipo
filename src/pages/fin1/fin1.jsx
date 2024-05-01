import React, { useRef, useEffect } from 'react';
import Header2 from '../../components/header2/header2';
import Decor2 from '../../components/decor2/decor2';
import './fin1.css';
import Premio from '../../assets/img/award.svg';
import PremioSound from '../../assets/sounds/prize.mp3'; // Asegúrate de que la ruta al archivo de sonido sea correcta

function Fin1() {
    const prizeSoundRef = useRef(null);

    useEffect(() => {
        prizeSoundRef.current.play();
    }, []);

    return (
        <>
            <div className='findj'>
                <Header2 />
                <div className="main">
                    <h2>¡Felicitaciones! han ganado el juego </h2>
                    <p> ¡Ve ir a buscar tu premio! </p>
                    <br />
                    <br />
                    <img src={Premio} alt="Felicitaciones" />
                    <p>Gracias por participar</p>
                </div>

                <Decor2 />
                <audio ref={prizeSoundRef} src={PremioSound}></audio>
            </div>
        </>
    );
}

export default Fin1;
