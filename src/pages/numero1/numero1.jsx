import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';
import './numero1.css';
import Decor from '../../components/decor/decor';
import CorrectSound from '../../assets/sounds/correct.mp3';
import WrongSound from '../../assets/sounds/wrong.mp3';

function Numero1() {
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
        if (parseInt(respuesta) === 29) {
            // Correct answer, allow to advance
            console.log('Respuesta correcta');
            setRespuestaCorrecta(true);
            setMostrarSiguiente(false);
            correctSoundRef.current.play(); // Play correct sound
        } else {
            // Incorrect answer, show error
            setError(true);
            wrongSoundRef.current.play(); // Play wrong sound
        }
    };

    return (
        <div>
            <Header2 />
            <div className='main'>
                <p>Ellas son blancas. Intentan con todas sus fuerzas unirse, pero no lo logran. (número)</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={respuesta}
                        onChange={handleChange}
                        placeholder="Ingrese su respuesta"
                    />
                    <br />
                    {mostrarSiguiente && <button type="submit" className="buttonPpal">Siguiente</button>}

                    {error && <p style={{ color: 'red' }}>Respuesta incorrecta. Intente de nuevo.</p>}
                    {respuestaCorrecta && (
                        <>
                            <p style={{ color: 'green' }}>¡Correcto!</p>
                            <Link to="/numero2">
                                <button className="buttonPpal">Continuar</button>
                            </Link>
                        </>
                    )}
                </form>
            </div>
            <Decor />
            <audio ref={correctSoundRef} src={CorrectSound}></audio>
            <audio ref={wrongSoundRef} src={WrongSound}></audio>
        </div>
    );
}

export default Numero1;