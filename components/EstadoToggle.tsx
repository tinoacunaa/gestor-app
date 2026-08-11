"use client";

import { useState, useTransition } from "react";

type Estado = "PENDIENTE" | "PROCESO" | "COMPLETADO";

const SIGUIENTE: Record<Estado, Estado> = {
  PENDIENTE: "PROCESO",
  PROCESO: "COMPLETADO",
  COMPLETADO: "PENDIENTE",
};

/**
 * Un tap avanza el estado. Optimista: cambia visualmente al instante
 * y confirma con el servidor en segundo plano — así el registro se
 * siente inmediato incluso con mala señal desde el celular.
 */
export default function EstadoToggle({
  ocurrenciaId,
  estadoInicial,
  bloqueada = false,
  onChange,
}: {
  ocurrenciaId: string;
  estadoInicial: Estado;
  bloqueada?: boolean;
  onChange?: (nuevo: Estado) => void;
}) {
  const [estado, setEstado] = useState<Estado>(estadoInicial);
  const [, startTransition] = useTransition();

  async function avanzar() {
    if (bloqueada) return;
    const nuevo = SIGUIENTE[estado];
    setEstado(nuevo);
    onChange?.(nuevo);
    startTransition(async () => {
      await fetch(`/api/ocurrencias/${ocurrenciaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevo }),
      });
    });
  }

  return (
    <button
      type="button"
      onClick={avanzar}
      disabled={bloqueada}
      aria-label={`Estado: ${estado}`}
      className="estado-dot disabled:opacity-50"
      data-estado={estado}
    >
      {estado === "COMPLETADO" && <span className="text-white text-xs">✓</span>}
    </button>
  );
}
