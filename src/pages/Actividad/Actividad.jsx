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
  outer: ["#F04A1D","#FFD23F","#9EE06E","#26B36A","#1E88E5","#2CB1C9","#E83E8C","#D72638"],
  diamond: ["#F06292","#90A4AE","#D84315","#F9D34E"],
  inner: ["#C62828","#2E7D32","#1976D2","#8E24AA","#00ACC1","#EF6C00","#43A047"],
};

// ---------- Popup genérico con tonos ----------
function Popup({ open, title, children, actions, onClose, tone = "neutral" }) {
  if (!open) return null;

  const PALETTE = {
    success: { accent: "#2E7D32", soft: "#E8F5E9" },
    error:   { accent: "#C62828", soft: "#FFEBEE" },
    neutral: { accent: "#111111", soft: "#FFFFFF" },
  };
  const { accent, soft } = PALETTE[tone] || PALETTE.neutral;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="popup-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        className="popup-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 96vw)",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,.25)",
          overflow: "hidden",
          border: `1px solid ${accent}22`,
          outline: `4px solid ${accent}14`,
        }}
      >
        <div style={{ height: 6, background: accent }} />

        {title ? (
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid #eee",
              fontWeight: 700,
              fontSize: 18,
              background: soft,
              color: "#111",
            }}
          >
            {title}
          </div>
        ) : null}

        <div style={{ padding: 18, fontSize: 16 }}>{children}</div>

        {Array.isArray(actions) && actions.length > 0 ? (
          <div
            style={{
              padding: 14,
              borderTop: "1px solid #eee",
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              background: "#fafafa",
            }}
          >
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: a.primary ? `1px solid ${accent}` : "1px solid #ddd",
                  background: a.primary ? accent : "#f7f7f7",
                  color: a.primary ? "#fff" : "#111",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

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

// --- función pura para armar opciones de la ruleta museo ---
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

  const [consigna, setConsigna] = useState(null);
  const [lista, setLista] = useState([]);

  const [respuesta, setRespuesta] = useState("");
  const [ok, setOk] = useState(null);

  const correctRef = useRef(null);
  const wrongRef = useRef(null);

  // --------- Estado y helpers de Popup ----------
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMsg, setPopupMsg] = useState("");
  const [popupActions, setPopupActions] = useState([]);
  const [popupTone, setPopupTone] = useState("neutral");
  const popupTimerRef = useRef(null);
  const followTimerRef = useRef(null);

  const closePopup = () => {
    setPopupOpen(false);
    setPopupActions([]);
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }
  };

  function showToast({ title = "", msg = "", autoCloseMs = 3000, tone = "neutral" }) {
    setPopupTone(tone);
    setPopupTitle(title);
    setPopupMsg(msg);
    setPopupActions([]);
    setPopupOpen(true);
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    popupTimerRef.current = setTimeout(() => closePopup(), autoCloseMs);
  }

  function showConfirm({ msg, onYes, yesLabel = "Sí", noLabel = "No" }) {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }
    setPopupTone("neutral");
    setPopupTitle("Confirmación");
    setPopupMsg(msg);
    setPopupActions([
      { label: noLabel, onClick: () => closePopup() },
      {
        label: yesLabel,
        primary: true,
        onClick: () => {
          closePopup();
          onYes?.();
        },
      },
    ]);
    setPopupOpen(true);
  }

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
      if (followTimerRef.current) clearTimeout(followTimerRef.current);
    };
  }, []);

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

  // Lista completa ordenada (todas, visibles y ocultas)
  useEffect(() => {
    const q = query(collection(db, "consignas"), orderBy("orden", "asc"));
    const unsub = onSnapshotCol(q, (snap) => {
      setLista(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // ======== separar visibles/ocultas ========
  const visibles = useMemo(() => lista.filter((x) => x.visible), [lista]);
  const ocultas  = useMemo(() => lista.filter((x) => !x.visible), [lista]);

  // Navegación estable: visibles primero y luego ocultas
  const renderList = useMemo(() => [...visibles, ...ocultas], [visibles, ocultas]);

  // Índices
  const idx = useMemo(() => renderList.findIndex((x) => x.id === id), [renderList, id]);
  const idxVis = useMemo(() => visibles.findIndex((x) => x.id === id), [visibles, id]);

  // Próxima visible (nunca una oculta)
  const nextVisibleId = useMemo(() => {
    if (!id) return visibles[0]?.id ?? null;
    if (idxVis >= 0) {
      return idxVis < visibles.length - 1 ? visibles[idxVis + 1].id : null;
    }
    const posAll = renderList.findIndex((x) => x.id === id);
    if (posAll >= 0) {
      for (let i = posAll + 1; i < renderList.length; i++) {
        if (renderList[i].visible) return renderList[i].id;
      }
    }
    return null;
  }, [id, visibles, idxVis, renderList]);

  // Progreso: solo visibles
  const progCurrent = idxVis >= 0 ? idxVis : Math.max(visibles.length - 1, 0);
  const progTotal = Math.max(visibles.length, 1);

  // Si caemos en una consigna oculta, redirigimos a la próxima visible o terminamos
  const navigate = useNavigate();
  useEffect(() => {
    if (consigna && consigna.visible === false) {
      if (nextVisibleId) navigate(`/actividad/${nextVisibleId}`, { replace: true });
      else navigate("/findejuego", { replace: true });
    }
  }, [consigna?.id, consigna?.visible, nextVisibleId, navigate]);
  // ==========================================

  const seguir = () => {
    if (nextVisibleId) navigate(`/actividad/${nextVisibleId}`);
    else navigate("/findejuego");
  };

  const needsConfirm =
    (consigna?.tipo || "") === "confirmar" || consigna?.requiereConfirmacion === true;

  const handleNext = () => {
    if (needsConfirm) {
      showConfirm({ msg: "¿Estás seguro de que deseas continuar?", onYes: seguir });
      return;
    }

    const sol = norm(consigna?.respuestaCorrecta || "");
    const skipAnswer =
      consigna?.requiereRespuesta === false ||
      ["confirmar", "whatsapp", "paso", "info"].includes(consigna?.tipo || "") ||
      !consigna?.respuestaCorrecta;

    if (skipAnswer) {
      seguir();
      return;
    }

    const r = norm(respuesta);
    if (r === sol) {
      setOk(true);
      try { if (correctRef.current) { correctRef.current.currentTime = 0; correctRef.current.play(); } } catch {}
      showToast({ title: "¡Correcto!", msg: "Continúen así.", tone: "success" });
      if (followTimerRef.current) clearTimeout(followTimerRef.current);
      followTimerRef.current = setTimeout(() => seguir(), 3000);
    } else {
      setOk(false);
      try { if (wrongRef.current) { wrongRef.current.currentTime = 0; wrongRef.current.play(); } } catch {}
      showToast({ title: "Incorrecto", msg: "No es correcto. Prueben nuevamente.", tone: "error" });
    }
  };

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
  const imageOptimized = imageSrc ? cldUrl(imageSrc, "f_auto,q_auto,w_1000") : null;

  const opcionesMuseo = buildOpcionesMuseo(consigna);

  return (
    <div className="overf general">
      <Header2 />

      <div className="progreso">
        <Progreso current={progCurrent} total={progTotal} />
      </div>

      <section className="seccionActividad">
        {consigna.enunciado && <h2 className="enunciado">{consigna.enunciado}</h2>}

        {imageOptimized && (
          <img
            className="imagenConsigna"
            src={imageOptimized}
            alt={consigna.titulo || "consigna"}
            loading="lazy"
            decoding="async"
            height="250px"
          />
        )}
        {audioSrc && <audio controls src={audioSrc} className="audioPlayer" />}

        {tipo === "ruleta" ? (
          <RuletaMuseoSub
            consignaId={consigna.id}
            opciones={opcionesMuseo}
            size={300}
            outerSegments={8}
            innerSegments={8}
            ratios={{ inner: 0.26, diamond: 0.64 }}
            colorsByRegion={MUSEO_COLORS}
            labelVisibility={{ outer: true, diamond: false, inner: false }}
            spinDurationMs={6000}
            spinTurns={7}
            onWin={() => { try { correctRef.current?.play(); } catch {} }}
            onFinish={seguir}
          />
        ) : (
          <>
            {skipAnswer ? (
              <div>
                <button
                  className="btnSiguiente"
                  onClick={() => {
                    if (needsConfirm) {
                      showConfirm({ msg: "¿Estás seguro de que deseas continuar?", onYes: seguir });
                    } else {
                      seguir();
                    }
                  }}
                >
                  {nextVisibleId ? "Continuar" : "Terminar"}
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
                  {nextVisibleId ? "Siguiente" : "Terminar"}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Popup
        open={popupOpen}
        title={popupTitle}
        onClose={closePopup}
        actions={popupActions}
        tone={popupTone}
      >
        {popupMsg}
      </Popup>

      <audio ref={correctRef} src={CorrectSound} />
      <audio ref={wrongRef} src={WrongSound} />
    </div>
  );
}