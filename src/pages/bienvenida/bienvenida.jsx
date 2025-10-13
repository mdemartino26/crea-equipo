import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header/header";
import { db } from "../../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import "./styles.css";

export default function Bienvenida() {
  const navigate = useNavigate();
  const STORAGE_KEY = "gameOn";


  const [activo, setActivo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "false");
    } catch {
      return false;
    }
  });


  useEffect(() => {
    const sync = () => {
      try {
        setActivo(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "false"));
      } catch {
        setActivo(false);
      }
    };
    window.addEventListener("storage", sync);        
    window.addEventListener("gameon:change", sync); 
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("gameon:change", sync);
    };
  }, []);

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
    <div className="bienvenida-background bienvenidaCenter">
      <Header />


      {!activo && (
        <p className="desactivado" style={{ fontSize: "1.2em", opacity: 0.8 }}>
          El juego comenzará en breve
        </p>
      )}


      {activo && (
        <button className="buttonPpal titila" onClick={comenzar}>
          COMENZAR
        </button>
      )}
    </div>
  );
}
