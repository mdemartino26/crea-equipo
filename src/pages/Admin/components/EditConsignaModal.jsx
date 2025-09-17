import { useState } from "react";
import { db } from "../../../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../../../lib/cloudinary";

export default function EditConsignaModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    titulo: item.titulo || "",
    enunciado: item.enunciado || "",
    tipo: item.tipo || "texto",
    respuestaCorrecta: item.respuestaCorrecta || "",
    mediaURL: item.mediaURL || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const accept =
    form.tipo === "imagen" ? "image/*" : form.tipo === "audio" ? "audio/*" : "*/*";

  const uploadAndSet = async (file) => {
    setUploading(true);
    try {
      const up = await uploadToCloudinary(file, form.tipo);
      setForm((f) => ({ ...f, mediaURL: up.url }));
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
      const payload = {
        titulo: form.titulo || "",
        enunciado: form.enunciado || "",
        tipo: form.tipo,
        respuestaCorrecta: form.respuestaCorrecta || "",
        mediaURL: form.tipo === "texto" ? null : (form.mediaURL || null),
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
      <div style={modal}>
        <h3>Editar consigna</h3>
        <form onSubmit={save} style={{ display: "grid", gap: 10 }}>
          <label>Título
            <input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
          </label>
          <label>Enunciado
            <textarea rows={4} value={form.enunciado}
              onChange={(e) => setForm((f) => ({ ...f, enunciado: e.target.value }))} />
          </label>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label>Tipo:&nbsp;
              <select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
                <option value="texto">Texto</option>
                <option value="imagen">Imagen</option>
                <option value="audio">Audio</option>
              </select>
            </label>
            <label>Respuesta:&nbsp;
              <input value={form.respuestaCorrecta}
                onChange={(e) => setForm((f) => ({ ...f, respuestaCorrecta: e.target.value }))} />
            </label>
          </div>

          {form.tipo !== "texto" && (
            <>
              <label>Media URL
                <input value={form.mediaURL} onChange={(e) => setForm((f) => ({ ...f, mediaURL: e.target.value }))} />
              </label>
              <div>
                <small>o subir archivo</small><br />
                <input type="file" accept={accept}
                  onChange={(e) => e.target.files?.[0] && uploadAndSet(e.target.files[0])} />
                {uploading && <span> Subiendo…</span>}
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button type="button" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ background: "#0c7", color: "#fff" }}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const backdrop = { position:"fixed", inset:0, background:"rgba(0,0,0,.35)", display:"grid", placeItems:"center", zIndex:1000 };
const modal = { width:"min(720px,95vw)", background:"#fff", borderRadius:12, padding:16, boxShadow:"0 10px 30px rgba(0,0,0,.2)" };
