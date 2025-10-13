import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RequireGameOn({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => {
      const on = JSON.parse(localStorage.getItem("gameOn") ?? "false");
      if (!on) {

        localStorage.removeItem("lastGamePage");

        navigate("/", { replace: true });
      }
    };

    // chequeo inmediato al montar
    check();

    // escucha cambios desde el admin:
    window.addEventListener("gameon:change", check); // mismo tab
    window.addEventListener("storage", check);       // otras pestañas
    return () => {
      window.removeEventListener("gameon:change", check);
      window.removeEventListener("storage", check);
    };
  }, [navigate]);

  return children;
}
