// src/pages/Admin/components/ConsignaForm.jsx
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import "./styles.css";

// Cloudinary (envs)
const C_NAME = (process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "").trim();
const C_PRESET = (process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "").trim();

async function uploadToCloudinary(file, kind /* 'image'|'audio' */) {
  if (!C_NAME || !C_PRESET) {
    throw new Error("Faltan envs de Cloudinary (cloud name/preset).");
  }
  const endpoint =
    kind === "audio"
      ? `https://api.cloudinary.com/v1_1/${C_NAME}/video/upload`
      : `https://api.cloudinary.com/v1_1/${C_NAME}/image/upload`;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", C_PRESET);
  fd.append("folder", "consignas");
  const res = await fetch(endpoint, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.secure_url;
}

// util chiquita: transforma textarea en array (split por líneas o por "|")
function parseMulti(text = "") {
  return text
    .split(/\r?\n|\|/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ConsignaForm({ isOpen, defaultOrden = 10 }) {
  const [form, setForm] = useState({
    obra: "",
    enunciado: "",
    tipo: "texto",        // 'texto' | 'ruleta' | 'confirmar' (etc.)
    respuestaCorrecta: "",
    orden: defaultOrden,
  });

  // NUEVO: campo de texto para múltiples respuestas
  const [respuestasCorrectasText, setRespuestasCorrectasText] = useState("");

  // NUEVO: bandera para omitir respuesta en la consigna
  const [requiereRespuesta, setRequiereRespuesta] = useState(true);

  // Imagen
  const [imgEnabled, setImgEnabled] = useState(false);
  const [imgMode, setImgMode] = useState("url"); // 'url' | 'file'
  const [imgURL, setImgURL] = useState("");
  const [imgFile, setImgFile] = useState(null);

  // Audio
  const [audEnabled, setAudEnabled] = useState(false);
  const [audMode, setAudMode] = useState("url"); // 'url' | 'file'
  const [audURL, setAudURL] = useState("");
  const [audFile, setAudFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // validación mínima
  const validate = () => {
    if (!form.obra.trim()) return "Falta el título.";
    if (!form.enunciado.trim()) return "Falta el enunciado.";

    const esTipoSinRespuesta = form.tipo === "ruleta" || form.tipo === "confirmar";
    const debePedirRespuesta = requiereRespuesta && !esTipoSinRespuesta;

    const arr = parseMulti(respuestasCorrectasText);
    const tieneArray = arr.length > 0;
    const tieneSingle = !!form.respuestaCorrecta.trim();

    if (debePedirRespuesta && !tieneArray && !tieneSingle) {
      return "Falta la respuesta correcta (completá al menos una).";
    }

    const o = Number(form.orden);
    if (!Number.isFinite(o) || o <= 0) return "El orden debe ser un número > 0.";

    if (imgEnabled && imgMode === "url" && !imgURL.trim()) return "Falta URL de imagen.";
    if (audEnabled && audMode === "url" && !audURL.trim()) return "Falta URL de audio.";
    if (imgEnabled && imgMode === "file" && !imgFile) return "Falta archivo de imagen.";
    if (audEnabled && audMode === "file" && !audFile) return "Falta archivo de audio.";

    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    try {
      setSaving(true);

      let finalImage = null;
      let finalAudio = null;

      if (imgEnabled) {
        if (imgMode === "url") finalImage = imgURL.trim();
        else if (imgFile) {
          setUploading(true);
          finalImage = await uploadToCloudinary(imgFile, "image");
          setUploading(false);
        }
      }

      if (audEnabled) {
        if (audMode === "url") finalAudio = audURL.trim();
        else if (audFile) {
          setUploading(true);
          finalAudio = await uploadToCloudinary(audFile, "audio");
          setUploading(false);
        }
      }

      const esTipoSinRespuesta = form.tipo === "ruleta" || form.tipo === "confirmar";
      const requiere = esTipoSinRespuesta ? false : Boolean(requiereRespuesta);

      // construir array desde textarea + single de respaldo
      const arr = parseMulti(respuestasCorrectasText);
      const single = form.respuestaCorrecta.trim();
      const respuestasCorrectas = Array.from(
        new Set([...(arr || []), ...(single ? [single] : [])])
      );

      const payload = {
        obra: form.obra.trim(),
        enunciado: form.enunciado.trim(),
        tipo: form.tipo, // 'texto' | 'ruleta' | 'confirmar'
        requiereRespuesta: requiere,
        // Compatibilidad: dejamos respuestaCorrecta como primera variante (si existe)
        respuestaCorrecta: requiere && respuestasCorrectas.length ? respuestasCorrectas[0] : "",
        // Nuevo array:
        respuestasCorrectas: requiere && respuestasCorrectas.length ? respuestasCorrectas : [],
        // Medios opcionales
        imageURL: finalImage || null,
        audioURL: finalAudio || null,
        // Compat con consignas viejas:
        mediaURL: null,
        visible: true,
        orden: Number(form.orden) || defaultOrden,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "consignas"), payload);

      // reset
      setForm({
        obra: "",
        enunciado: "",
        tipo: "texto",
        respuestaCorrecta: "",
        orden: (Number(form.orden) || defaultOrden) + 10,
      });
      setRespuestasCorrectasText("");
      setRequiereRespuesta(true);
      setImgEnabled(false);
      setImgURL("");
      setImgFile(null);
      setAudEnabled(false);
      setAudURL("");
      setAudFile(null);

      alert("¡Consigna creada!");
    } catch (e2) {
      console.error(e2);
      alert("No se pudo crear la consigna:\n" + (e2?.message || String(e2)));
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <div className={`collapsible ${isOpen ? "is-open" : ""}`}>
      {isOpen && (
        <form onSubmit={onSubmit} className="formConsigna">
          <input
            placeholder="Título *"
            value={form.obra}
            onChange={(e) => setForm((f) => ({ ...f, obra: e.target.value }))}
          />
          <textarea
            placeholder="Enunciado / consigna *"
            value={form.enunciado}
            onChange={(e) => setForm((f) => ({ ...f, enunciado: e.target.value }))}
          />

          <div className="opciones" style={{ alignItems: "center" }}>
            <label>
              Tipo:&nbsp;
              <select
                value={form.tipo}
                onChange={(e) => {
                  const nuevo = e.target.value;
                  setForm((f) => ({ ...f, tipo: nuevo }));
                  if (nuevo === "ruleta" || nuevo === "confirmar") {
                    setRequiereRespuesta(false);
                  }
                }}
              >
                <option value="texto">Texto</option>
                <option value="ruleta">Ruleta</option>
                <option value="confirmar">Confirmar (solo continuar)</option>
              </select>
            </label>

            <label>
              Orden:&nbsp;
              <input
                type="number"
                min={1}
                value={form.orden}
                onChange={(e) => setForm((f) => ({ ...f, orden: e.target.value }))}
                className="orden"
              />
            </label>

            <label title="Desmarcá si esta consigna no tiene respuesta (solo confirmar)">
              <input
                type="checkbox"
                checked={requiereRespuesta}
                disabled={form.tipo === "ruleta" || form.tipo === "confirmar"}
                onChange={(e) => setRequiereRespuesta(e.target.checked)}
              />{" "}
              Requiere respuesta
            </label>
          </div>

          {/* Respuestas múltiples + single compat */}
          {requiereRespuesta && form.tipo !== "ruleta" && form.tipo !== "confirmar" && (
            <>
              <textarea
                placeholder={"Respuestas correctas (una por línea o separadas por |)\nEj: 29\nveintinueve"}
                rows={3}
                value={respuestasCorrectasText}
                onChange={(e) => setRespuestasCorrectasText(e.target.value)}
              />
              <input
                placeholder="Respuesta correcta (compatibilidad, opcional si arriba ya pusiste)"
                value={form.respuestaCorrecta}
                onChange={(e) =>
                  setForm((f) => ({ ...f, respuestaCorrecta: e.target.value }))
                }
              />
            </>
          )}

          {/* IMAGEN */}
          <fieldset style={{ border: "1px dashed #ddd", borderRadius: 8, padding: 12 }}>
            <legend>Imagen (opcional)</legend>
            <label>
              <input
                type="checkbox"
                checked={imgEnabled}
                onChange={(e) => setImgEnabled(e.target.checked)}
              />{" "}
              Adjuntar imagen
            </label>

            {imgEnabled && (
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                <label>
                  <input
                    type="radio"
                    name="imgMode"
                    value="url"
                    checked={imgMode === "url"}
                    onChange={() => setImgMode("url")}
                  />{" "}
                  URL externa
                </label>
                {imgMode === "url" && (
                  <input
                    placeholder="https://.../imagen.jpg"
                    value={imgURL}
                    onChange={(e) => setImgURL(e.target.value)}
                  />
                )}

                <label>
                  <input
                    type="radio"
                    name="imgMode"
                    value="file"
                    checked={imgMode === "file"}
                    onChange={() => setImgMode("file")}
                  />{" "}
                  Subir a Cloudinary
                </label>
                {imgMode === "file" && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImgFile(e.target.files?.[0] || null)}
                  />
                )}
              </div>
            )}
          </fieldset>

          {/* AUDIO */}
          <fieldset style={{ border: "1px dashed #ddd", borderRadius: 8, padding: 12 }}>
            <legend>Audio (opcional)</legend>
            <label>
              <input
                type="checkbox"
                checked={audEnabled}
                onChange={(e) => setAudEnabled(e.target.checked)}
              />{" "}
              Adjuntar audio
            </label>

            {audEnabled && (
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                <label>
                  <input
                    type="radio"
                    name="audMode"
                    value="url"
                    checked={audMode === "url"}
                    onChange={() => setAudMode("url")}
                  />{" "}
                  URL externa
                </label>
                {audMode === "url" && (
                  <input
                    placeholder="https://.../archivo.mp3"
                    value={audURL}
                    onChange={(e) => setAudURL(e.target.value)}
                  />
                )}

                <label>
                  <input
                    type="radio"
                    name="audMode"
                    value="file"
                    checked={audMode === "file"}
                    onChange={() => setAudMode("file")}
                  />{" "}
                  Subir a Cloudinary
                </label>
                {audMode === "file" && (
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudFile(e.target.files?.[0] || null)}
                  />
                )}
              </div>
            )}
          </fieldset>

          <button type="submit" disabled={saving || uploading}>
            {saving || uploading ? "Guardando..." : "Crear consigna"}
          </button>

          <small style={{ opacity: 0.6 }}>
            Cloudinary envs: cloud={String(!!C_NAME)} preset={String(!!C_PRESET)}
          </small>
        </form>
      )}
    </div>
  );
}
