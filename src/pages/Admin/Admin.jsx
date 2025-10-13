import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

import ConsignaForm from "./components/ConsignaForm";
import EditConsignaModal from "./components/EditConsignaModal";
import "./styles.css";

export default function Admin() {
  const [serverItems, setServerItems] = useState([]);
  const [draft, setDraft] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openForm, setOpenForm] = useState(false);
  const [reorderMode, setReorderMode] = useState(true);
  const [groupHiddenLast, setGroupHiddenLast] = useState(true);

  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [editing, setEditing] = useState(null);

  // ---------- TOGGLE GLOBAL (persistente) ----------
  const STORAGE_KEY = "gameOn";

  const [gameOn, setGameOn] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "false");
    } catch {
      return false;
    }
  });

  useEffect(() => {
  localStorage.setItem("gameOn", JSON.stringify(gameOn));
  window.dispatchEvent(new Event("gameon:change")); // <- necesario

  if (!gameOn) {
    // limpiar LS excepto el flag
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k !== "gameOn") localStorage.removeItem(k);
    }
  }
}, [gameOn]);
  const toggleGame = () => setGameOn((v) => !v);
  // -------------------------------------------------

  useEffect(() => {
    const q = query(collection(db, "consignas"), orderBy("orden", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setServerItems(arr);
        setLoading(false);
        setDraft((prev) => (dirty ? prev : arr));
      },
      (err) => {
        console.error("onSnapshot Admin:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [dirty]);

  const nextOrden = useMemo(() => {
    const base = serverItems[serverItems.length - 1]?.orden ?? 0;
    return Number.isFinite(base) ? base + 10 : 10;
  }, [serverItems]);

  const markDirty = () => setDirty(true);

  const buildRender = (arr) => {
    if (!groupHiddenLast) return [...arr];
    const vis = arr.filter((x) => Boolean(x.visible));
    const hid = arr.filter((x) => !Boolean(x.visible));
    return [...vis, ...hid];
  };
  const renderList = useMemo(
    () => buildRender(draft),
    [draft, groupHiddenLast]
  );

  const toggleVisibleDraft = (id) => {
    setDraft((prev) => {
      const next = prev.map((x) =>
        x.id === id ? { ...x, visible: !x.visible } : x
      );
      return buildRender(next);
    });
    markDirty();
  };

  const moveByRenderIndex = (itemId, toIdx) => {
    setDraft((prev) => {
      const cur = buildRender(prev);
      const fromIdx = cur.findIndex((x) => x.id === itemId);
      if (fromIdx < 0 || fromIdx === toIdx) return prev;
      const arr = [...cur];
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr;
    });
    markDirty();
  };

  const dragId = useRef(null);
  const onDragStart = (id) => (e) => {
    if (!reorderMode) return;
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };
  const onDragOver = () => (e) => {
    if (!reorderMode) return;
    e.preventDefault();
  };
  const onDrop = (toIdx) => (e) => {
    if (!reorderMode) return;
    e.preventDefault();
    const id = dragId.current || e.dataTransfer.getData("text/plain");
    if (!id) return;
    moveByRenderIndex(id, toIdx);
    dragId.current = null;
  };

  const diffs = useMemo(() => {
    const src = renderList;
    const changes = [];
    src.forEach((d, i) => {
      const srv = serverItems.find((x) => x.id === d.id);
      if (!srv) return;
      const desiredOrden = (i + 1) * 10;
      const orderChanged = (srv.orden ?? 0) !== desiredOrden;
      const visibleChanged = Boolean(srv.visible) !== Boolean(d.visible);
      if (orderChanged || visibleChanged) {
        changes.push({
          id: d.id,
          orden: desiredOrden,
          visible: Boolean(d.visible),
        });
      }
    });
    return changes;
  }, [renderList, serverItems]);

  const canSave = dirty && diffs.length > 0 && !saving;

  const guardarCambios = async () => {
    if (!canSave) return;
    try {
      setSaving(true);
      const batch = writeBatch(db);
      diffs.forEach((ch) => {
        batch.update(doc(db, "consignas", ch.id), {
          orden: ch.orden,
          visible: ch.visible,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      setDirty(false);
    } catch (e) {
      console.error("Guardar cambios error:", e);
      alert("No se pudieron guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const descartarCambios = () => {
    setDraft(serverItems);
    setDirty(false);
  };

  const onSavedItem = (id, data) => {
    setDraft((prev) => prev.map((x) => (x.id === id ? { ...x, ...data } : x)));
  };

  if (loading) return <main className="loading">Cargando…</main>;

  const isTouch =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(pointer: coarse)").matches;

  return (
    <div className="administrador">
      <h1 className="adminTitulo">Administrador</h1>

      <div className="barraAcciones">
        {/* Toggle ON/OFF */}
        <div
          style={{
            marginLeft: 12,
            padding: "6px 10px",
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <strong>Juego: {gameOn ? "ENCENDIDO" : "APAGADO"}</strong>{" "}
          <button
            type="button"
            onClick={toggleGame}
            className="btnOutline"
            style={{
              marginLeft: 8,
              background: gameOn ? "#e74c3c" : "#2ecc71",
              color: "#fff",
              borderColor: "transparent",
            }}
          >
            {gameOn ? "Apagar" : "Encender"}
          </button>
        </div>

        <div className="accOpcion">
          <button
            onClick={() => setOpenForm((v) => !v)}
            className="btnFormulario"
          >
            {openForm ? "▲ Cerrar formulario" : "＋ Nueva consigna"}
          </button>

          <label style={{ userSelect: "none" }}>
            <input
              type="checkbox"
              checked={groupHiddenLast}
              onChange={() => setGroupHiddenLast((v) => !v)}
            />{" "}
            Ocultas al final
          </label>

          <span style={{ opacity: 0.8 }}>
            Cambios pendientes: <strong>{diffs.length}</strong>
          </span>
        </div>

        <div className="btnCambios">
          <button
            type="button"
            onClick={descartarCambios}
            disabled={!dirty || saving}
            className="btnDescartar"
          >
            Descartar
          </button>

          <button
            type="button"
            onClick={guardarCambios}
            disabled={!canSave}
            className="btnOutline"
            style={{
              background: canSave ? "#0c7" : "#aaa",
              color: "#fff",
              borderColor: "transparent",
            }}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <ConsignaForm isOpen={openForm} defaultOrden={nextOrden} />

      <hr
        style={{ border: 0, borderTop: "1px solid #eee", margin: "16px 0" }}
      />

      <h2 style={{ marginTop: 0 }}>Listado de consignas</h2>
      <p style={{ opacity: 0.7, marginTop: -8 }}>
        Total: {renderList.length} {dirty && "· (editando…)"}
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {renderList.map((it, idx) => (
          <li
            key={it.id}
            className="consignas"
            draggable={reorderMode && !isTouch}
            onDragStart={onDragStart(it.id)}
            onDragOver={onDragOver(idx)}
            onDrop={onDrop(idx)}
          >
            {!isTouch ? (
              <div className="dragNdrop" title="Arrastrar para reordenar">
                <span style={{ cursor: reorderMode ? "grab" : "default" }}>
                  ☰
                </span>
              </div>
            ) : (
              <div className="touchReorder" aria-label="Reordenar">
                <button
                  type="button"
                  className="btnIcon"
                  onClick={() => moveByRenderIndex(it.id, Math.max(0, idx - 1))}
                  disabled={idx === 0}
                  title="Subir"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="btnIcon"
                  onClick={() =>
                    moveByRenderIndex(
                      it.id,
                      Math.min(renderList.length - 1, idx + 1)
                    )
                  }
                  disabled={idx === renderList.length - 1}
                  title="Bajar"
                >
                  ▼
                </button>
              </div>
            )}

            <div className="datos">
              <h4 className="titulo">{it.obra || "(sin título)"}</h4>
              <div className="meta">
                {it.tipo ?? "texto"}{" "}
                {it.mediaURL ? "· con archivo" : "· sin archivo"} ·{" "}
                {it.visible ? "visible" : "oculto"}
              </div>

              <div className="controls">
                <div className="selectWrap">
                  <select
                    className="selectOutline"
                    value={idx + 1}
                    onChange={(e) =>
                      moveByRenderIndex(it.id, Number(e.target.value) - 1)
                    }
                    title="Mover a posición…"
                  >
                    {renderList.map((_, i) => (
                      <option key={i} value={i + 1}>
                        Posición {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="btnAcc"
                  onClick={() => setEditing(it)}
                >
                  Editar
                </button>

                <button
                  type="button"
                  className="btnAcc"
                  onClick={() => toggleVisibleDraft(it.id)}
                >
                  {it.visible ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <Link
              className="linkVer"
              to={`/actividad/${it.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Ver
            </Link>
          </li>
        ))}
      </ul>

      {editing && (
        <EditConsignaModal
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={(dataActualizada) => {
            onSavedItem(editing.id, dataActualizada);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
