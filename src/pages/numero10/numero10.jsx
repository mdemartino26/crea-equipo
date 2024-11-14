import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header2 from "../../components/header2/header2";
import "./numero10.css";
import FotoCuadro from "../../assets/img/foto.jpg";

function Numero10() {
  const [respuesta, setRespuesta] = useState("");
  const [error, setError] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handlePopupSubmit = (respuestaPopup) => {
    if (respuestaPopup === "si") {
      // Continuar a la página Numero11
      console.log("Continuar a Numero11");
    } else {
      // Recargar la página para permanecer en la página Numero10
      window.location.reload();
    }
  };

  return (
    <div>
      <Header2 />
      <div className="main">
      
          <div>
            <p>
            A mover el esqueleto. Elijan una obra de la sala de arte cinético
              y fílmense haciendo una coreo entre TODOS inspirada en ella. (Máx
              20 segs)
            </p>
            <p>
               Luego, envíen el video al grupo de whatsapp
            </p>

            <Link to="/numero11">
            <button className="buttonPpal">¡Ya falta poco!</button>
          </Link>
          </div>
        
        
      </div>
    </div>
  );
}

export default Numero10;
