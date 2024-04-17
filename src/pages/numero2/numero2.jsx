import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';

function Numero2() {
    const [respuesta, setRespuesta] = useState('');
    const [error, setError] = useState(false);
    const [respuestaCorrecta, setRespuestaCorrecta] = useState(false);
    const [mostrarSiguiente, setMostrarSiguiente] = useState(true);

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
        } else {
            // Incorrect answer, show error
            setError(true);
        }
    };

    return (
        <div>
            <Header2 />
            <p>Qué obra icónica vienen <strong>TODOS</strong> los turistas brasileros a ver al <strong>MALBA</strong>? Está cerca del inicio de la obra anterior.</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={respuesta}
                    onChange={handleChange}
                    placeholder="Ingrese su respuesta"
                />
                <br />
                {mostrarSiguiente && <button type="submit" class="buttonPpal" >Siguiente</button>}
            </form>
            {error && <p style={{ color: 'red' }}>Respuesta incorrecta. Intente de nuevo.</p>}
            {respuestaCorrecta && (
                <>
                    <p style={{ color: 'green' }}>¡Correcto!</p>
                    <Link to="/numero3">
                        <button class="buttonPpal" >Continuar</button>
                    </Link>
                </>
            )}
        </div>
    );
}

export default Numero2;

