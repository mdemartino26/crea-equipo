import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header2 from "../../components/header2/header2";
import "./pitch.css";

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

  const handleExposicion = () => {
    setStage("ganaron");
  };

  const handleGanaron = () => {
    window.location.href = "/numero14";
  };

  return (
    <div>
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
            <p>¿Ya expusieron?</p>
            <div id="botones">
              <button
                onClick={() => setStage("ganaron")}
                className="buttonConfirmar"
              >
                Sí
              </button>
              <button className="buttonNoConfirmar">No</button>
            </div>
          </div>
        )}
        {stage === "ganaron" && (
          <div>
            <p>¿Ganaron?</p>
            <div id="botones">
              <button
                onClick={() => setStage("timer")}
                className="buttonNoConfirmar"
              >
                No
              </button>
              <Link to="/numero14">
                <button className="buttonConfirmar">Sí</button>
              </Link>
            </div>
          </div>
        )}
        {stage === "timer" && (
          <div>
            <p className="timer">{timer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pitch;
