import React, { useState } from "react";
import { Link } from "react-router-dom";
import circo from "../../assets/img/circo-lindo.jpg";
import cancion from "../../assets/img/cancion-pueblo.jpg";
import Header2 from "../../components/header2/header2";
import "./numero5.css";
import Decor from "../../components/decor/decor";

function Numero5() {
  const [mostrarDivUno, setMostrarDivUno] = useState(true);

  const handleFlechitaClick = () => {
    setMostrarDivUno(false); // Oculta "uno" y muestra "dos"
  };

  const handleClick = () => {
    localStorage.setItem('currentPage', '/numero6');
    console.log('Ruta guardada en localStorage: /numero6');
}

  return (
    <div className="overf">
      <Header2 />
      <div className="main">
        {mostrarDivUno ? (
          <div id="uno">
            <p>Encuentren las obras a las que pertenecen estas imágenes.</p>

<div id="imag">
            <img src={circo} alt="Circo mas lindo del mundo" />
            <img src={cancion} alt="Cancion del pueblo" />
            </div>
            <p>¿Ya las encontraron? Continuemos</p>

            <button className="flechita" onClick={handleFlechitaClick}>
              ➔
            </button>
          </div>
        ) : (
          <div id="dos">
            <p>
              Entre todos los equipos, deben crear una historia coherente a partir
              de los sustantivos de los títulos de las obras.
              <br/> 
              <br/> Cada equipo colabora
              con un párrafo, que envía al grupo de WhatsApp.
            </p>
            <Link to="/numero6">
              <button className="buttonPpal" onClick={handleClick}>Continuar</button>
            </Link>
          </div>
        )}
      </div>
      <Decor />
    </div>
  );
}

export default Numero5;
