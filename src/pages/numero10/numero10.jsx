import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header2 from '../../components/header2/header2';
import './numero10.css';
import FotoCuadro from '../../assets/img/foto.jpg'

function Numero10() {
    const [respuesta, setRespuesta] = useState('');
    const [error, setError] = useState(false);
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

    return (
        <div>
            <Header2/>
            <div className="main">
                {!showPopup && (
                    <div>
                        <p>Cómo le vendemos al cliente una obra que pudo haber hecho nuestro sobrino?</p>
                        <p>Condición: NO USAR CONCEPTOS ARTÍSTICOS</p>
                        <img src={FotoCuadro} alt="Foto a cambiar" />
                        <br />
                        <button onClick={() => setShowPopup(true)} className='buttonPpal'>Responder</button>
                    </div>
                )}
                {showPopup && (
                    <div className="popup">
                        <p>¿Ya armaron el pitch de venta? Lo necesitarán luego!</p>
                        <div id='botones'>
                            <Link to="/numero11"><button className='buttonConfirmar'>Si</button></Link>
                            <button onClick={() => handlePopupSubmit('no')} className='buttonNoConfirmar'>No</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Numero10;
