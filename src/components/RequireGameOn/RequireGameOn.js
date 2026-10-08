import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGameOn } from "../../lib/gameState";

// Nota: la versión que usa la app está en src/App.js. Esta copia queda
// alineada con ella (estado en Firestore, no en localStorage).
export default function RequireGameOn({ children }) {
  const navigate = useNavigate();
  const { on, ready } = useGameOn();

  useEffect(() => {
    if (ready && !on) {
      localStorage.removeItem("lastGamePage");
      navigate("/", { replace: true });
    }
  }, [on, ready, navigate]);

  return children;
}
