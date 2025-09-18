// src/components/ruleta/ruleta.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  increment,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function Ruleta({
  consignaId,
  opciones = [],
  forceWin = true,
  winIndex = 0,
  onWin = () => {},
  onFinish = () => {},
  winDelayMs = 600,
  size = 320, // diámetro en px
}) {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0); // rotación actual en grados
  const [targetIdx, setTargetIdx] = useState(0);
  const wheelRef = useRef(null);
  const transitionRef = useRef(""); // para resetear transition entre giros

  const seg = opciones.length ? 360 / opciones.length : 0;

  function pickTarget() {
    if (!opciones.length) return 0;
    if (forceWin)
      return ((winIndex % opciones.length) + opciones.length) % opciones.length;
    return Math.floor(Math.random() * opciones.length);
  }

  // Calcula el ángulo final para que el índice "idx" quede bajo el puntero (arriba, 12 en punto)
  function computeFinalAngle(idx) {
    // centro del segmento
    const center = idx * seg + seg / 2;
    // rotamos la rueda para que ese centro vaya a 0° (arriba)
    // sumamos vueltas completas para el “show”
    const vueltas = 5; // podés ajustar
    const base = 360 * vueltas + (360 - center);
    return base;
  }

  async function logSpin(id, { target, won }) {
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

  function spin() {
    if (spinning || !opciones.length) return;
    const target = pickTarget();
    setTargetIdx(target);
    setSpinning(true);

    // resetear transición para permitir giros consecutivos desde el estado actual
    const wheel = wheelRef.current;
    if (wheel) {
      // quitar transición, fijar rotación actual (forzar reflow), y volver a activar transición suave
      transitionRef.current = wheel.style.transition;
      wheel.style.transition = "none";
      wheel.style.transform = `rotate(${angle % 360}deg)`;
      // reflow
      wheel.getBoundingClientRect();
      wheel.style.transition = "transform 4s cubic-bezier(0.15, 0.85, 0.15, 1)";
    }

    const finalAngle = computeFinalAngle(target);
    setAngle(finalAngle);
  }

  // Al terminar la transición del giro, resolvemos resultado
  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;

    const onEnd = async () => {
      const won = opciones.length
        ? targetIdx ===
          ((winIndex % opciones.length) + opciones.length) % opciones.length
        : false;

      await logSpin(consignaId, { target: targetIdx, won });

      if (won) {
        setTimeout(() => {
          try {
            onWin();
          } catch {}
          try {
            onFinish();
          } catch {}
          setSpinning(false);
        }, winDelayMs);
      } else {
        try {
          onFinish();
        } catch {}
        setSpinning(false);
      }

      // dejar la rueda “limpia”: fijar ángulo residual entre 0–359 y remover transición temporal
      if (wheel) {
        const residual = ((angle % 360) + 360) % 360;
        wheel.style.transition = "none";
        wheel.style.transform = `rotate(${residual}deg)`;
        // reflow y restaurar transición default para próximos giros
        wheel.getBoundingClientRect();
        wheel.style.transition = transitionRef.current || "";
        setAngle(residual);
      }
    };

    wheel.addEventListener("transitionend", onEnd);
    return () => wheel.removeEventListener("transitionend", onEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    angle,
    targetIdx,
    consignaId,
    winIndex,
    winDelayMs,
    onWin,
    onFinish,
    opciones.length,
  ]);

  const palette = useMemo(() => {
    if (!opciones.length) return [];
    const base = [
      "#ffd166",
      "#06d6a0",
      "#a3cef1",
      "#f4978e",
      "#b8f2e6",
      "#f2c6de",
      "#caffbf",
      "#ffd6a5",
      "#fdffb6",
      "#bdb2ff",
    ];
    return Array.from(
      { length: opciones.length },
      (_, i) => opciones[i]?.color || base[i % base.length]
    );
  }, [opciones]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;

  // genera paths de “torta” para cada segmento
  const slices = useMemo(() => {
    if (!opciones.length) return [];
    return opciones.map((opt, i) => {
      const start = (i * seg - 90) * (Math.PI / 180); // -90 para que empiece arriba
      const end = ((i + 1) * seg - 90) * (Math.PI / 180);
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const largeArc = seg > 180 ? 1 : 0;

      const d = [
        `M ${cx} ${cy}`,
        `L ${x1} ${y1}`,
        `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      const labelAngle = i * seg + seg / 2 - 90; // para ubicar texto
      const tx = cx + r * 0.6 * Math.cos((labelAngle * Math.PI) / 180);
      const ty = cy + r * 0.6 * Math.sin((labelAngle * Math.PI) / 180);

      return {
        i,
        d,
        fill: palette[i],
        label: opt?.texto ?? String(opt),
        labelAngle,
        tx,
        ty,
      };
    });
  }, [opciones, seg, cx, cy, r, palette]);

  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        {/* Puntero */}
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
            borderBottom: "0 solid transparent",
            zIndex: 2,
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,.35))",
          }}
        />
        {/* Rueda */}
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
          <g
            ref={wheelRef}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transition: "transform 4s cubic-bezier(0.15, 0.85, 0.15, 1)",
              transform: `rotate(${angle}deg)`,
            }}
          >
            {/* fondo */}
            <circle cx={cx} cy={cy} r={r + 4} fill="#f5f5f5" />
            {/* segmentos */}
            {slices.map((s) => (
              <g key={s.i}>
                <path d={s.d} fill={s.fill} stroke="#ffffff" strokeWidth={2} />
                <text
                  x={s.tx}
                  y={s.ty}
                  fontSize={Math.max(12, size * 0.035)}
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${s.labelAngle + 90}, ${s.tx}, ${s.ty})`}
                  fill="#111"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {s.label}
                </text>
              </g>
            ))}
            {/* centro */}
            <circle cx={cx} cy={cy} r={Math.max(22, size * 0.06)} fill="#111" />
            <circle cx={cx} cy={cy} r={Math.max(18, size * 0.05)} fill="#fff" />
          </g>
        </svg>
      </div>

      <button
        onClick={spin}
        disabled={spinning || !opciones.length}
        className="buttonPpal"
        style={{ alignSelf: "center" }}
      >
        {spinning ? "Girando..." : "Girar"}
      </button>
    </div>
  );
}
