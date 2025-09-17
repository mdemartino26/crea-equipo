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

const RESUME_KEY = "lastGamePage"; // <— nueva key solo para el juego

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

  // Al entrar a "/", si hay progreso del juego, lo retomamos
  useEffect(() => {
    if (pathname === "/") {
      const saved = localStorage.getItem(RESUME_KEY);
      if (saved && saved !== "/") {
        navigate(saved, { replace: true });
      }
    }
  }, [pathname, navigate]);

  // Guardamos progreso SOLO en rutas del juego (no admin)
  useEffect(() => {
    const isGameRoute =
      pathname === "/reglas" || pathname.startsWith("/actividad/");
    if (isGameRoute) {
      localStorage.setItem(RESUME_KEY, pathname);
    }
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Bienvenida />} />
      <Route path="/reglas" element={<Reglas />} />
      <Route path="/numero1" element={<Numero1 />} />
      <Route path="/numero2" element={<Numero2 />} />
      <Route path="/numero3" element={<Numero3 />} />
      <Route path="/numero5" element={<Numero5 />} />
      <Route path="/numero6" element={<Numero6 />} />
      <Route path="/numero7" element={<Numero7 />} />
      <Route path="/numero8" element={<Numero8 />} />
      <Route path="/numero9" element={<Numero9 />} />
      <Route path="/numero10" element={<Numero10 />} />
      <Route path="/numero11" element={<Numero11 />} />
      <Route path="/numero12" element={<Numero12 />} />
      <Route path="/numero14" element={<Numero14 />} />
      <Route path="/pitch" element={<Pitch />} />
      <Route path="/actividad/:id" element={<Actividad />} />
      <Route path="/administrador" element={<Admin />} />
      <Route path="/fin1" element={<Fin1 />} />
      <Route path="/findejuego" element={<FinDeJuego />} />
      <Route path="*" element={<Bienvenida />} />
    </Routes>
  );
}

export default App;
