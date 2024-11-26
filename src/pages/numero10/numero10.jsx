import React from "react";
import { Link } from "react-router-dom";
import Header2 from "../../components/header2/header2";
import "./numero10.css";

function Numero10() {


  const handleClick = () => {
    localStorage.setItem('currentPage', '/numero11');
    console.log('Ruta guardada en localStorage: /numero11');
}


  return (
    <div>
      <Header2 />
      <div className="main">
      
          <div>
            <p>
          <strong>  A mover el esqueleto. </strong>Elijan una obra de la sala de arte cinético
              y fílmense haciendo una coreo entre TODOS inspirada en ella. (Máx
              20 segs)
            </p>
            <p>
               Luego, envíen el video al grupo de whatsapp
            </p>

            <Link to="/numero11">
            <button className="buttonPpal" onClick={handleClick}>¡Ya falta poco!</button>
          </Link>
          </div>
        
        
      </div>
    </div>
  );
}

export default Numero10;
