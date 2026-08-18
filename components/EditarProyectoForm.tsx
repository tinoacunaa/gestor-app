"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { soloFecha } from "@/lib/fecha";
import SelectorVisibilidad from "@/components/SelectorVisibilidad";

type Proyecto = {
  id: string;
  nombre: string;
  tipo: string | null;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  estado: string;
  visibilidad?: string;
};

export default function EditarProyectoForm({ proyecto }: { proyecto: Proyecto }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombre: proyecto.nombre,
    tipo: proyecto.tipo || "",
    fechaInicio: format(soloFecha(proyecto.fechaInicio), "yyyy-MM-dd"),
    fechaFin: format(soloFecha(proyecto.fechaFin), "yyyy-MM-dd"),
    estado: proyecto.estado,
  });
  const [visibilidad, setVisibilidad] = useState<"PRIVADO" | "EMPRESA">(
    (proyecto.visibilidad as "EMPRESA") || "PRIVADO"
  );

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/proyectos/${proyecto.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, visibilidad }),
    });
    setEditando(false);
    router.refresh();
  }

  async function eliminar() {
    if (!confirm("¿Eliminar este proyecto? Se borrarán también sus actividades.")) return;
    await fetch(`/api/proyectos/${proyecto.id}`, { method: "DELETE" });
    router.push("/proyectos");
  }

  if (!editando) {
    return (
      <div className="flex gap-2 mb-4">
        <button onClick={() => setEditando(true)} className="text-xs border border-noche-100 rounded-full px-3 py-1 text-noche-400">
          Editar proyecto
        </button>
        <button onClick={eliminar} className="text-xs border border-arcilla-400 text-arcilla-400 rounded-full px-3 py-1">
          Eliminar proyecto
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={guardar} className="bg-white border border-noche-100 rounded-xl p-3 space-y-3 mb-4">
      <input
        required
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      />
      <input
        placeholder="Tipo (opcional)"
        value={form.tipo}
        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          required
          value={form.fechaInicio}
          onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
          className="border border-noche-100 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="date"
          required
          value={form.fechaFin}
          onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
          className="border border-noche-100 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <select
        value={form.estado}
        onChange={(e) => setForm({ ...form, estado: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      >
        <option value="ACTIVO">Activo</option>
        <option value="PAUSADO">Pausado</option>
        <option value="COMPLETADO">Completado</option>
        <option value="CANCELADO">Cancelado</option>
      </select>
      <SelectorVisibilidad value={visibilidad} onChange={setVisibilidad} />
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
