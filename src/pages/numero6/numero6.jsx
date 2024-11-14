import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import rompe1 from "../../assets/img/rompe1.jpg";
import rompe2 from "../../assets/img/rompe2.jpg";
import rompe3 from "../../assets/img/rompe3.png";
import Header2 from "../../components/header2/header2";
import "./numero6.css";
import Decor from "../../components/decor/decor";
import correctoSound from "../../assets/sounds/correct.mp3"; 
import wrong from "../../assets/sounds/wrong.mp3";

function Numero6() {
  const [respuestaCorrecta, setRespuestaCorrecta] = useState(null);
  const navigate = useNavigate();

  const handleSeleccion = (opcion) => {
    if (opcion === "3") {
      setRespuestaCorrecta(true);
      
      // Reproduce el sonido de respuesta correcta
      const audio = new Audio(correctoSound);
      audio.play();

      // Redirige después de 2 segundos
      setTimeout(() => {
        navigate("/numero7");
      }, 2000);
    } else {
      setRespuestaCorrecta(false);
      
      // Reproduce el sonido de respuesta incorrecta
      const audio = new Audio(wrong);
      audio.play();
    }
  };

  return (
    <div className="overf">
      <Header2 />
      <div className="main">
        <div id="uno">
          <p>
            Dejando atrás el candombe, un nuevo desafío encontrarán. No pierdan
            la cabeza pues la necesitarán!
          </p>
          <p>¿Qué imagen no está en la obra del Museo?</p>

          <div id="imagenes">
            <img
              src={rompe1}
              alt="rompecabezas"
              onClick={() => handleSeleccion("1")}
              className="clickable-image"
            />
            <img
              src={rompe2}
              alt="no rompecabezas"
              onClick={() => handleSeleccion("2")}
              className="clickable-image"
            />
            <img
              src={rompe3}
              alt="rompecabezas"
              onClick={() => handleSeleccion("3")}
              className="clickable-image"
            />
          </div>

          {respuestaCorrecta === true && (
            <p style={{ color: "green" }}>
              ¡Correcto! La imagen 3 no está en la obra del Museo.
            </p>
          )}
          {respuestaCorrecta === false && (
            <p style={{ color: "red" }}>
              Respuesta incorrecta. Intente de nuevo.
            </p>
          )}
        </div>
      </div>
      <Decor />
    </div>
  );
}

export default Numero6;
