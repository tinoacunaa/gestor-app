"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevaActividadForm({
  proyectoId,
  actividadesExistentes,
}: {
  proyectoId: string;
  actividadesExistentes: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    periodicidad: "UNICA",
    fechaInicio: "",
    fechaFin: "",
    hora: "",
    tipoSeguimiento: "ESTADO",
    predecesoraId: "",
  });
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    await fetch("/api/actividades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, proyectoId, predecesoraId: form.predecesoraId || null }),
    });
    setEnviando(false);
    setAbierto(false);
    setForm({ nombre: "", periodicidad: "UNICA", fechaInicio: "", fechaFin: "", hora: "", tipoSeguimiento: "ESTADO", predecesoraId: "" });
    router.refresh();
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="w-full text-sm border border-dashed border-noche-100 rounded-lg py-2.5 text-noche-400"
      >
        + Agregar actividad
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-noche-100 rounded-xl p-3 space-y-3">
      <input
        required
        placeholder="Nombre de la actividad"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={form.periodicidad}
          onChange={(e) => setForm({ ...form, periodicidad: e.target.value })}
          className="border border-noche-100 rounded-lg px-3 py-2 text-sm"
        >
          <option value="UNICA">Única</option>
          <option value="SEMANAL">Semanal</option>
          <option value="QUINCENAL">Quincenal</option>
          <option value="MENSUAL">Mensual</option>
        </select>
        <select
          value={form.tipoSeguimiento}
          onChange={(e) => setForm({ ...form, tipoSeguimiento: e.target.value })}
          className="border border-noche-100 rounded-lg px-3 py-2 text-sm"
        >
          <option value="ESTADO">Check (pendiente/proceso/hecho)</option>
          <option value="PORCENTAJE">Porcentaje %</option>
        </select>
      </div>
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
      <input
        type="time"
        value={form.hora}
        onChange={(e) => setForm({ ...form, hora: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      />
      {actividadesExistentes.length > 0 && (
        <select
          value={form.predecesoraId}
          onChange={(e) => setForm({ ...form, predecesoraId: e.target.value })}
          className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Depende de... (opcional)</option>
          {actividadesExistentes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nombre}
            </option>
          ))}
        </select>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="flex-1 border border-noche-100 rounded-lg py-2 text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 bg-noche-900 text-white rounded-lg py-2 text-sm disabled:opacity-50"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
