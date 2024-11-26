import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';
import Decor from '../../components/decor2/decor2';
import CorrectSound from '../../assets/sounds/correct.mp3';
import WrongSound from '../../assets/sounds/wrong.mp3';

function Numero2() {
    const [respuesta, setRespuesta] = useState('');
    const [error, setError] = useState(false);
    const [respuestaCorrecta, setRespuestaCorrecta] = useState(false);
    const [mostrarSiguiente, setMostrarSiguiente] = useState(true);
    const correctSoundRef = useRef(null);
    const wrongSoundRef = useRef(null);

    const handleChange = (event) => {
        setRespuesta(event.target.value);
        setError(false); // Reset error state when input changes
        setRespuestaCorrecta(false); // Reset correct answer state when input changes
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (respuesta.trim().toLowerCase() === 'abaporu') {
            // Correct answer, allow to advance
            console.log('Respuesta correcta');
            setRespuestaCorrecta(true);
            setMostrarSiguiente(false);
            correctSoundRef.current.play();
        } else {
            // Incorrect answer, show error
            setError(true);
            wrongSoundRef.current.play();
        }
    };

    const handleClick = () => {
        localStorage.setItem('currentPage', '/numero3');
        console.log('Ruta guardada en localStorage: /numero3');
    }

    return (
        <div className='overf'>
            <Header2 />
            <div className="main">
            <p>¿Qué obra icónica vienen <strong>TODOS</strong> los turistas brasileros a ver <strong>en el museo</strong>? <br /><br />Está cerca de la obra anterior.</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={respuesta}
                    onChange={handleChange}
                    placeholder="Ingrese su respuesta"
                />
                <br />
                {mostrarSiguiente && <button type="submit" className="buttonPpal" >Siguiente</button>}
            
            {error && <p style={{ color: 'red' }}>Respuesta incorrecta. Intente de nuevo.</p>}
            {respuestaCorrecta && (
                <>
                    
                    <Link to="/numero3">
                        <button className="buttonPpal" onClick={handleClick} >Continuar</button>
                    </Link>
                    <p style={{ color: 'green' }}>¡Correcto!</p>
                </>
            )}</form>
            </div>
            <Decor/>
            <audio ref={correctSoundRef} src={CorrectSound}></audio>
            <audio ref={wrongSoundRef} src={WrongSound}></audio>
        </div>
    );
}

export default Numero2;

