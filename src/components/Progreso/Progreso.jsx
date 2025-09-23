import React, { useMemo } from "react";

export default function Progreso({ current = 0, total = 1, label = "Progreso" }) {
  const safeTotal = Math.max(1, Number(total) || 1);
  const safeCurrent = Math.min(Math.max(0, Number(current) || 0), safeTotal - 1);

  const pct = useMemo(
    () => Math.round(((safeCurrent + 1) / safeTotal) * 100),
    [safeCurrent, safeTotal]
  );

  return (
    <div style={{ width: "100%", maxWidth: 520, display: "grid", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, fontSize: 14 }}>
        <span>{label}</span>
        <span>{safeCurrent + 1}/{safeTotal}</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        style={{
          position: "relative",
          width: "100%",
          height: 12,
          background: "#eee",
          borderRadius: 999,
          overflow: "hidden",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,.08)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0 auto 0 0",
            width: `${pct}%`,
            background: "#111",
            borderRadius: 999,
            transition: "width .35s ease",
          }}
        />
      </div>
    </div>
  );
}
