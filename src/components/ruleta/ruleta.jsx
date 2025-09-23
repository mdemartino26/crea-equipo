// src/components/ruleta/ruleta.jsx
import { useMemo, useRef, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  increment,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";

/**
 * Ruleta tipo "Simón": resalta segmentos y siempre cae en una respuesta positiva.
 *
 * Props:
 * - consignaId: string (para loguear)
 * - opciones: Array<string | { texto: string, color?: string, positive?: boolean }>
 * - onWin: () => void
 * - onFinish: () => void
 * - size: diámetro en px (default 320)
 * - flashesMin/Max: cantidad de "parpadeos" antes de finalizar (6..10)
 * - positiveTexts: string[] para detectar positivos por texto si no viene `positive`
 */
export default function Ruleta({
  consignaId,
  opciones = [],
  onWin = () => {},
  onFinish = () => {},
  size = 320,
  flashesMin = 6,
  flashesMax = 10,
  positiveTexts = ["sí", "si", "que suerte!", "avanzá", "positivo"],
}) {
  const n = opciones.length;
  const segDeg = n ? 360 / n : 0;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;

  // paleta por defecto (si no viene color en opciones)
  const palette = useMemo(() => {
    if (!n) return [];
    const base = [
      "#f94144","#f3722c","#f9c74f","#90be6d",
      "#43aa8b","#577590","#277da1","#9b5de5",
      "#ff70a6","#ffd166",
    ];
    return Array.from({ length: n }, (_, i) => {
      const opt = opciones[i];
      return typeof opt === "string" ? base[i % base.length] : opt?.color || base[i % base.length];
    });
  }, [n, opciones]);

  const norm = (s = "") =>
    String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  function isPositiveIdx(i) {
    const opt = opciones[i];
    if (typeof opt === "string") return positiveTexts.map(norm).includes(norm(opt));
    if (typeof opt?.positive === "boolean") return opt.positive;
    return positiveTexts.map(norm).includes(norm(opt?.texto));
  }

  function pickPositiveIndex() {
    const pos = [];
    for (let i = 0; i < n; i++) if (isPositiveIdx(i)) pos.push(i);
    return pos.length ? pos[Math.floor(Math.random() * pos.length)] : Math.floor(Math.random() * n);
  }

  // geometría de porciones y textos
  const slices = useMemo(() => {
    if (!n) return [];
    return Array.from({ length: n }, (_, i) => {
      const start = (i * segDeg - 90) * (Math.PI / 180);
      const end = ((i + 1) * segDeg - 90) * (Math.PI / 180);
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const largeArc = segDeg > 180 ? 1 : 0;

      // Porción “pizza” (si querés triángulos puros, cambiá por: `M cx cy L x1 y1 L x2 y2 Z`)
      const d = [
        `M ${cx} ${cy}`,
        `L ${x1} ${y1}`,
        `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      const labelAngle = i * segDeg + segDeg / 2 - 90;
      const tx = cx + r * 0.6 * Math.cos((labelAngle * Math.PI) / 180);
      const ty = cy + r * 0.6 * Math.sin((labelAngle * Math.PI) / 180);
      const label =
        typeof opciones[i] === "string" ? opciones[i] : opciones[i]?.texto ?? String(opciones[i]);

      return { i, d, tx, ty, label, labelAngle };
    });
  }, [n, segDeg, cx, cy, r, opciones]);

  // animación tipo "Simón"
  const [activeIdx, setActiveIdx] = useState(null);
  const [finalIdx, setFinalIdx] = useState(null);
  const [running, setRunning] = useState(false);
  const timersRef = useRef([]);

  function clearTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }

  async function logSpin(id, { target, won }) {
    if (!id) return;
    try {
      await addDoc(collection(db, "consignas", id, "spins"), {
        target,
        won,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "consignas", id), {
        spins: increment(1),
        lastSpinAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("No se pudo loguear spin:", e?.message);
    }
  }

  function play() {
    if (running || !n) return;
    setRunning(true);
    setFinalIdx(null);
    setActiveIdx(null);
    clearTimers();

    const flashes =
      Math.floor(Math.random() * (flashesMax - flashesMin + 1)) + flashesMin;
    const base = 120; // ms
    const target = pickPositiveIndex();

    // parpadeos intermedios
    for (let k = 0; k < flashes; k++) {
      const t = setTimeout(() => {
        const next = Math.floor(Math.random() * n);
        setActiveIdx(next);
      }, k * base);
      timersRef.current.push(t);
    }

    // aterrizaje en positivo con pulso
    const tFinal = setTimeout(() => {
      setActiveIdx(target);
      setFinalIdx(target);

      const t1 = setTimeout(() => setActiveIdx(null), 160);
      const t2 = setTimeout(() => setActiveIdx(target), 320);
      timersRef.current.push(t1, t2);

      const tDone = setTimeout(async () => {
        setRunning(false);
        await logSpin(consignaId, { target, won: isPositiveIdx(target) });
        try { if (isPositiveIdx(target)) onWin(); } catch {}
        try { onFinish(); } catch {}
      }, 520);
      timersRef.current.push(tDone);
    }, flashes * base + 80);

    timersRef.current.push(tFinal);
  }

  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        {/* puntero superior */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: -2,
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "16px solid #111",
            zIndex: 2,
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,.35))",
          }}
        />
        {/* rueda estática (sin rotación) */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{
            display: "block",
            borderRadius: "50%",
            boxShadow: "0 6px 24px rgba(0,0,0,.1)",
          }}
        >
          <circle cx={cx} cy={cy} r={r + 4} fill="#fff" stroke="#e9e9e9" />
          {slices.map((s, idx) => {
            const active = idx === activeIdx;
            const isFinal = idx === finalIdx;
            const fill = palette[idx % palette.length];
            return (
              <g key={idx}>
                <path
                  d={s.d}
                  fill={fill}
                  opacity={active ? 1 : 0.87}
                  stroke={active || isFinal ? "#111" : "rgba(0,0,0,0.1)"}
                  strokeWidth={active || isFinal ? 2.5 : 1}
                  style={{
                    transition: "opacity 120ms, stroke-width 120ms",
                    filter: isFinal ? "drop-shadow(0 0 10px rgba(0,0,0,0.25))" : "none",
                  }}
                />
                <text
                  x={s.tx}
                  y={s.ty}
                  fontSize={Math.max(12, size * 0.035)}
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${s.labelAngle + 90}, ${s.tx}, ${s.ty})`}
                  fill={active || isFinal ? "#111" : "rgba(0,0,0,0.75)"}
                  style={{ pointerEvents: "none", userSelect: "none", transition: "fill 120ms" }}
                >
                  {s.label}
                </text>
              </g>
            );
          })}
          {/* centro */}
          <circle cx={cx} cy={cy} r={Math.max(22, size * 0.06)} fill="#111" />
          <circle cx={cx} cy={cy} r={Math.max(18, size * 0.05)} fill="#fff" />
        </svg>
      </div>

      <button
        onClick={play}
        disabled={running || !n}
        className="buttonPpal"
        style={{ alignSelf: "center" }}
      >
        {running ? "Jugando..." : "Jugar"}
      </button>
    </div>
  );
}
