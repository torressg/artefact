"use client";

import { useEffect } from "react";

export type AvisoState = { tipo: "sucesso" | "erro"; texto: string };

export function Aviso({ aviso, onFechar }: { aviso: AvisoState; onFechar: () => void }) {
  useEffect(() => {
    if (aviso.tipo !== "sucesso") return;
    const timer = setTimeout(onFechar, 4000);
    return () => clearTimeout(timer);
  }, [aviso, onFechar]);

  return (
    <div className={`aviso ${aviso.tipo}`} role={aviso.tipo === "erro" ? "alert" : "status"}>
      <span>{aviso.texto}</span>
      <button type="button" onClick={onFechar} aria-label="Fechar aviso">
        ×
      </button>
    </div>
  );
}
