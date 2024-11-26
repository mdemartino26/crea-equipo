import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';
import Decor from '../../components/decor/decor';
import './reglas.css'

function Reglas() {

    const handleClick = () => {
        localStorage.setItem('currentPage', '/numero1');
        console.log('Ruta guardada en localStorage: /numero1');
    }
    
    return (

        <div className='overf'>
            <Header2 />
            <h1>Reglas</h1>
            <ul>
                <li>Lean bien las consignas</li>
                <li>Si se traban, pueden consutlar</li>
                <li>Tienen que observar bien</li>
                <li>¡Diviertanse!</li>
            </ul>
            <Link to="/numero1" onClick={handleClick}><button className="buttonPpal">Siguiente</button></Link>
            <Decor/>
        </div>
    );
}

export default Reglas;