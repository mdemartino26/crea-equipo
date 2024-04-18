import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';
import Decor2 from '../../components/decor2/decor2';

function Numero9() {
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
        if (respuestaFormateada === 'pan y trabajo' || respuestaFormateada === 'pan trabajo') {
            // Correct answer, allow to advance
            console.log('Respuesta correcta');
            setRespuestaCorrecta(true);
        } else {
            // Incorrect answer, show error
            setError(true);
        }
    };

    return (
        <div className='overf'>
            <Header2/>
            <div className="main">
                <p>Levanten sus consignas. <br />
                Las necesitarán para pasar a la próxima pista.</p>
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
                    <Link to="/numero10">
                        <button className='buttonPpal'>Continuar</button>
                    </Link>
                )}
            </div>
            <Decor2/>
        </div>
    );
}

export default Numero9;

