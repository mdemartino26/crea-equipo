import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

import Bienvenida from "./pages/bienvenida/bienvenida";
import Reglas from "./pages/reglas/reglas";
import Numero1 from "./pages/numero1/numero1";
import Numero2 from "./pages/numero2/numero2";
import Numero3 from "./pages/numero3/numero3";
import Numero5 from "./pages/numero5/numero5";
import Numero6 from "./pages/numero6/numero6";
import Numero7 from "./pages/numero7/numero7";
import Numero8 from "./pages/numero8/numero8";
import Numero9 from "./pages/numero9/numero9";
import Numero10 from "./pages/numero10/numero10";
import Numero11 from "./pages/numero11/numero11";
import Numero12 from "./pages/numero12/numero12";
import Numero14 from "./pages/numero14/numero14";
import Pitch from "./pages/pitch/pitch";
import Fin1 from "./pages/fin1/fin1";
import FinDeJuego from "./pages/finDeJuego/finDeJuego";

import Actividad from "./pages/Actividad/Actividad";
import Admin from "./pages/Admin/Admin";
import { useGameOn } from "./lib/gameState";

const RESUME_KEY = "lastGamePage";

/* ---------- Guard: si el juego está apagado → vuelve a "/" y limpia progreso ----------
   El estado viene de Firestore (config/game), así que funciona igual en
   cualquier dispositivo. Mientras no llega la primera respuesta (ready=false)
   no se redirige, para no sacar al jugador por error al recargar. */
function RequireGameOn({ children }) {
  const navigate = useNavigate();
  const { on, ready } = useGameOn();

  useEffect(() => {
    if (ready && !on) {
      localStorage.removeItem(RESUME_KEY);
      navigate("/", { replace: true });
    }
  }, [on, ready, navigate]);

  return children;
}
/* ------------------------------------------------------------------------------ */

function App() {
  return (
    <div className="App">
      <Router>
        <AppRoutes />
      </Router>
    </div>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { on, ready } = useGameOn();

  // Cuando el admin apaga el juego, cada dispositivo limpia su propio progreso
  // (antes lo hacía el admin, pero solo podía limpiar su propio navegador).
  useEffect(() => {
    if (ready && !on && pathname !== "/administrador") {
      localStorage.clear();
    }
  }, [on, ready, pathname]);

  // Al entrar a "/", reanudar SOLO si el juego está encendido
  useEffect(() => {
    if (!ready || pathname !== "/") return;
    if (on) {
      const saved = localStorage.getItem(RESUME_KEY);
      if (saved && saved !== "/") {
        navigate(saved, { replace: true });
      }
    } else {
      // si está apagado, aseguro limpiar cualquier rastro de progreso
      localStorage.removeItem(RESUME_KEY);
    }
  }, [pathname, navigate, on, ready]);

  // Guardar progreso SOLO en rutas del juego (no admin) y solo si está encendido
  useEffect(() => {
    const isGameRoute =
      pathname === "/reglas" ||
      pathname.startsWith("/actividad/") ||
      pathname.startsWith("/numero") ||
      pathname === "/pitch" ||
      pathname === "/fin1" ||
      pathname === "/findejuego";

    if (ready && on && isGameRoute) {
      localStorage.setItem(RESUME_KEY, pathname);
    }
  }, [pathname, on, ready]);

  return (
    <Routes>
      <Route path="/" element={<Bienvenida />} />

      {/* Rutas del juego protegidas por el guard */}
      <Route
        path="/reglas"
        element={
          <RequireGameOn>
            <Reglas />
          </RequireGameOn>
        }
      />
      <Route
        path="/actividad/:id"
        element={
          <RequireGameOn>
            <Actividad />
          </RequireGameOn>
        }
      />
      <Route
        path="/numero1"
        element={
          <RequireGameOn>
            <Numero1 />
          </RequireGameOn>
        }
      />
      <Route
        path="/numero2"
        element={
          <RequireGameOn>
            <Numero2 />
          </RequireGameOn>
        }
      />
      <Route
        path="/numero3"
        element={
          <RequireGameOn>
            <Numero3 />
          </RequireGameOn>
        }
      />
      <Route
        path="/numero5"
        element={
          <RequireGameOn>
            <Numero5 />
          </RequireGameOn>
        }
      />
      <Route
        path="/numero6"
        element={
          <RequireGameOn>
            <Numero6 />
          </RequireGameOn>
        }
      />
      <Route
        path="/numero7"
        element={
          <RequireGameOn>
            <Numero7 />
          </RequireGameOn>
        }
      />
      <Route
        path="/numero8"
        element={
          <RequireGameOn>
            <Numero8 />
          </RequireGameOn>
        }
      />
      <Route
        path="/numero9"
        element={
          <RequireGameOn>
            <Numero9 />
          </RequireGameOn>
        }
      />
      <Route
        path="/numero10"
        element={
          <RequireGameOn>
            <Numero10 />
          </RequireGameOn>
        }
      />
      <Route
        path="/numero11"
        element={
          <RequireGameOn>
            <Numero11 />
          </RequireGameOn>
        }
      />
      <Route
        path="/numero12"
        element={
          <RequireGameOn>
            <Numero12 />
          </RequireGameOn>
        }
      />
      <Route
        path="/numero14"
        element={
          <RequireGameOn>
            <Numero14 />
          </RequireGameOn>
        }
      />
      <Route
        path="/pitch"
        element={
          <RequireGameOn>
            <Pitch />
          </RequireGameOn>
        }
      />
      <Route
        path="/fin1"
        element={
          <RequireGameOn>
            <Fin1 />
          </RequireGameOn>
        }
      />
      <Route
        path="/findejuego"
        element={
          <RequireGameOn>
            <FinDeJuego />
          </RequireGameOn>
        }
      />

      {/* Admin sin guard */}
      <Route path="/administrador" element={<Admin />} />

      {/* fallback */}
      <Route path="*" element={<Bienvenida />} />
    </Routes>
  );
}

export default App;
