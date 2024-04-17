import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Pitch() {
    const [stage, setStage] = useState('presentacion');
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        let timerInterval;
        if (stage === 'timer') {
            timerInterval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer > 0) {
                        return prevTimer - 1;
                    } else {
                        clearInterval(timerInterval);
                        window.location.href = '/numero14';
                        return 0;
                    }
                });
            }, 1000);
        }

        return () => clearInterval(timerInterval);
    }, [stage]);

    const handleExposicion = () => {
        setStage('ganaron');
    };

    const handleGanaron = () => {
        window.location.href = '/numero14';
    };

    return (
        <div>
            {stage === 'presentacion' && (
                <div>
                    <h2>Momento de estrenar el pitch de venta.</h2>
                    <p>
                        Todos los grupos expondrán y por consenso (votado por mayoría) elegirán al ganador. Este tendrá ventaja para emprender el último desafío.
                    </p>
                    <p>¿Ya expusieron?</p>
                    <button onClick={() => setStage('ganaron')}>Sí</button>
                    <button>No</button>
                </div>
            )}
            {stage === 'ganaron' && (
                <div>
                    <p>¿Ganaron?</p>
                    <button onClick={() => setStage('timer')}>No</button>
                    <Link to="/numero14">
                        <button>Sí</button>
                    </Link>
                </div>
            )}
            {stage === 'timer' && (
                <div>
                    <p>{timer}</p>
                </div>
            )}
        </div>
    );
}

export default Pitch;
