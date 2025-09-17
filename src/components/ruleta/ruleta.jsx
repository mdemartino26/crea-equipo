import { useEffect, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp, increment, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

export default function Ruleta({
  consignaId,
  opciones = [],
  forceWin = true,
  winIndex = 0,
  onWin = () => {},
  onFinish = () => {},
  winDelayMs = 600,
}) {
  const [spinning, setSpinning] = useState(false);
  const [active, setActive] = useState(0);

  const targetRef = useRef(0);
  const timerRef = useRef(null);

  // el “azar mentiroso”
  function pickTarget() {
    if (forceWin) return winIndex % opciones.length;
    return Math.floor(Math.random() * opciones.length);
  }

  // animación simple: N vueltas completas + aterrizaje en target, con easing
  function spin() {
    if (spinning || !opciones.length) return;
    setSpinning(true);

    const target = pickTarget();
    targetRef.current = target;

    const vueltas = 3; // vueltas completas antes de aterrizar
    const totalSteps = vueltas * opciones.length + target;

    let step = 0;
    let delay = 60; // comienza rápido
    const delayUp = 12; // incrementa delay cada tantas steps para desacelerar

    const tick = async () => {
      setActive((i) => (i + 1) % opciones.length);
      step += 1;

      if (step < totalSteps) {
        // desaceleración suave
        if (step % (opciones.length / 2 || 1) === 0) {
          delay = Math.min(delay + delayUp, 200);
        }
        timerRef.current = setTimeout(tick, delay);
      } else {
        // terminó: registramos el giro y resolvemos
        await logSpin(consignaId, { target, won: target === winIndex });
        if (target === winIndex) {
          setTimeout(() => {
            onWin();
            onFinish();
            setSpinning(false);
          }, winDelayMs);
        } else {
          onFinish(); // por si querés hacer algo aunque pierda
          setSpinning(false);
        }
      }
    };

    tick();
  }

  async function logSpin(id, { target, won }) {
    try {
      // subcolección de giros (opcional)
      await addDoc(collection(db, "consignas", id, "spins"), {
        target,
        won,
        createdAt: serverTimestamp(),
      });
      // contador de giros (opcional)
      await updateDoc(doc(db, "consignas", id), {
        spins: increment(1),
        lastSpinAt: serverTimestamp(),
      });
    } catch (e) {
      // si no hay permisos para escribir, simplemente ignoramos el log
      console.warn("No se pudo loguear spin:", e.message);
    }
  }

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 6,
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 12,
        }}
      >
        {opciones.map((opt, i) => (
          <div
            key={i}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: i === active ? (opt.color || "#eee") : "#f8f8f8",
              color: i === active ? "#000" : "#555",
              fontWeight: i === active ? 700 : 500,
              transition: "background .15s",
            }}
          >
            {opt.texto || String(opt)}
          </div>
        ))}
      </div>

      <button
        onClick={spin}
        disabled={spinning || !opciones.length}
        className="buttonPpal"
        style={{ alignSelf: "start" }}
      >
        {spinning ? "Girando..." : "Girar"}
      </button>
    </div>
  );
}