import React, { useState } from 'react';

function Numero14() {
    const [answer, setAnswer] = useState('');
    const [showMessage, setShowMessage] = useState(false);

    const checkAnswer = () => {
        if (answer.trim().toLowerCase() === 'constelaciones') {
            // Respuesta correcta, redirigir a FinDeJuego
            window.location.href = '/findejuego';
        } else {
            // Respuesta incorrecta, mostrar mensaje
            setShowMessage(true);
        }
    };

    const handleInputChange = (event) => {
        setAnswer(event.target.value);
        // Ocultar el mensaje de respuesta incorrecta cuando se borra la respuesta
        if (showMessage && event.target.value.trim().toLowerCase() === 'constelaciones') {
            setShowMessage(false);
        }
    };

    return (
        <div>
            <h2>Normalmente está en una iglesia, pero no hay remedio. Ha abandonado las estrellas para instalarse en el Malba.</h2>
            <p>¿De qué obra se trata?</p>
            <input
                type="text"
                value={answer}
                onChange={handleInputChange}
                placeholder="Escribe tu respuesta aquí"
            />
            <br />
            {showMessage && <p style={{ color: 'red' }}>Respuesta incorrecta</p>}
            <button onClick={checkAnswer}>Continuar</button>
        </div>
    );
}

export default Numero14;

