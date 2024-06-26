import React, { useState,  useRef } from 'react';
import Header2 from '../../components/header2/header2';
import WrongSound from '../../assets/sounds/wrong.mp3';
import Decor from '../../components/decor/decor';

function Numero14() {
    const [answer, setAnswer] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const wrongSoundRef = useRef(null);

    const checkAnswer = () => {
        if (answer.trim().toLowerCase() === 'constelaciones') {
            // Respuesta correcta, redirigir a FinDeJuego
            window.location.href = '/findejuego';
        } else {
            // Respuesta incorrecta, mostrar mensaje
            setShowMessage(true);
            wrongSoundRef.current.play();
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
            <Header2/>
            <div className="main">
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
            <button className='buttonPpal' onClick={checkAnswer}>Continuar</button>
        </div>
        <audio ref={wrongSoundRef} src={WrongSound}></audio>
        <Decor/>
        </div>
    );
}

export default Numero14;

