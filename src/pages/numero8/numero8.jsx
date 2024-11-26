import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';
import Decor from "../../components/decor/decor";

function Numero8() {
    const [showPopup, setShowPopup] = useState(false);

    const handlePopupSubmit = (respuestaPopup) => {
        if (respuestaPopup === 'si') {
            // Continuar a la página Numero11
            console.log('Continuar a Numero11');
        } else {
            // Recargar la página para permanecer en la página Numero10
            window.location.reload();
        }
    };

    const handleClick = () => {
        localStorage.setItem('currentPage', '/numero9');
        console.log('Ruta guardada en localStorage: /numero9');
    }

    return (
        <div>
            <Header2/>
            <div className="main">
                {!showPopup && (
                    <div>
                        <p>Misión: lograr que una Kardashian compre tres botellas de Coca Cola para decorar su living</p>
                        <p>Armar pitch de venta</p>
                       
                        <br />
                        <button onClick={() => setShowPopup(true)} className='buttonPpal'>Responder</button>
                    </div>
                )}
                {showPopup && (
                    <div className="popup">
                        <p>¿Ya armaron el pitch de venta? <br /> <br />   ¡Lo necesitarán luego!</p>
                        <div id='botones'>
                            <Link to="/numero9"><button className='buttonConfirmar' onClick={handleClick}>Si</button></Link>
                            <button onClick={() => handlePopupSubmit('no')} className='buttonNoConfirmar'>No</button>
                        </div>
                    </div>
                )}
            </div>
            <Decor/>
        </div>
    );
}

export default Numero8;
