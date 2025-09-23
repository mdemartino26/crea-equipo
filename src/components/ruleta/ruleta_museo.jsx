import { useMemo, useRef, useState } from "react";
import {
  addDoc, collection, serverTimestamp, increment, updateDoc, doc,
} from "firebase/firestore";
import { db } from "../../firebase";

/**
 * Ruleta "Museo": 3 zonas disjuntas
 *  - Zona A: círculo interno
 *  - Zona B: anillo romboidal (rombo menos círculo interno)
 *  - Zona C: anillo externo (círculo externo menos rombo)
 *
 * Props:
 * - consignaId: string (para log)
 * - opciones: Array<string | { texto, color?, positive? }>, idealmente 3 ítems
 *             (si vienen 2 o 1, se repiten para completar 3)
 * - onWin, onFinish: callbacks
 * - size: diámetro px (default 340)
 * - positiveTexts: fallback para detectar positivos por texto
 * - ratios: { inner?:0..1, diamond?:0..1 } radios relativos
 */
export default function RuletaMuseo({
  consignaId,
  opciones = [],
  onWin = () => {},
  onFinish = () => {},
  size = 340,
  positiveTexts = ["sí", "si", "que suerte!", "avanzá", "positivo"],
  ratios = { inner: 0.28, diamond: 0.62 }, // ajustá para parecerse más al cuadro
}) {
  const nBase = Math.max(1, Math.min(3, opciones.length || 0));
  const cx = size / 2, cy = size / 2;
  const rOuter = size / 2 - 6;
  const rInner = Math.max(8, rOuter * (ratios.inner ?? 0.28));
  const rDiamond = Math.max(rInner + 8, rOuter * (ratios.diamond ?? 0.62)); // distancia a vértices

  // Paleta inspirada en el cuadro (podés tocar el orden/valores)
  const PALETTE = ["#E93E2E", "#F6D23A", "#2FB573", "#1E88E5", "#9B59B6", "#EC3E8A", "#F47A1F"];

  // Normalizador
  const norm = (s = "") =>
    String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // Expandir a 3 opciones (si faltan se repiten)
  const threeOptions = useMemo(() => {
    const base = (opciones.length ? opciones : ["sí", "intentá de nuevo", "que suerte!"])
      .map(x => (typeof x === "string" ? { texto: x } : x));
    while (base.length < 3) base.push(base[base.length % Math.max(1, nBase)]);
    return base.slice(0, 3).map((o, i) => ({
      texto: o.texto ?? String(o),
      color: o.color || PALETTE[i % PALETTE.length],
      positive: typeof o.positive === "boolean"
        ? o.positive
        : positiveTexts.map(norm).includes(norm(o.texto)),
    }));
  }, [opciones, nBase]);

  // Helpers paths
  const circlePath = (r) =>
    `M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} Z`;

  const diamondPath = () => {
    const p = [
      [cx, cy - rDiamond],
      [cx + rDiamond, cy],
      [cx, cy + rDiamond],
      [cx - rDiamond, cy],
    ];
    return `M ${p[0][0]} ${p[0][1]} L ${p[1][0]} ${p[1][1]} L ${p[2][0]} ${p[2][1]} L ${p[3][0]} ${p[3][1]} Z`;
  };

  // Zonas (paths con evenodd para “restar” figuras)
  const pathCircleInner = circlePath(rInner);                         // Zona A
  const pathDiamondRing = `${diamondPath()} ${circlePath(rInner)}`;   // Zona B (rombo - círculo)
  const pathOuterRing   = `${circlePath(rOuter)} ${diamondPath()}`;   // Zona C (círculo - rombo)

  // Puntos para textos
  const labelA = { x: cx, y: cy, rot: 0 }; // centro
  const labelB = { x: cx + (rInner + rDiamond) * 0.5, y: cy, rot: 0 }; // a la derecha del centro
  const labelC = { x: cx, y: cy + (rDiamond + rOuter) * 0.5, rot: 0 }; // abajo

  const zonas = [
    { d: pathCircleInner, labelPos: labelA },
    { d: pathDiamondRing, labelPos: labelB, evenodd: true },
    { d: pathOuterRing,   labelPos: labelC, evenodd: true },
  ];

  // Animación tipo “Simón”
  const [activeIdx, setActiveIdx] = useState(null);
  const [finalIdx, setFinalIdx] = useState(null);
  const [running, setRunning] = useState(false);
  const timersRef = useRef([]);

  function clearTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }

  function isPositiveIdx(i) { return Boolean(threeOptions[i]?.positive); }
  function pickPositiveIndex() {
    const pos = threeOptions.map((o, i) => (o.positive ? i : -1)).filter(i => i >= 0);
    return pos.length ? pos[Math.floor(Math.random() * pos.length)] : Math.floor(Math.random() * 3);
  }

  async function logSpin(id, { target, won }) {
    if (!id) return;
    try {
      await addDoc(collection(db, "consignas", id, "spins"), {
        target, won, createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "consignas", id), {
        spins: increment(1), lastSpinAt: serverTimestamp(),
      });
    } catch (e) { console.warn("No se pudo loguear spin:", e?.message); }
  }

  function play() {
    if (running) return;
    setRunning(true);
    setFinalIdx(null);
    setActiveIdx(null);
    clearTimers();

    const flashes = 8;
    const base = 130;
    const target = pickPositiveIndex();

    for (let k = 0; k < flashes; k++) {
      const t = setTimeout(() => setActiveIdx(Math.floor(Math.random() * 3)), k * base);
      timersRef.current.push(t);
    }

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
        {/* puntero */}
        <div
          aria-hidden
          style={{
            position: "absolute", left: "50%", top: -2, transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "10px solid transparent", borderRight: "10px solid transparent",
            borderTop: "16px solid #111", zIndex: 3,
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,.35))",
          }}
        />
        <svg
          width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ display: "block", borderRadius: "50%", filter: "drop-shadow(0 6px 18px rgba(0,0,0,.15))" }}
        >
          {/* borde externo suave */}
          <circle cx={cx} cy={cy} r={rOuter + 2} fill="#fff" />
          <circle cx={cx} cy={cy} r={rOuter + 0.5} fill="#f8f8f8" />

          {zonas.map((z, i) => {
            const active = i === activeIdx;
            const isFinal = i === finalIdx;
            const fill = threeOptions[i]?.color || PALETTE[i % PALETTE.length];
            const texto = threeOptions[i]?.texto ?? `opción ${i + 1}`;

            return (
              <g key={i}>
                <path
                  d={z.d}
                  fill={fill}
                  fillRule={z.evenodd ? "evenodd" : "nonzero"}
                  opacity={active ? 1 : 0.92}
                  stroke="#ffffff"
                  strokeWidth={2}
                  style={{
                    transition: "opacity 120ms",
                    filter: isFinal ? "drop-shadow(0 0 10px rgba(0,0,0,0.25))" : "none",
                  }}
                />
                <text
                  x={z.labelPos.x} y={z.labelPos.y}
                  fontSize={Math.max(12, size * 0.038)}
                  fontWeight="700"
                  textAnchor="middle" dominantBaseline="middle"
                  transform={`rotate(${z.labelPos.rot} ${z.labelPos.x} ${z.labelPos.y})`}
                  fill={active || isFinal ? "#111" : "rgba(0,0,0,0.74)"}
                  style={{ userSelect: "none", pointerEvents: "none", transition: "fill 120ms" }}
                >
                  {texto}
                </text>
              </g>
            );
          })}

          {/* círculo central “botón” */}
          <circle cx={cx} cy={cy} r={Math.max(14, size * 0.05)} fill="#111" />
          <circle cx={cx} cy={cy} r={Math.max(10, size * 0.04)} fill="#fff" />
        </svg>
      </div>

      <button
        onClick={play}
        disabled={running}
        className="buttonPpal"
        style={{ alignSelf: "center" }}
      >
        {running ? "Jugando..." : "Jugar"}
      </button>
    </div>
  );
}
