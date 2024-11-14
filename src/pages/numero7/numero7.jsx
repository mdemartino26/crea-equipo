import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';
import Decor2 from '../../components/decor2/decor2';
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
        // Usamos trim() para eliminar espacios al principio y al final de la respuesta
        const respuestaFormateada = respuesta.toLowerCase().trim().replace(/[^a-zA-Z ]/g, '');
        if (respuestaFormateada === 'pan y trabajo' || respuestaFormateada === 'pan trabajo') {
            // Respuesta correcta, permitir avanzar
            console.log('Respuesta correcta');
            setRespuestaCorrecta(true);
            correctSoundRef.current.play();
        } else {
            // Respuesta incorrecta, mostrar error
            setError(true);
            wrongSoundRef.current.play();
        }
    };

    return (
        <div className='overf'>
            <Header2/>
            <div className="main">
                <p> <br />Levanten sus consignas. <br /> <br />
                Las necesitarán para pasar a la próxima pista.  <br /></p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={respuesta}
                        onChange={handleChange}
                        placeholder="Ingrese su respuesta"
                    />
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>Respuesta incorrecta. Intente de nuevo.</p>}
                    {respuestaCorrecta && <p style={{ color: 'green', marginTop: '10px' }}>¡Correcto!</p>}
                    <br />
                    {!respuestaCorrecta && <button type="submit" className='buttonPpal'>Enviar</button>}
                </form>
                
                {respuestaCorrecta && (
                    <Link to="/numero8">
                        <button className='buttonPpal'>Continuar</button>
                    </Link>
                )}
            </div>
            <Decor2/>
            <audio ref={correctSoundRef} src={CorrectSound}></audio>
            <audio ref={wrongSoundRef} src={WrongSound}></audio>
        </div>
    );
}

export default Numero7;
