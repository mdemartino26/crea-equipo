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
const toStr = (v) => (v == null ? "" : typeof v === "string" ? v : String(v));
// si viene array, usamos el primero; si viene número/otro, lo casteamos
const normalizeSingle = (v) => (Array.isArray(v) ? toStr(v[0] ?? "") : toStr(v));

export default function EditConsignaModal({ item, onClose, onSaved }) {
  // ---- base fields ----
  const [form, setForm] = useState({
    titulo: toStr(item.titulo || item.obra || ""),
    enunciado: toStr(item.enunciado || ""),
    tipo: toStr(item.tipo || "texto"), // NO limita medios
    respuestaCorrecta: normalizeSingle(item.respuestaCorrecta),
  });

  // ---- respuestas múltiples (textarea) ----
  const initialMulti = useMemo(() => {
    const arr = Array.isArray(item.respuestasCorrectas) ? item.respuestasCorrectas : [];
    return arr.map(toStr).join("\n");
  }, [item.respuestasCorrectas]);
  const [respuestasCorrectasText, setRespuestasCorrectasText] = useState(initialMulti);

  // ---- medios independientes (con compat mediaURL legado) ----
  const initialImageURL = toStr(
    item.imageURL || ((item.tipo === "imagen" || !item.imageURL) && item.mediaURL) || ""
  );
  const initialAudioURL = toStr(
    item.audioURL || ((item.tipo === "audio" || !item.audioURL) && item.mediaURL) || ""
  );

  const [imgEnabled, setImgEnabled] = useState(Boolean(initialImageURL));
  const [imgURL, setImgURL] = useState(initialImageURL);

  const [audEnabled, setAudEnabled] = useState(Boolean(initialAudioURL));
  const [audURL, setAudURL] = useState(initialAudioURL);

  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingAud, setUploadingAud] = useState(false);

  // ---- upload helpers ----
  const uploadImage = async (file) => {
    setUploadingImg(true);
    try {
      const up = await uploadToCloudinary(file, "image");
      const url = (up && (up.secure_url || up.url)) || String(up || "");
      setImgURL(url);
      setImgEnabled(true);
    } catch (e) {
      alert("No se pudo subir la imagen");
    } finally {
      setUploadingImg(false);
    }
  };

  const uploadAudio = async (file) => {
    setUploadingAud(true);
    try {
      const up = await uploadToCloudinary(file, "audio");
      const url = (up && (up.secure_url || up.url)) || String(up || "");
      setAudURL(url);
      setAudEnabled(true);
    } catch (e) {
      alert("No se pudo subir el audio");
    } finally {
      setUploadingAud(false);
    }
  };

  // ---- save ----
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
        // títulos (compat obra/titulo)
        titulo: toStr(form.titulo),
        obra: toStr(form.titulo),
        enunciado: toStr(form.enunciado),
        tipo: toStr(form.tipo), // ya no determina los medios
        // respuestas
        respuestaCorrecta: respuestasCorrectas.length ? toStr(respuestasCorrectas[0]) : singleStr,
        respuestasCorrectas,
        // medios (independientes)
        imageURL: imgEnabled && toStr(imgURL).trim() ? toStr(imgURL).trim() : null,
        audioURL: audEnabled && toStr(audURL).trim() ? toStr(audURL).trim() : null,
        // limpiamos mediaURL legado para que no interfiera
        mediaURL: null,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "consignas", item.id), payload);
      onSaved?.(payload);
      onClose();
    } catch (e2) {
      console.error(e2);
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

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
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
            <small style={{opacity:.7}}>
              El tipo ya no limita los medios: podés tener texto + imagen y/o audio.
            </small>
          </div>

          {/* === IMAGEN === */}
          <fieldset style={{ border: "1px dashed #ddd", borderRadius: 8, padding: 12, marginTop: 8 }}>
            <legend>Imagen</legend>
            <label>
              <input
                type="checkbox"
                checked={imgEnabled}
                onChange={(e) => setImgEnabled(e.target.checked)}
              />{" "}
              Habilitar imagen
            </label>

            {imgEnabled && (
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                <input
                  placeholder="https://.../imagen.jpg"
                  value={toStr(imgURL)}
                  onChange={(e) => setImgURL(e.target.value)}
                />
                <div>
                  <small>o subir archivo</small><br />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
                  />
                  {uploadingImg && <span> Subiendo imagen…</span>}
                </div>
              </div>
            )}
          </fieldset>

          {/* === AUDIO === */}
          <fieldset style={{ border: "1px dashed #ddd", borderRadius: 8, padding: 12, marginTop: 8 }}>
            <legend>Audio</legend>
            <label>
              <input
                type="checkbox"
                checked={audEnabled}
                onChange={(e) => setAudEnabled(e.target.checked)}
              />{" "}
              Habilitar audio
            </label>

            {audEnabled && (
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                <input
                  placeholder="https://.../archivo.mp3"
                  value={toStr(audURL)}
                  onChange={(e) => setAudURL(e.target.value)}
                />
                <div>
                  <small>o subir archivo</small><br />
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => e.target.files?.[0] && uploadAudio(e.target.files[0])}
                  />
                  {uploadingAud && <span> Subiendo audio…</span>}
                </div>
              </div>
            )}
          </fieldset>

          {/* === RESPUESTAS === */}
          <label className="inputEdit" style={{ marginTop: 8 }}>
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

          <div className="btnConfirmar" style={{ marginTop: 12 }}>
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
