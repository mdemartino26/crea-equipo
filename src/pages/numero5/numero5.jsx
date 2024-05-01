import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import berniFoto from '../../assets/img/auto-berni.png';
import Header2 from '../../components/header2/header2';
import './numero5.css';
import Decor from '../../components/decor/decor';
import CorrectSound from '../../assets/sounds/correct.mp3';
import WrongSound from '../../assets/sounds/wrong.mp3';

function Numero5() {
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
        if (respuestaFormateada === 'berni' || respuestaFormateada === 'antonio berni') {
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
            <Header2 />
            <div className="main">
            <p>El agua te lleva hasta Ramona, que intentará tentarlos con todas sus fuerzas ¿Quién le dio vida?</p>

            <img src={berniFoto} alt="La tentacion - Berni" />
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={respuesta}
                    onChange={handleChange}
                    placeholder="Ingrese su respuesta"
                />
                <br />
                {!respuestaCorrecta && <button type="submit" class="buttonPpal" >Siguiente</button>}
                {error && <p style={{ color: 'red' }}>Respuesta incorrecta. Intente de nuevo.</p>}
                {respuestaCorrecta && <p style={{ color: 'green' }}>¡Correcto!</p>}
                {respuestaCorrecta && (
                    <Link to="/numero6">
                        <button class="buttonPpal" >Continuar</button>
                    </Link>
                )}
            </form>
            </div>
            <Decor/>
            <audio ref={correctSoundRef} src={CorrectSound}></audio>
            <audio ref={wrongSoundRef} src={WrongSound}></audio>
        </div>
    );
}

export default Numero5;
