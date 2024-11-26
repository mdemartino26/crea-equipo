import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header2 from "../../components/header2/header2";
import "./pitch.css";
import PitchGif from "../../assets/img/pitch.gif"
import Decor from "../../components/decor/decor";

function Pitch() {
  const [stage, setStage] = useState("presentacion");
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let timerInterval;
    if (stage === "timer") {
      timerInterval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer > 0) {
            return prevTimer - 1;
          } else {
            clearInterval(timerInterval);
            window.location.href = "/numero14";
            return 0;
          }
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [stage]);

  
 
  const handleClick = () => {
    localStorage.setItem('currentPage', '/numero14');
    console.log('Ruta guardada en localStorage: /numero14');
}

  return (
    <div className="overf">
      <Header2 />
      <div className="main">
        {stage === "presentacion" && (
          <div>
            <h2>Momento de estrenar el pitch de venta.</h2>
            <p>
              Todos los grupos expondrán y por consenso (votado por mayoría)
              elegirán al ganador. Este tendrá ventaja para emprender el último
              desafío.
            </p>
            <img src={PitchGif} alt="" />
            <p>¿Ya expusieron?</p>
            <div id="botones">
              <button
                onClick={() => setStage("ganaron")}
                className="buttonConfirmar"
              >
                Continuar
              </button>
        
            </div>
          </div>
        )}
        {stage === "ganaron" && (
          <div>
            <br />
            <br />

            <p>¿Ganaron?</p>
            <br />
            <br />
            <div id="botones">
              <button
                onClick={() => {setStage("timer"); handleClick()}}
                className="buttonNoConfirmar"
              >
                No
              </button>
              <Link to="/numero14">
                <button className="buttonConfirmar" onClick={handleClick}>Sí</button>
              </Link>
          
            </div>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
          </div>
          
        )}
        {stage === "timer" && (
          <div>
             <br />
            <br />
            <br />
            <p className="timer">{timer}</p>
           
            <br />
            <br />
            <br />
          </div>
        )}
      </div>
      <Decor/>
    </div>
  );
}

export default Pitch;
