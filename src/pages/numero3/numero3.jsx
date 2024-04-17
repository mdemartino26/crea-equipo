import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/header/header';

function Numero3() {
    const [respuesta, setRespuesta] = useState('');
    const [error, setError] = useState(false);
    const [mostrarPista, setMostrarPista] = useState(false);
    const [respuestaCorrecta, setRespuestaCorrecta] = useState(false);

    const handleChange = (event) => {
        setRespuesta(event.target.value);
        setError(false); // Reset error state when input changes
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const respuestaFormateada = respuesta.toLowerCase().replace(/[^a-zA-Z ]/g, '');
        const palabras = respuestaFormateada.split(' ').filter(palabra => palabra !== '');
        if (
            palabras.length === 3 &&
            palabras.includes('venecia') &&
            palabras.includes('nueva') &&
            palabras.includes('york')
        ) {
            // Correct answer, allow to advance
            console.log('Respuesta correcta');
            setRespuestaCorrecta(true);
        } else {
            // Incorrect answer, show error
            setError(true);
        }
    };

    const handleMostrarPista = () => {
        setMostrarPista(true);
    };

    return (
        <div>
            <Header />
            <p>Si continúan caminando, se encontrarán con dos ciudades enverdecidas.</p>
            <form onSubmit={handleSubmit}>
                <button type="button" onClick={handleMostrarPista}>Pista</button>
                {mostrarPista && <p>3 palabras</p>}
                <br />
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
                    <Link to="/numero5">
                        <button class="buttonPpal" >Continuar</button>
                    </Link>
                )}
            </form>
        </div>
    );
}

export default Numero3;
