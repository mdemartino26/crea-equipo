import { useMemo, useRef, useState, useEffect } from "react";
import {
  addDoc, collection, serverTimestamp, increment, updateDoc, doc,
} from "firebase/firestore";
import { db } from "../../firebase";

/**
 * Ruleta "Museo" (8 outer, 4 diamond, 8 inner) con giro ≥5s y modal de confirmación.
 * Paleta por región via colorsByRegion. Fallback robusto si no se dispara transitionend.
 */
export default function RuletaMuseoSub({
  consignaId,
  opciones = [],
  onWin = () => {},
  onFinish = () => {},
  size = 250,
  outerSegments = 8,
  innerSegments = 8,
  positiveTexts = ["sí","si","que suerte!","avanzá","positivo"],
  ratios = { inner: 0.26, diamond: 0.64 },
  spinDurationMs = 5600,     // ≥ 5000 ms
  spinTurns = 6,
  colorsByRegion,
  labelVisibility = { outer: true, diamond: false, inner: false },
  // NUEVO: si true prioriza el color de cada opción; si false (default) usa paleta por región
  preferOptionColors = false,
}) {
  const cx = size / 2, cy = size / 2;
  const rOuter   = size / 2 - 6;
  const rDiamond = Math.max(20, rOuter * (ratios.diamond ?? 0.64));
  const rInner   = Math.max(12, rOuter * (ratios.inner ?? 0.26));

  // Paleta por región (aproximada al cuadro)
  const DEFAULT = {
    outer:   ["#F04A1D","#FFD23F","#9EE06E","#26B36A","#1E88E5","#2CB1C9","#E83E8C","#D72638"],
    diamond: ["#F06292","#90A4AE","#D84315","#F9D34E"],
    inner:   ["#C62828","#2E7D32","#1976D2","#FBC02D","#8E24AA","#00ACC1","#EF6C00","#43A047"],
  };
  const COLORS = colorsByRegion ?? DEFAULT;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const polar = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const normDeg = (d) => ((d % 360) + 360) % 360;

  const rOnDiamond = (theta) => {
    const c = Math.abs(Math.cos(theta));
    const s = Math.abs(Math.sin(theta));
    return rDiamond / (c + s || 1e-6);
  };

  const norm = (s="") => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
  const isPositiveText = (t) => positiveTexts.map(norm).includes(norm(t));

  const opts = useMemo(() => {
    const base = (opciones.length ? opciones : ["sí","intentá de nuevo","que suerte!"])
      .map((x) => (typeof x === "string"
        ? { texto: x, positive: isPositiveText(x) }
        : { texto: x.texto ?? String(x), color: x.color, positive: typeof x.positive === "boolean" ? x.positive : isPositiveText(x.texto) }
      ));
    if (!base.some(o => o.positive)) base[0].positive = true;
    return base;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(opciones)]);

  const shapes = useMemo(() => {
    const items = [];

    // OUTER (círculo↔rombo): 8
    const stepOut = 360 / outerSegments;
    for (let i=0;i<outerSegments;i++){
      const a0 = toRad(-90 + i*stepOut);
      const a1 = toRad(-90 + (i+1)*stepOut);
      const [x0,y0] = polar(rOuter, a0);
      const [x1,y1] = polar(rOuter, a1);
      const [xi0,yi0] = polar(rOnDiamond(a0), a0);
      const [xi1,yi1] = polar(rOnDiamond(a1), a1);
      const d = `M ${x0} ${y0} A ${rOuter} ${rOuter} 0 0 1 ${x1} ${y1} L ${xi1} ${yi1} L ${xi0} ${yi0} Z`;
      const am = toRad(-90 + (i+0.5)*stepOut);
      const rMid = (rOnDiamond(am) + rOuter) / 2;
      const [tx,ty] = polar(rMid, am);
      items.push({
        region: "outer",
        d,
        labelPos: { x: tx, y: ty },
        angleDeg: normDeg(toDeg(am)),
        color: COLORS.outer[i % COLORS.outer.length],
      });
    }

    // DIAMOND: 4 triángulos
    const verts = [
      [cx, cy - rDiamond],[cx + rDiamond, cy],[cx, cy + rDiamond],[cx - rDiamond, cy],
    ];
    for (let i=0;i<4;i++){
      const v0 = verts[i], v1 = verts[(i+1)%4];
      const d = `M ${cx} ${cy} L ${v0[0]} ${v0[1]} L ${v1[0]} ${v1[1]} Z`;
      const mx = (v0[0]+v1[0]+cx)/3, my=(v0[1]+v1[1]+cy)/3;
      const ang = Math.atan2(my - cy, mx - cx);
      items.push({
        region: "diamond",
        d,
        labelPos: { x: mx, y: my },
        angleDeg: normDeg(toDeg(ang)),
        color: COLORS.diamond[i % COLORS.diamond.length],
      });
    }

    // INNER: 8
    const stepIn = 360 / innerSegments;
    for (let i=0;i<innerSegments;i++){
      const a0 = toRad(-90 + i*stepIn);
      const a1 = toRad(-90 + (i+1)*stepIn);
      const [u0x,u0y] = polar(rInner, a0);
      const [u1x,u1y] = polar(rInner, a1);
      const d = `M ${cx} ${cy} L ${u0x} ${u0y} A ${rInner} ${rInner} 0 0 1 ${u1x} ${u1y} Z`;
      const am = toRad(-90 + (i+0.5)*stepIn);
      const [tx,ty] = polar(rInner*0.6, am);
      items.push({
        region: "inner",
        d,
        labelPos: { x: tx, y: ty },
        angleDeg: normDeg(toDeg(am)),
        color: COLORS.inner[i % COLORS.inner.length],
      });
    }

    // textos / positivos cíclicos
    const out = items.map((s, i) => {
      const o = opts[i % opts.length];
      return { ...s, label: o.texto, positive: !!o.positive, ocolor: o.color };
    });
    if (!out.some(x => x.positive) && out.length) out[0].positive = true;
    return out;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outerSegments, innerSegments, rOuter, rDiamond, rInner, COLORS, JSON.stringify(opts)]);

  // --- giro + modal, con fallback ---
  const [angle, setAngle] = useState(0);
  const [running, setRunning] = useState(false);
  const [finalIdx, setFinalIdx] = useState(null);
  const [result, setResult] = useState(null);
  const wheelRef = useRef(null);
  const savedTransition = useRef("");
  const endedRef = useRef(false);
  const endTimerRef = useRef(null);

  const pickPositiveIndex = () => {
    const pos = shapes.map((s,i)=>s.positive ? i : -1).filter(i=>i>=0);
    return pos.length ? pos[Math.floor(Math.random()*pos.length)] : Math.floor(Math.random()*shapes.length);
  };

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

  function finishSpin(target, finalAngle) {
    if (endedRef.current) return;
    endedRef.current = true;
    clearTimeout(endTimerRef.current);

    const g = wheelRef.current;
    const won = !!shapes[target]?.positive;
    const label = shapes[target]?.label ?? "";

    if (g) {
      const residual = normDeg(finalAngle);
      g.style.transition = "none";
      g.style.transform = `rotate(${residual}deg)`;
      g.getBoundingClientRect();
      g.style.transition = savedTransition.current || "";
    }
    setAngle(normDeg(finalAngle));
    setFinalIdx(target);
    setResult({ label, positive: won });
    setRunning(false);

    logSpin(consignaId, { target, won }).catch(()=>{});
  }

  function play() {
    if (running || !shapes.length) return;

    const target = pickPositiveIndex();
    const aTarget = shapes[target].angleDeg;
    const finalAngle = spinTurns * 360 + (-90 - aTarget);

    const g = wheelRef.current;
    if (g) {
      savedTransition.current = g.style.transition;
      const residual = normDeg(angle);
      g.style.transition = "none";
      g.style.transform = `rotate(${residual}deg)`;
      g.getBoundingClientRect();
      g.style.transition = `transform ${Math.max(5000, spinDurationMs)}ms cubic-bezier(0.17, 0.89, 0.23, 1.02)`;
      g.style.willChange = "transform";
    }

    endedRef.current = false;
    clearTimeout(endTimerRef.current);
    setFinalIdx(null);
    setResult(null);
    setRunning(true);
    setAngle(finalAngle);

    endTimerRef.current = setTimeout(() => {
      finishSpin(target, finalAngle);
    }, Math.max(5000, spinDurationMs) + 120);

    play._target = target;
    play._finalAngle = finalAngle;
  }

  function handleTransitionEnd(e) {
    if (e?.propertyName !== "transform") return;
    if (endedRef.current) return;
    finishSpin(play._target, play._finalAngle);
  }

  useEffect(() => () => clearTimeout(endTimerRef.current), []);

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

        {/* disco */}
        <svg
          width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ display: "block", borderRadius: "50%", filter: "drop-shadow(0 6px 18px rgba(0,0,0,.15))" }}
        >
          <g
            ref={wheelRef}
            onTransitionEnd={handleTransitionEnd}
            style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${angle}deg)` }}
          >
            {/* borde */}
            <circle cx={cx} cy={cy} r={rOuter + 2} fill="#fff" />
            <circle cx={cx} cy={cy} r={rOuter + 0.5} fill="#f8f8f8" />

            {shapes.map((s, i) => {
              const show =
                (s.region === "outer"   && labelVisibility.outer) ||
                (s.region === "diamond" && labelVisibility.diamond) ||
                (s.region === "inner"   && labelVisibility.inner);
              return (
                <g key={i}>
                  <path
                    d={s.d}
                    // 👇 prioridad de color: por región primero, luego color de opción
                    fill={preferOptionColors ? (s.ocolor || s.color) : (s.color || s.ocolor)}
                    opacity={i === finalIdx ? 1 : 0.92}
                    stroke="#ffffff"
                    strokeWidth={2}
                    style={{
                      filter: i === finalIdx ? "drop-shadow(0 0 10px rgba(0,0,0,0.25))" : "none",
                    }}
                  />
                  {show && (
                    <text
                      x={s.labelPos.x} y={s.labelPos.y}
                      fontSize={Math.max(11, size * 0.032)}
                      fontWeight="700"
                      textAnchor="middle" dominantBaseline="middle"
                      fill={i === finalIdx ? "#111" : "rgba(0,0,0,0.74)"}
                      style={{ userSelect: "none", pointerEvents: "none" }}
                    >
                      {s.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* centro */}
            <circle cx={cx} cy={cy} r={Math.max(14, size * 0.05)} fill="#111" />
            <circle cx={cx} cy={cy} r={Math.max(10, size * 0.04)} fill="#fff" />
          </g>
        </svg>
      </div>

      <button
        onClick={play}
        disabled={running || !shapes.length || !!result}
        className="buttonPpal"
        style={{ alignSelf: "center" }}
      >
        {running ? "Girando..." : "Jugar"}
      </button>

      {/* Modal */}
      {result && (
        <div role="dialog" aria-modal="true"
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", display:"grid", placeItems:"center", zIndex:50 }}>
          <div style={{ background:"#fff", borderRadius:12, padding:20, width:"min(90vw,360px)", boxShadow:"0 12px 32px rgba(0,0,0,.25)", textAlign:"center" }}>
            <h3 style={{ margin:"0 0 8px 0" }}>Resultado</h3>
            <div style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>
              {result.label}
            </div>
            <button
              className="buttonPpal"
              onClick={() => {
                try { if (result.positive) onWin(); } catch {}
                try { onFinish(); } catch {}
                setResult(null);
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
