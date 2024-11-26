import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';
import Decor from '../../components/decor/decor';
import './reglas.css'

function Reglas() {

    useEffect(() => {
        // Guardar la ruta actual en el localStorage
        localStorage.setItem('currentPage', '/reglas');
        console.log(localStorage.getItem('currentPage')); 
      }, []);
    
    
    return (

        <div className='overf'>
            <Header2 />
            <h1>Reglas</h1>
            <ul>
                <li>Leer bien las consignas</li>
                <li>Si se traban, pueden consutlar</li>
                <li>Tienen que observar bien</li>
                <li>¡Diviertanse!</li>
            </ul>
            <Link to="/numero1"><button className="buttonPpal">Siguiente</button></Link>
            <Decor/>
        </div>
    );
}

export default Reglas;