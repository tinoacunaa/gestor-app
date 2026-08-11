"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoPagoForm() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState({ concepto: "", monto: "", fechaVencimiento: "", periodicidad: "UNICA" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ concepto: "", monto: "", fechaVencimiento: "", periodicidad: "UNICA" });
    setAbierto(false);
    router.refresh();
  }

  if (!abierto)
    return (
      <button
        onClick={() => setAbierto(true)}
        className="w-full text-sm border border-dashed border-noche-100 rounded-lg py-2.5 text-noche-400"
      >
        + Agregar pago
      </button>
    );

  return (
    <form onSubmit={onSubmit} className="bg-white border border-noche-100 rounded-xl p-3 space-y-3">
      <input
        required
        placeholder="Concepto"
        value={form.concepto}
        onChange={(e) => setForm({ ...form, concepto: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="0.01"
          placeholder="Monto S/"
          value={form.monto}
          onChange={(e) => setForm({ ...form, monto: e.target.value })}
          className="border border-noche-100 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="date"
          required
          value={form.fechaVencimiento}
          onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })}
          className="border border-noche-100 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <select
        value={form.periodicidad}
        onChange={(e) => setForm({ ...form, periodicidad: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      >
        <option value="UNICA">Única</option>
        <option value="MENSUAL">Mensual</option>
      </select>
      <div className="flex gap-2">
        <button type="button" onClick={() => setAbierto(false)} className="flex-1 border border-noche-100 rounded-lg py-2 text-sm">
          Cancelar
        </button>
        <button type="submit" className="flex-1 bg-noche-900 text-white rounded-lg py-2 text-sm">
          Guardar
        </button>
      </div>
    </form>
  );
}
