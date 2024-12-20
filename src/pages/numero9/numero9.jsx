import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Header2 from "../../components/header2/header2";
import Decor2 from "../../components/decor2/decor2";
import CorrectSound from "../../assets/sounds/correct.mp3";
import WrongSound from "../../assets/sounds/wrong.mp3";

function Numero9() {
  const [respuesta, setRespuesta] = useState("");
  const [error, setError] = useState(false);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(false);
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);

  const handleChange = (event) => {
    setRespuesta(event.target.value);
    setError(false); // Reset error state when input changes
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Usamos trim() para eliminar espacios al principio y al final de la respuesta
    const respuestaFormateada = respuesta
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z ]/g, "");
    if (
      respuestaFormateada === "Remedios Varo" ||
      respuestaFormateada === "remedios varo"
    ) {
      // Respuesta correcta, permitir avanzar
      console.log("Respuesta correcta");
      setRespuestaCorrecta(true);
      correctSoundRef.current.play();
    } else {
      // Respuesta incorrecta, mostrar error
      setError(true);
      wrongSoundRef.current.play();
    }
  };

  const handleClick = () => {
    localStorage.setItem('currentPage', '/numero10');
    console.log('Ruta guardada en localStorage: /numero10');
}

  return (
    <div className="overf">
      <Header2 />
      <div className="main">
        <p>
          {" "}
          Descolla en simpatía y alegría <br /> Y si bien no cura la agonía,<br /> Importante
          fue mientras vivía.<br /> Tan destacada es su obra que hasta el museo no
          fue avaro y <br />la homenajeó como lo merecía <br />
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={respuesta}
            onChange={handleChange}
            placeholder="Ingrese su respuesta"
          />
          {error && (
            <p style={{ color: "red", marginTop: "10px" }}>
              Respuesta incorrecta. Intente de nuevo.
            </p>
          )}
          {respuestaCorrecta && (
            <p style={{ color: "green", marginTop: "10px" }}>¡Correcto!</p>
          )}
          <br />
          {!respuestaCorrecta && (
            <button type="submit" className="buttonPpal">
              Enviar
            </button>
          )}
        </form>

        {respuestaCorrecta && (
          <Link to="/numero10">
            <button className="buttonPpal" onClick={handleClick}>Continuar</button>
          </Link>
        )}
      </div>
      <Decor2 />
      <audio ref={correctSoundRef} src={CorrectSound}></audio>
      <audio ref={wrongSoundRef} src={WrongSound}></audio>
    </div>
  );
}

export default Numero9;
