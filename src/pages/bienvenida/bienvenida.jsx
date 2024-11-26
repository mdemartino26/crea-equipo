import React, { useEffect } from 'react';
import Header from '../../components/header/header';
import { Link } from 'react-router-dom';
import './bienvenida.css';

function Bienvenida() {

    useEffect(() => {
        // Guardar la ruta actual en el localStorage
        localStorage.setItem('currentPage', '/');
      }, []);
    
    
    return (
        <div className='bienvenida-background overf' >
             <Header />
            <h2>Team building + museo + gamificación</h2>
            <Link to="/reglas"><button className="buttonPpal" >Comenzar</button></Link>
            <div className='bienvenida-background2'></div>
        </div>
    );
}

export default Bienvenida;