"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EliminarProyectoBoton({ proyectoId }: { proyectoId: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);

  async function eliminar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmando) {
      setConfirmando(true);
      return;
    }
    await fetch(`/api/proyectos/${proyectoId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={eliminar}
      onBlur={() => setConfirmando(false)}
      className={`text-xs rounded-full px-2.5 py-1 ${
        confirmando ? "bg-arcilla-400 text-white" : "text-noche-400 hover:text-arcilla-400"
      }`}
    >
      {confirmando ? "¿Seguro? Toca de nuevo" : "Eliminar"}
    </button>
  );
}
