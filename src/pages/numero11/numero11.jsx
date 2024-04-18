import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import royi from '../../assets/img/royi.jpg'
import Header2 from '../../components/header2/header2';

function Numero11() {
    const [words, setWords] = useState('');
    const wordCount = words.trim().split(/\s+/).length;

    const handleInputChange = (event) => {
        setWords(event.target.value);
    };

    return (
        <div>
            <Header2/>
            <div className="main">
            <h2>Vamos concretando...</h2>
            <p>Asocie tres palabras a la obra de arte:</p>
            <img src={royi} alt="Royi N2" />
            <textarea
                value={words}
                onChange={handleInputChange}
                placeholder="Escribe tus palabras aquí"
                style={{ width: '100%', height: '100px' }}
            ></textarea>
            <br />
            <Link to={wordCount >= 3 ? "/Numero12" : "#"} style={{ pointerEvents: wordCount >= 3 ? 'auto' : 'none' }}>
                <button disabled={wordCount < 3} className='buttonPpal'>Continuar</button>
            </Link>
            </div>
        </div>
    );
}

export default Numero11;
