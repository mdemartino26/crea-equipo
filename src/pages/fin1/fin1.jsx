import React from 'react';
import Header2 from '../../components/header2/header2';
import Decor2 from '../../components/decor2/decor2';
import './fin1.css';
import Sobre from '../../assets/img/congratulations-envelope.gif';

function Fin1() {
    
    return (
        <>
        <div className='findj'>
            <Header2/>
            <div className="main">
            <h2>¡Felicitaciones! han ganado el juego </h2>
            <p> ¡Pueden ir a buscar tu sobre! </p>
            <br />
            <br />
            <img src={Sobre} alt="Felicitaciones" />
            <p>Gracias por participar</p>
            </div>
            </div>
            <Decor2/>
       
        </>
    );
}

export default Fin1;
