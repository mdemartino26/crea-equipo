import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/header";
import { db } from "../../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useGameOn } from "../../lib/gameState";
import "./styles.css";

export default function Bienvenida() {
  const navigate = useNavigate();

  // Estado compartido (Firestore): se actualiza solo en todos los dispositivos
  const { on: activo, ready } = useGameOn();

  // si está apagado, limpiá el lastGamePage
  useEffect(() => {
    if (ready && !activo) localStorage.removeItem("lastGamePage");
  }, [activo, ready]);

  const comenzar = async () => {
    try {
      const snap = await getDocs(
        query(collection(db, "consignas"), orderBy("orden", "asc"))
      );
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const first = arr.find((x) => x.visible);
      if (!first) {
        alert("No hay consignas visibles");
        return;
      }
      const path = `/actividad/${first.id}`;
      localStorage.setItem("lastGamePage", path);
      navigate(path);
    } catch (e) {
      console.error("Error al iniciar juego:", e);
      alert("No se pudo cargar la primera consigna");
    }
  };

  return (
    <div className="bienvenida-background overf bienvenidaCenter">
      <Header />

      {/* Si juego APAGADO (o todavía cargando) → solo el aviso */}
      {!activo && (
        <p className="desactivado" style={{ fontSize: "1.2em", opacity: 0.8 }}>
          El juego comenzará en breve
        </p>
      )}

      {/* Si juego ENCENDIDO → solo el botón */}
      {activo && (
        <button className="buttonPpal titila" onClick={comenzar}>
          COMENZAR
        </button>
      )}
    </div>
  );
}
