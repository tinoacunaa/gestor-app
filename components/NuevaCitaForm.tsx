"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevaCitaForm() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState({ titulo: "", fecha: "", hora: "", lugar: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ titulo: "", fecha: "", hora: "", lugar: "" });
    setAbierto(false);
    router.refresh();
  }

  if (!abierto)
    return (
      <button
        onClick={() => setAbierto(true)}
        className="w-full text-sm border border-dashed border-noche-100 rounded-lg py-2.5 text-noche-400"
      >
        + Agregar cita
      </button>
    );

  return (
    <form onSubmit={onSubmit} className="bg-white border border-noche-100 rounded-xl p-3 space-y-3">
      <input
        required
        placeholder="Título"
        value={form.titulo}
        onChange={(e) => setForm({ ...form, titulo: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          required
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          className="border border-noche-100 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="time"
          value={form.hora}
          onChange={(e) => setForm({ ...form, hora: e.target.value })}
          className="border border-noche-100 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <input
        placeholder="Lugar (opcional)"
        value={form.lugar}
        onChange={(e) => setForm({ ...form, lugar: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      />
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
