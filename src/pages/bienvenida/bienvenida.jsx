import React from 'react';
import Header from '../../components/header/header';
import { Link } from 'react-router-dom';
import './bienvenida.css';

function Bienvenida() {
    

    return (
        <div className='bienvenida-background'>
             <Header />
            <h2>Team building + museo + gamificación</h2>
            <Link to="/reglas"><button class="buttonPpal" >Comenzar</button></Link>
            <div className='bienvenida-background2'></div>
        </div>
    );
}

export default Bienvenida;