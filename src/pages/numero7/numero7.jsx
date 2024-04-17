import React, { useState } from 'react';
import fotoBaul from '../../assets/img/baul.jpeg'
import { Link } from 'react-router-dom';

function Numero7() {
    const [respuesta, setRespuesta] = useState('');
    const [error, setError] = useState(false);
    const [respuestaCorrecta, setRespuestaCorrecta] = useState(false);

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
        } else {
            // Incorrect answer, show error
            setError(true);
        }
    };

    return (
        <div>
            
            <img src={fotoBaul} alt="Imagen" />
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={respuesta}
                    onChange={handleChange}
                    placeholder="Ingrese su respuesta"
                />
                {error && <p style={{ color: 'red' }}>Respuesta incorrecta. Intente de nuevo.</p>}
                <button type="submit">Enviar</button>
            </form>
            {respuestaCorrecta && (
                <Link to="/numero8">
                    <button>Continuar</button>
                </Link>
            )}
        </div>
    );
    
}

export default Numero7;

