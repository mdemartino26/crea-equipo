import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import berniFoto from '../../assets/img/Berni.jpg';
import Header2 from '../../components/header2/header2';
import './numero5.css';

function Numero5() {
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
        if (respuestaFormateada === 'berni' || respuestaFormateada === 'antonio berni') {
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
            <Header2 />
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
    );
}

export default Numero5;
