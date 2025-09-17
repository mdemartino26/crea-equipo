// src/pages/reglas/reglas.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Header2 from "../../components/header2/header2";
import Decor from "../../components/decor/decor";
import "./styles.css";

import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

const RESUME_KEY = "lastGamePage";

export default function Reglas() {
  const navigate = useNavigate();

  const irAPrimeraActividad = async () => {
    try {
      // 1) Intentar exactamente orden 10
      const q10 = query(
        collection(db, "consignas"),
        where("orden", "==", 10),
        limit(1)
      );
      const s10 = await getDocs(q10);

      let targetId = null;

      if (!s10.empty) {
        const d = s10.docs[0];
        const data = d.data();
        if (data.visible !== false) targetId = d.id; // si no está oculta
      }

      // 2) Si no hay, tomar la primera visible por orden
      if (!targetId) {
        const snap = await getDocs(
          query(collection(db, "consignas"), orderBy("orden", "asc"))
        );
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const first = arr.find((x) => x.visible);
        if (first) targetId = first.id;
      }

      if (!targetId) {
        alert("No hay consignas disponibles");
        return;
      }

      const path = `/actividad/${targetId}`;
      localStorage.setItem(RESUME_KEY, path);
      navigate(path);
    } catch (e) {
      console.error("Iniciar juego:", e);
      alert("No se pudo iniciar la actividad");
    }
  };

  return (
    <div className="overf reglas">
      <Header2 />
      <section className="contenido">
        <h1>Reglas</h1>
        <ul>
          <li>Lean bien las consignas</li>
          <li>Si se traban, pueden consultar</li>
          <li>Tienen que observar bien</li>
          <li>¡Diviértanse!</li>
        </ul>

        <button className="buttonPpal" onClick={irAPrimeraActividad}>
          Siguiente
        </button>
      </section>
      <Decor />
    </div>
  );
}
