import React from "react";
import { useState } from "react";

const ADMIN_PWD = process.env.REACT_APP_ADMIN_PWD;

export default function Admin() {
  const [input, setInput] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (input === ADMIN_PWD) {
      setAuthorized(true);
      localStorage.setItem("admin", "1"); 
    } else {
      alert("Clave incorrecta 😅");
    }
  };

  if (!authorized && localStorage.getItem("admin") !== "1") {
    return (
      <form onSubmit={handleLogin}>
        <h2>Acceso administrador</h2>
        <input
          type="password"
          placeholder="Ingresá la clave"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
    );
  }

  return (
    <div>
      <h1>Panel de consignas</h1>
    </div>
  );
}