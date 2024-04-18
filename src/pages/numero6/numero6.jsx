import React, { useState } from 'react';
import Slider from 'react-slick';
import obra1 from '../../assets/img/la-cancion-del-pueblo.jpg';
import obra2 from '../../assets/img/circo.jpg';
import obra3 from '../../assets/img/quiosco.jpg';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Header2 from '../../components/header2/header2';
import './numero6.css';

function Numero6() {
    const [respuesta, setRespuesta] = useState('');
    const [error, setError] = useState(false);
    const palabrasClave = ['quiosco', 'cancion', 'pueblo', 'circo', 'canaletas', 'mundo'];

    const handleChange = (event) => {
        const texto = event.target.value;
        setRespuesta(texto);
        setError(false); // Reset error state when input changes
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (palabrasClave.every((palabra) => respuesta.toLowerCase().includes(palabra))) {
            // Correct answer, allow to advance
            console.log('Respuesta correcta');
            localStorage.setItem('respuestaNumero6', respuesta);
            window.location.href = '/numero7';
        } else {
            // Incorrect answer, show error
            setError(true);
        }
    };

    const contadorPalabras = respuesta.trim().split(/\s+/).length;

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };

    return (
        <div>
            <Header2/>
            <div className="main">
                <p>
                    Escribir en hasta 280 caracteres un párrafo coherente a partir de los sustantivos de estas 2/3 obras.
                </p>
                <div id='fotosParrafo'>
                    <Slider {...settings}>
                        <div>
                            <img src={obra1} alt="la-cancion-del-pueblo"/>
                        </div>
                        <div>
                            <img src={obra2} alt="circo-mas-lindo-del-mundo"/>
                        </div>
                        <div>
                            <img src={obra3} alt="quiosco de canaletas"/>
                        </div>
                    </Slider>
                </div>
                <div>
                    <strong>Palabras clave:</strong>
                    <ul id='claves'>
                        {palabrasClave.map((palabra, index) => (
                            <li key={index} style={{ textDecoration: respuesta.toLowerCase().includes(palabra) ? 'line-through' : 'none' }}>
                                {palabra}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>Contador de palabras: {contadorPalabras}/280</div>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={respuesta}
                        onChange={handleChange}
                        placeholder="Escribí tu respuesta acá"
                        rows={10}
                        cols={50}
                    />
                    <button type="submit" className="buttonPpal">Enviar</button>
                </form>
                {error && (
                    <p style={{ color: 'red' }}>
                        La respuesta debe incluir todas las palabras clave. Intentá de nuevo.
                    </p>
                )}
                
              {/*  <div>
                    <strong>Respuesta:</strong> {respuesta.split(' ').map((palabra, index) => {
                        const palabraFormateada = palabra.toLowerCase().replace(/[^a-zA-Z]/g, '');
                        if (palabrasClave.includes(palabraFormateada)) {
                            return <strong key={index}>{palabra} </strong>;
                        }
                        return palabra + ' ';
                    })}
                </div>*/} 
            </div>
        </div>
    );
}

export default Numero6;
