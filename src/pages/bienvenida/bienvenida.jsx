import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../components/header/header";
import { db } from "../../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import './styles.css';

export default function Bienvenida() {
  const navigate = useNavigate();

  const comenzar = async () => {
    try {
      // Trae todas ordenadas por `orden`
      const snap = await getDocs(
        query(collection(db, "consignas"), orderBy("orden", "asc"))
      );
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Toma la primera visible
      const first = arr.find(x => x.visible);
      if (!first) {
        alert("No hay consignas visibles");
        return;
      }
      // Guarda y navega
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
      <h2>Team building + museo + gamificación</h2>

     
      <button className="buttonPpal" onClick={comenzar}>Comenzar</button>

      <div style={{ marginTop: 12 }}>
        <Link to="/reglas">
          <button className="buttonPpal">Ver reglas</button>
        </Link>
      </div>
    </div>
  );
}
