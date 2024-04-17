import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Numero9() {
    const [respuesta, setRespuesta] = useState('');
    const [error, setError] = useState(false);

    const handleChange = (event) => {
        setRespuesta(event.target.value);
        setError(false); // Reset error state when input changes
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const respuestaFormateada = respuesta.toLowerCase().replace(/[^a-zA-Z ]/g, '');
        if (respuestaFormateada === 'pan y trabajo' || respuestaFormateada === 'pan trabajo') {
            // Correct answer, allow to advance
            console.log('Respuesta correcta');
            // Aquí puedes hacer algo para avanzar a la página Numero10
        } else {
            // Incorrect answer, show error
            setError(true);
        }
    };

    return (
        <div>
            <p>Levanten sus consignas. Las necesitarán para pasar a la próxima pista.</p>
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
            {/* Botón de continuar solo visible si la respuesta es correcta */}
            {respuesta === 'pan y trabajo' || respuesta === 'pan trabajo' && (
                <Link to="/numero10">
                    <button>Continuar</button>
                </Link>
            )}
        </div>
    );
}

export default Numero9;
