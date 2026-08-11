"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Pago = {
  id: string;
  concepto: string;
  monto: number | null;
  fechaVencimiento: Date | string;
  periodicidad: string;
  estado: string;
};

export default function PagoItem({ pago }: { pago: Pago }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    concepto: pago.concepto,
    monto: pago.monto?.toString() || "",
    fechaVencimiento: format(new Date(pago.fechaVencimiento), "yyyy-MM-dd"),
    periodicidad: pago.periodicidad,
  });

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/pagos/${pago.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditando(false);
    router.refresh();
  }

  async function alternarPagado() {
    const nuevo = pago.estado === "PAGADO" ? "PENDIENTE" : "PAGADO";
    await fetch(`/api/pagos/${pago.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevo }),
    });
    router.refresh();
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar el pago "${pago.concepto}"?`)) return;
    await fetch(`/api/pagos/${pago.id}`, { method: "DELETE" });
    router.refresh();
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="bg-white border border-noche-100 rounded-xl p-3 space-y-3">
        <input
          required
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
          <button type="button" onClick={() => setEditando(false)} className="flex-1 border border-noche-100 rounded-lg py-2 text-sm">
            Cancelar
          </button>
          <button type="submit" className="flex-1 bg-noche-900 text-white rounded-lg py-2 text-sm">
            Guardar
          </button>
        </div>
      </form>
    );
  }

  const pagado = pago.estado === "PAGADO";

  return (
    <div className="bg-white border border-noche-100 rounded-xl p-3 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{pago.concepto}</p>
        <p className="text-xs text-noche-400">
          {format(new Date(pago.fechaVencimiento), "d MMM yyyy", { locale: es })} {pago.monto ? `· S/ ${pago.monto}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={alternarPagado}
          className={`text-xs rounded-full px-3 py-1 border ${
            pagado ? "bg-salvia-50 border-salvia-400 text-salvia-700" : "border-noche-100 text-noche-400"
          }`}
        >
          {pagado ? "Pagado" : "Marcar pagado"}
        </button>
        <button onClick={() => setEditando(true)} className="text-xs text-noche-400">
          Editar
        </button>
        <button onClick={eliminar} className="text-xs text-arcilla-400">
          Eliminar
        </button>
      </div>
    </div>
  );
}
