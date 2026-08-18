"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SelectorVisibilidad from "@/components/SelectorVisibilidad";

export default function NuevoProyectoPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: "", tipo: "", fechaInicio: "", fechaFin: "" });
  const [visibilidad, setVisibilidad] = useState<"PRIVADO" | "EMPRESA">("PRIVADO");
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const res = await fetch("/api/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, visibilidad }),
    });
    const proyecto = await res.json();
    router.push(`/proyectos/${proyecto.id}`);
  }

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="font-display text-2xl mb-6">Nuevo proyecto</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-noche-400 mb-1">Nombre</label>
          <input
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="w-full border border-noche-100 rounded-lg px-3 py-2"
            placeholder="Publicidad Julián"
          />
        </div>
        <div>
          <label className="block text-sm text-noche-400 mb-1">Tipo (opcional)</label>
          <input
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="w-full border border-noche-100 rounded-lg px-3 py-2"
            placeholder="Publicidad, Web, Trámite..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-noche-400 mb-1">Inicio</label>
            <input
              type="date"
              required
              value={form.fechaInicio}
              onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
              className="w-full border border-noche-100 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-noche-400 mb-1">Fin</label>
            <input
              type="date"
              required
              value={form.fechaFin}
              onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
              className="w-full border border-noche-100 rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <SelectorVisibilidad value={visibilidad} onChange={setVisibilidad} />
        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-noche-900 text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
        >
          Crear proyecto
        </button>
      </form>
    </div>
  );
}
