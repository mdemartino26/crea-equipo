// src/pages/Admin/components/EditConsignaModal.jsx
import { useState, useMemo } from "react";
import { db } from "../../../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { uploadToCloudinary } from "../../../lib/cloudinary";

// util: transforma textarea en array (split por líneas o por "|")
function parseMulti(text = "") {
  return text
    .split(/\r?\n|\|/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function EditConsignaModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    titulo: item.titulo || item.obra || "",
    enunciado: item.enunciado || "",
    tipo: item.tipo || "texto",
    respuestaCorrecta: item.respuestaCorrecta || "",
    mediaURL: item.mediaURL || "",
  });

  // Inicializamos el textarea a partir del array existente (si lo hay)
  const initialMulti = useMemo(() => {
    const arr = Array.isArray(item.respuestasCorrectas) ? item.respuestasCorrectas : [];
    return arr.join("\n");
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
      setForm((f) => ({ ...f, mediaURL: up.url || up.secure_url || up }));
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

      // Construimos el array a guardar desde el textarea + single de compatibilidad
      const arr = parseMulti(respuestasCorrectasText);
      const single = (form.respuestaCorrecta || "").trim();
      const respuestasCorrectas = Array.from(
        new Set([...(arr || []), ...(single ? [single] : [])])
      );

      const payload = {
        // Mantengo compat con naming: título puede estar en 'obra'
        titulo: form.titulo || "",
        obra: form.titulo || "", // si usás 'obra' en el resto del app
        enunciado: form.enunciado || "",
        tipo: form.tipo,
        // Compatibilidad: dejamos single como primera alternativa si hay
        respuestaCorrecta: respuestasCorrectas.length ? respuestasCorrectas[0] : (single || ""),
        respuestasCorrectas, // <-- NUEVO ARRAY
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
      <div className="modal">
        <h3>Editar consigna</h3>
        <form onSubmit={save} className="formEditar">
          <label className="inputEdit">Título
            <input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
          </label>
          <label className="inputEdit">Enunciado
            <textarea rows={4} value={form.enunciado}
              onChange={(e) => setForm((f) => ({ ...f, enunciado: e.target.value }))} />
          </label>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label className="inputEdit">Tipo:&nbsp;
              <select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
                <option value="texto">Texto</option>
                <option value="imagen">Imagen</option>
                <option value="audio">Audio</option>
              </select>
            </label>

            {form.tipo !== "texto" && (
              <>
                <label className="inputEdit">Media URL
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

            <label className="inputEdit" style={{ flex: "1 1 100%" }}>
              Respuestas correctas (una por línea o separadas por |)
              <textarea
                rows={3}
                value={respuestasCorrectasText}
                onChange={(e) => setRespuestasCorrectasText(e.target.value)}
                placeholder={"Ej:\nConstelaciones\nconstelaciones\n29\nveintinueve"}
              />
            </label>

            <label className="inputEdit">Respuesta (compatibilidad)
              <input
                value={form.respuestaCorrecta}
                onChange={(e) => setForm((f) => ({ ...f, respuestaCorrecta: e.target.value }))}
                placeholder="Se usará como primera del array si está vacío"
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

const backdrop = { position:"fixed", inset:0, background:"rgba(0,0,0,.35)", display:"grid", placeItems:"center", zIndex:1000 };
