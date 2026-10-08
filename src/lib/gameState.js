import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// El estado "juego encendido/apagado" vive en Firestore para que lo vean
// todos los dispositivos (antes estaba en localStorage, que es por navegador).
const gameRef = () => doc(db, "config", "game");

export function setGameOn(on) {
  return setDoc(gameRef(), { on: Boolean(on), updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Devuelve { on, ready }.
 * - ready=false mientras no llegó la primera respuesta del servidor.
 * - Si el documento no existe o hay error, on=false.
 */
export function useGameOn() {
  const [state, setState] = useState({ on: false, ready: false });

  useEffect(() => {
    const unsub = onSnapshot(
      gameRef(),
      (snap) => setState({ on: snap.exists() ? Boolean(snap.data().on) : false, ready: true }),
      (err) => {
        console.error("useGameOn:", err);
        setState({ on: false, ready: true });
      }
    );
    return () => unsub();
  }, []);

  return state;
}
