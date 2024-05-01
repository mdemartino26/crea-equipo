import React, { useState, useRef } from 'react';
import fotoBaul from '../../assets/img/baul.jpg'
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';
import Decor2 from '../../components/decor2/decor2';
import './numero7.css';
import CorrectSound from '../../assets/sounds/correct.mp3';
import WrongSound from '../../assets/sounds/wrong.mp3';

function Numero7() {
    const [respuesta, setRespuesta] = useState('');
    const [error, setError] = useState(false);
    const [respuestaCorrecta, setRespuestaCorrecta] = useState(false);
    const correctSoundRef = useRef(null);
    const wrongSoundRef = useRef(null);

    const handleChange = (event) => {
        setRespuesta(event.target.value);
        setError(false); // Reset error state when input changes
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const respuestaFormateada = respuesta.toLowerCase().replace(/[^a-zA-Z ]/g, '');
        if (respuestaFormateada === 'candido portinari' || respuestaFormateada === 'portinari') {
            // Correct answer, allow to advance
            console.log('Respuesta correcta');
            setRespuestaCorrecta(true);
            correctSoundRef.current.play();
        } else {
            // Incorrect answer, show error
            setError(true);
            wrongSoundRef.current.play();
        }
    };

    return (
        <div className='overf'>
            <Header2/>
            <div className="main">
            <img src={fotoBaul} alt="Imagen de user15245033 en Freepik" className='imagen'/>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={respuesta}
                    onChange={handleChange}
                    placeholder="Ingrese su respuesta"
                />
                {error && <p style={{ color: 'red' }}>Respuesta incorrecta. Intente de nuevo.</p>}
                <br />
                {!respuestaCorrecta && <button type="submit" className='buttonPpal'>Enviar</button>}
                {respuestaCorrecta && (
                <Link to="/numero8">
                    <button className='buttonPpal'>Continuar</button>
                </Link>
            )}
            </form>
            
           
            </div>
            <Decor2/>
            <audio ref={correctSoundRef} src={CorrectSound}></audio>
            <audio ref={wrongSoundRef} src={WrongSound}></audio>
        </div>
    );
    
}

export default Numero7;


