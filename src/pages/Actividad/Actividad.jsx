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
import RuletaMuseo from "../../components/ruleta/ruleta_museo";
import RuletaMuseoSub from "../../components/ruleta/ruleta_museo_sub";
import Progreso from "../../components/Progreso/Progreso";

import "./styles.css";

import CorrectSound from "../../assets/sounds/correct.mp3";
import WrongSound from "../../assets/sounds/wrong.mp3";

 const MUSEO_COLORS = {
  outer:   ["#F04A1D","#FFD23F","#9EE06E","#26B36A","#1E88E5","#2CB1C9","#E83E8C","#D72638"],
  diamond: ["#F06292","#90A4AE","#D84315","#F9D34E"],
  inner:   ["#C62828","#2E7D32","#1976D2","#FBC02D","#8E24AA","#00ACC1","#EF6C00","#43A047"],
};


// --- util normalizador ---
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
const normPos = (s = "") =>
  String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

// --- función pura (NO hook) para armar opciones de la ruleta museo ---
function buildOpcionesMuseo(consigna) {
  const baseTexts = ["sí", "intentá de nuevo", "que suerte!"];
  const raw =
    Array.isArray(consigna?.opciones) && consigna.opciones.length
      ? consigna.opciones
      : baseTexts;

  const arr = raw.slice(0, 3).map((x) =>
    typeof x === "string"
      ? { texto: x }
      : { texto: x?.texto ?? String(x), color: x?.color, positive: x?.positive }
  );
  while (arr.length < 3) arr.push(arr[arr.length % Math.max(1, raw.length)]);

  const POS = (Array.isArray(consigna?.positiveTexts) &&
  consigna.positiveTexts.length
    ? consigna.positiveTexts
    : ["sí", "si", "que suerte!", "avanzá", "positivo"]
  ).map(normPos);

  const mapped = arr.map((o) => ({
    texto: o.texto,
    color: o.color,
    positive:
      typeof o.positive === "boolean" ? o.positive : POS.includes(normPos(o.texto)),
  }));

  if (!mapped.some((m) => m.positive)) mapped[0].positive = true;
  return mapped;
}

export default function Actividad() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [consigna, setConsigna] = useState(null);
  const [lista, setLista] = useState([]);

  const [respuesta, setRespuesta] = useState("");
  const [ok, setOk] = useState(null);

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

  const handleNext = () => {
    const sol = norm(consigna?.respuestaCorrecta || "");
    if (!sol) return seguir();
    const r = norm(respuesta);

    if (r === sol) {
      setOk(true);
      try {
        if (correctRef.current) {
          correctRef.current.currentTime = 0;
          correctRef.current.play();
        }
      } catch {}
      setTimeout(seguir, 500);
    } else {
      setOk(false);
      try {
        if (wrongRef.current) {
          wrongRef.current.currentTime = 0;
          wrongRef.current.play();
        }
      } catch {}
    }
  };

  // 👉 NO llamamos hooks debajo de este early return
  if (!consigna) {
    return (
      <div className="overf">
        <Header2 />
        <main className="loading">Cargando…</main>
      </div>
    );
  }

  const tipo = consigna?.tipo || "texto";

  const skipAnswer =
    consigna?.requiereRespuesta === false ||
    ["confirmar", "whatsapp", "paso", "info"].includes(tipo) ||
    !consigna?.respuestaCorrecta;

  const imageSrc =
    consigna.imageURL ||
    (tipo === "imagen" && consigna.mediaURL ? consigna.mediaURL : null);
  const audioSrc =
    consigna.audioURL ||
    (tipo === "audio" && consigna.mediaURL ? consigna.mediaURL : null);
  const imageOptimized = imageSrc
    ? cldUrl(imageSrc, "f_auto,q_auto,w_1000")
    : null;

  // ✅ ahora es una FUNCIÓN (no hook), así que no viola reglas
  const opcionesMuseo = buildOpcionesMuseo(consigna);

  return (
    <div className="overf general">
      <Header2 />
      <div className="progreso">
        <Progreso
          current={Math.max(0, idx)}
          total={Math.max(renderList.length, 1)}
        />
      </div>

      <section className="seccionActividad">
        {consigna.enunciado && (
          <h2 className="enunciado">{consigna.enunciado}</h2>
        )}

        {imageOptimized && (
          <img
            className="imagenConsigna"
            src={imageOptimized}
            alt={consigna.titulo || "consigna"}
            loading="lazy"
            decoding="async"
          />
        )}
        {audioSrc && <audio controls src={audioSrc} className="audioPlayer" />}

     {tipo === "ruleta" ? (

<RuletaMuseoSub
  consignaId={consigna.id}
  opciones={opcionesMuseo}
  size={340}
  outerSegments={8}
  innerSegments={8}
  ratios={{ inner: 0.26, diamond: 0.64 }}
  colorsByRegion={MUSEO_COLORS}
  labelVisibility={{ outer: true, diamond: false, inner: false }}
  spinDurationMs={6000}
  spinTurns={7}
  // preferOptionColors={false} // (default) usa paleta del cuadro
  onWin={() => { try { correctRef.current?.play(); } catch {} }}
  onFinish={seguir}
/>

) : (
  <>
    {skipAnswer ? (
      <div>
        <button className="buttonPpal" onClick={seguir}>
          {nextId ? "Continuar" : "Terminar"}
        </button>
      </div>
    ) : (
      <div className="inputDiv">
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

      <audio ref={correctRef} src={CorrectSound} />
      <audio ref={wrongRef} src={WrongSound} />
    </div>
  );
}
