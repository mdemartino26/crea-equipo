import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';

function Numero1() {
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
        if (parseInt(respuesta) === 29) {
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
            <p>Ellas son blancas. Intentan con todas sus fuerzas unirse, pero no lo logran.</p>
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
                    <Link to="/numero2">
                        <button class="buttonPpal" >Continuar</button>
                    </Link>
                </>
            )}
        </div>
    );
}

export default Numero1;