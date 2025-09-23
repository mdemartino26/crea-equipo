// src/pages/Admin/components/EditConsignaModal.jsx
import { useState, useMemo } from "react";
import { db } from "../../../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../../../lib/cloudinary";

// utils
function parseMulti(text = "") {
  return String(text)
    .split(/\r?\n|\|/g)
    .map((s) => s.trim())
    .filter(Boolean);
}
const toStr = (v) =>
  v == null ? "" : typeof v === "string" ? v : String(v);

// si viene array, usamos el primero; si viene número/otro, lo casteamos
const normalizeSingle = (v) =>
  Array.isArray(v) ? toStr(v[0] ?? "") : toStr(v);

export default function EditConsignaModal({ item, onClose, onSaved }) {
  const initialTitulo = toStr(item.titulo || item.obra || "");
  const initialRespuestaSingle = normalizeSingle(item.respuestaCorrecta);

  const [form, setForm] = useState({
    titulo: initialTitulo,
    enunciado: toStr(item.enunciado || ""),
    tipo: toStr(item.tipo || "texto"),
    respuestaCorrecta: initialRespuestaSingle,   // SIEMPRE string
    mediaURL: toStr(item.mediaURL || ""),
  });

  // textarea inicial con el array si existe
  const initialMulti = useMemo(() => {
    const arr = Array.isArray(item.respuestasCorrectas) ? item.respuestasCorrectas : [];
    return arr.map(toStr).join("\n");
  }, [item.respuestasCorrectas]);

  const [respuestasCorrectasText, setRespuestasCorrectasText] = useState(initialMulti);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const accept =
    form.tipo === "imagen" ? "image/*" : form.tipo === "audio" ? "audio/*" : "*/*";

  const uploadAndSet = async (file) => {
    setUploading(true);
    try {
      const up = await uploadToCloudinary(file, form.tipo);
      // up puede ser string o objeto
      const url = (up && (up.secure_url || up.url)) || String(up || "");
      setForm((f) => ({ ...f, mediaURL: url }));
    } catch (e) {
      alert("No se pudo subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (saving) return;
    try {
      setSaving(true);

      // construimos array desde textarea + single (todo como string)
      const arr = parseMulti(respuestasCorrectasText);
      const singleStr = toStr(form.respuestaCorrecta).trim();
      const respuestasCorrectas = Array.from(
        new Set([...(arr || []), ...(singleStr ? [singleStr] : [])])
      );

      const payload = {
        // muchas pantallas usan "obra" como título; guardo ambos por compat
        titulo: toStr(form.titulo),
        obra: toStr(form.titulo),
        enunciado: toStr(form.enunciado),
        tipo: toStr(form.tipo),
        respuestaCorrecta: respuestasCorrectas.length
          ? toStr(respuestasCorrectas[0])
          : singleStr, // compat
        respuestasCorrectas, // nuevo array
        mediaURL: form.tipo === "texto" ? null : (toStr(form.mediaURL) || null),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "consignas", item.id), payload);
      onSaved?.(payload);
      onClose();
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={backdrop}>
      <div className="modal">
        <h3>Editar consigna</h3>
        <form onSubmit={save} className="formEditar">
          <label className="inputEdit">Título
            <input
              value={toStr(form.titulo)}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
            />
          </label>
          <label className="inputEdit">Enunciado
            <textarea
              rows={4}
              value={toStr(form.enunciado)}
              onChange={(e) => setForm((f) => ({ ...f, enunciado: e.target.value }))}
            />
          </label>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label className="inputEdit">Tipo:&nbsp;
              <select
                value={toStr(form.tipo)}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
              >
                <option value="texto">Texto</option>
                <option value="imagen">Imagen</option>
                <option value="audio">Audio</option>
              </select>
            </label>

            {form.tipo !== "texto" && (
              <>
                <label className="inputEdit">Media URL
                  <input
                    value={toStr(form.mediaURL)}
                    onChange={(e) => setForm((f) => ({ ...f, mediaURL: e.target.value }))}
                  />
                </label>
                <div>
                  <small>o subir archivo</small><br />
                  <input
                    type="file"
                    accept={accept}
                    onChange={(e) => e.target.files?.[0] && uploadAndSet(e.target.files[0])}
                  />
                  {uploading && <span> Subiendo…</span>}
                </div>
              </>
            )}

            <label className="inputEdit" style={{ flex: "1 1 100%" }}>
              Respuestas correctas (una por línea o separadas por |)
              <textarea
                rows={3}
                value={toStr(respuestasCorrectasText)}
                onChange={(e) => setRespuestasCorrectasText(e.target.value)}
                placeholder={"Ej:\nConstelaciones\nconstelaciones\n29\nveintinueve"}
              />
            </label>

            <label className="inputEdit">Respuesta (compatibilidad)
              <input
                value={toStr(form.respuestaCorrecta)}
                onChange={(e) => setForm((f) => ({ ...f, respuestaCorrecta: e.target.value }))}
                placeholder="Se usará como primera del array si arriba está vacío"
              />
            </label>
          </div>

          <div className="btnConfirmar">
            <button type="button" onClick={onClose} disabled={saving} className="btnConfir">Cancelar</button>
            <button type="submit" disabled={saving} className="btnConfir save">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const backdrop = {
  position:"fixed",
  inset:0,
  background:"rgba(0,0,0,.35)",
  display:"grid",
  placeItems:"center",
  zIndex:1000
};
