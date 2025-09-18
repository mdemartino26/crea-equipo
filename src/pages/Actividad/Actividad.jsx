// src/pages/Actividad/Actividad.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  onSnapshot as onSnapshotCol,
} from "firebase/firestore";

import Header2 from "../../components/header2/header2";
import Decor from "../../components/decor/decor";
import { cldUrl } from "../../lib/cloudinary";
import Ruleta from "../../components/ruleta/ruleta";

import './styles.css'

import CorrectSound from "../../assets/sounds/correct.mp3";
import WrongSound from "../../assets/sounds/wrong.mp3";

// normaliza acentos, mayúsculas, signos, etc.
function norm(s = "") {
  return s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export default function Actividad() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [consigna, setConsigna] = useState(null);
  const [lista, setLista] = useState([]);

  const [respuesta, setRespuesta] = useState("");
  const [ok, setOk] = useState(null); // true | false | null

  const correctRef = useRef(null);
  const wrongRef = useRef(null);

  // Doc actual
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "consignas", id), (snap) => {
      setConsigna(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setRespuesta("");
      setOk(null);
      window.scrollTo(0, 0);
    });
    return () => unsub();
  }, [id]);

  // Lista completa ordenada
  useEffect(() => {
    const q = query(collection(db, "consignas"), orderBy("orden", "asc"));
    const unsub = onSnapshotCol(q, (snap) => {
      setLista(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Visibles primero, luego ocultas (navegación estable)
  const renderList = useMemo(() => {
    const vis = lista.filter((x) => x.visible);
    const hid = lista.filter((x) => !x.visible);
    return [...vis, ...hid];
  }, [lista]);

  const idx = useMemo(
    () => renderList.findIndex((x) => x.id === id),
    [renderList, id]
  );
  const nextId =
    idx >= 0 && idx < renderList.length - 1 ? renderList[idx + 1].id : null;

  const seguir = () => {
    if (nextId) navigate(`/actividad/${nextId}`);
    else navigate("/findejuego");
  };

  // Botón único "Siguiente"
  const handleNext = () => {
    const sol = norm(consigna?.respuestaCorrecta || "");
    if (!sol) {
      // sin respuesta definida -> pasa directo
      seguir();
      return;
    }
    const r = norm(respuesta);

    if (r === sol) {
      setOk(true);
      try {
        if (correctRef.current) {
          correctRef.current.currentTime = 0;
          correctRef.current.play();
        }
      } catch {}
      setTimeout(seguir, 500); // que se oiga el “correcto”
    } else {
      setOk(false);
      try {
        if (wrongRef.current) {
          wrongRef.current.currentTime = 0;
          wrongRef.current.play();
        }
      } catch {}
      // no navega: muestra error
    }
  };

  if (!consigna) {
    return (
      <div className="overf">
        <Header2 />
        <main style={{ padding: 24 }}>Cargando…</main>
      </div>
    );
  }

  const tipo = consigna.tipo || "texto";

  // NUEVO: consignas “de confirmación” (no requieren respuesta)
  const skipAnswer =
    consigna?.requiereRespuesta === false ||
    ["confirmar", "whatsapp", "paso", "info"].includes(tipo) ||
    !consigna?.respuestaCorrecta;

  // Soporta ambos medios (nuevo esquema imageURL/audioURL) con fallback al viejo mediaURL
  const imageSrc =
    consigna.imageURL ||
    (tipo === "imagen" && consigna.mediaURL ? consigna.mediaURL : null);
  const audioSrc =
    consigna.audioURL ||
    (tipo === "audio" && consigna.mediaURL ? consigna.mediaURL : null);
  const imageOptimized = imageSrc ? cldUrl(imageSrc, "f_auto,q_auto,w_1000") : null;

  return (
    <div className="overf general">
      <Header2 />
      <section className="seccionActividad">
      
        {consigna.enunciado && <h2 className="enunciado">{consigna.enunciado}</h2>}

        {/* Media: imagen y/o audio si existen */}
        {imageOptimized && (
          <img
          className="imagenConsigna"
            src={imageOptimized}
            alt={consigna.titulo || "consigna"}
            loading="lazy"
            decoding="async"
          />
        )}
        {audioSrc && <audio controls src={audioSrc} className="audioPlayer"/>}

        {/* RULETA */}
        {tipo === "ruleta" ? (
          <Ruleta
            consignaId={consigna.id}
            opciones={consigna.opciones || []}
            forceWin={Boolean(consigna.forceWin)}
            winIndex={
              Number.isFinite(consigna?.winIndex) ? consigna.winIndex : 0
            }
            winDelayMs={consigna.winDelayMs || 600}
            onWin={() => {
              try {
                correctRef.current?.play();
              } catch {}
            }}
            onFinish={seguir}
          />
        ) : (
          <>
            {/* Si NO requiere respuesta: solo botón de continuar */}
            {skipAnswer ? (
              <div>
                <button className="buttonPpal" onClick={seguir}>
                  {nextId ? "Continuar" : "Terminar"}
                </button>
              </div>
            ) : (
              // Si requiere respuesta: input + botón único
              <div
                className="inputDiv"
              >
                <input
                className="inputRta"
                  value={respuesta}
                  onChange={(e) => {
                    setRespuesta(e.target.value);
                    setOk(null);
                  }}
                  placeholder="Tu respuesta"
                  
                />
                <button className="btnSiguiente" onClick={handleNext}>
                  {nextId ? "Siguiente" : "Terminar"}
                </button>
              </div>
            )}

            {/* Feedback (solo cuando hay respuesta) */}
            {!skipAnswer && ok === true && (
              <div style={{ color: "green", fontWeight: 700 }}>¡Correcto!</div>
            )}
            {!skipAnswer && ok === false && (
              <div style={{ color: "crimson", fontWeight: 700 }}>
                No es correcto. Probá de nuevo.
              </div>
            )}
          </>
        )}
      </section>

  

      {/* Sonidos */}
      <audio ref={correctRef} src={CorrectSound} />
      <audio ref={wrongRef} src={WrongSound} />
    </div>
  );
}
