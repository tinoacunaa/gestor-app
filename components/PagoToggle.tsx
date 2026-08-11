"use client";

import { useState } from "react";

export default function PagoToggle({ pagoId, estadoInicial }: { pagoId: string; estadoInicial: string }) {
  const [estado, setEstado] = useState(estadoInicial);
  const pagado = estado === "PAGADO";

  async function alternar() {
    const nuevo = pagado ? "PENDIENTE" : "PAGADO";
    setEstado(nuevo);
    await fetch(`/api/pagos/${pagoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevo }),
    });
  }

  return (
    <button
      onClick={alternar}
      className={`text-xs rounded-full px-3 py-1 border ${
        pagado ? "bg-salvia-50 border-salvia-400 text-salvia-700" : "border-noche-100 text-noche-400"
      }`}
    >
      {pagado ? "Pagado" : "Marcar pagado"}
    </button>
  );
}
