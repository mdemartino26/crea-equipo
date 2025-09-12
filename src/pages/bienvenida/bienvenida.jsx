import React, { useEffect } from 'react';
import Header from '../../components/header/header';
import { Link } from 'react-router-dom';
import './bienvenida.css';

function Bienvenida() {

    const handleClick = () => {
        localStorage.setItem('currentPage', '/reglas');
        console.log('Ruta guardada en localStorage: /reglas');
    }
    
    return (
        <div className='bienvenida-background overf bienvenidaCenter' >
             <Header />
            <h2>Team building + museo + gamificación</h2>
            <Link to="/reglas"  onClick={handleClick}><button className="buttonPpal" >Comenzar</button></Link>
        
        </div>
    );
}

export default Bienvenida;