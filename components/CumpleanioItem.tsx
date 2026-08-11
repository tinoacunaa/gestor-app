"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Cumpleanio = { id: string; nombre: string; fecha: Date | string; notas: string | null };

export default function CumpleanioItem({ cumpleanio }: { cumpleanio: Cumpleanio }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombre: cumpleanio.nombre,
    fecha: format(new Date(cumpleanio.fecha), "yyyy-MM-dd"),
    notas: cumpleanio.notas || "",
  });

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/cumpleanos/${cumpleanio.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditando(false);
    router.refresh();
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar a "${cumpleanio.nombre}"?`)) return;
    await fetch(`/api/cumpleanos/${cumpleanio.id}`, { method: "DELETE" });
    router.refresh();
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="bg-white border border-noche-100 rounded-xl p-3 space-y-3">
        <input
          required
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="date"
          required
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
        />
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

  return (
    <div className="bg-white border border-noche-100 rounded-xl p-3 flex items-center justify-between">
      <span className="text-sm">{cumpleanio.nombre}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-noche-400">{format(new Date(cumpleanio.fecha), "d 'de' MMMM", { locale: es })}</span>
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
