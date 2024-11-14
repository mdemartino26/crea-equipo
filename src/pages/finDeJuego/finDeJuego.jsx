import React, { useState, useRef, useEffect } from 'react';
import Header2 from '../../components/header2/header2';
import './finDeJuego.css';
import PremioSound from '../../assets/sounds/prize.mp3'; 

function FinDeJuego() {
    const prizeSoundRef = useRef(null);


    useEffect(() => {
        prizeSoundRef.current.play();
    }, []);


    return (
        <div className='confetti2'>
            <Header2/>
            <div className="main">
            <h1> <strong>¡Felicitaciones! <br /> Han ganado el juego :)</strong></h1>
            
        </div>
        <audio ref={prizeSoundRef} src={PremioSound}></audio>
        </div>
    );
}

export default FinDeJuego;
