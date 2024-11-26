import React, { useState, useRef } from "react";
import Header2 from "../../components/header2/header2";
import WrongSound from "../../assets/sounds/wrong.mp3";
import Decor from "../../components/decor/decor";

// Función para eliminar las tildes
const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

function Numero14() {
  const [answer, setAnswer] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const wrongSoundRef = useRef(null);

  const checkAnswer = () => {
    // Normaliza la respuesta, eliminando tildes, convirtiendo a minúsculas y eliminando espacios
    const normalizedAnswer = removeAccents(answer.trim().toLowerCase());
    
    if (normalizedAnswer === removeAccents("León Ferrari".toLowerCase())) {
      // Respuesta correcta, redirigir a FinDeJuego
      window.location.href = "/findejuego";
    } else {
      // Respuesta incorrecta, mostrar mensaje
      setShowMessage(true);
      wrongSoundRef.current.play();
    }
  };

  const handleInputChange = (event) => {
    setAnswer(event.target.value);
    // Ocultar el mensaje de respuesta incorrecta cuando se borra la respuesta
    if (
      showMessage &&
      removeAccents(event.target.value.trim().toLowerCase()) ===
        removeAccents("León Ferrari".toLowerCase())
    ) {
      setShowMessage(false);
    }
  };

  const handleClick = () => {
    localStorage.setItem('currentPage', '/finDeJuego');
    console.log('Ruta guardada en localStorage: /finDeJuego');
}


  return (
    <div>
      <Header2 />
      <div className="main">
        <p>
          Él, que es felino pero no gato, <br/>  no va en tren, va en auto. <br/> Y siempre
          va, al principio del fin.
        </p>
        <input
          type="text"
          value={answer}
          onChange={handleInputChange}
          placeholder="Escribe tu respuesta aquí"
        />
        <br />
        {showMessage && <p style={{ color: "red" }}>Respuesta incorrecta</p>}
        <button className="buttonPpal" onClick={() => {checkAnswer(); handleClick()}}>
          Continuar
        </button>
      </div>
      <audio ref={wrongSoundRef} src={WrongSound}></audio>
      <Decor />
    </div>
  );
}

export default Numero14;
