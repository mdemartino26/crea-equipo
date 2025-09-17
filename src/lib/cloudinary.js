const C_NAME  = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const C_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

// Sube imagen o audio (audio usa video/upload)
export async function uploadToCloudinary(file, tipo = "imagen") {
  if (!C_NAME || !C_PRESET) throw new Error("Faltan envs de Cloudinary");
  const endpoint =
    tipo === "audio" || tipo === "video"
      ? `https://api.cloudinary.com/v1_1/${C_NAME}/video/upload`
      : `https://api.cloudinary.com/v1_1/${C_NAME}/image/upload`;

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", C_PRESET);
  fd.append("folder", "consignas");

  const res = await fetch(endpoint, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  // Podés guardar también public_id si luego querés usar el SDK
  return { url: json.secure_url, publicId: json.public_id, resourceType: json.resource_type };
}

// Inserta transformaciones en la URL (si es de Cloudinary)
export function cldUrl(url, params = "f_auto,q_auto") {
  if (!url || typeof url !== "string") return url;
  const marker = "/upload/";
  const i = url.indexOf(marker);
  if (i === -1) return url;
  return url.slice(0, i + marker.length) + params + "/" + url.slice(i + marker.length);
}
