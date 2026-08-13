"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import EstadoToggle from "@/components/EstadoToggle";

type Ocurrencia = { id: string; fecha: Date | string; fechaFin?: Date | string | null; estado: string };
type Actividad = {
  id: string;
  nombre: string;
  periodicidad: string;
  fechaInicio: Date | string;
  fechaFin: Date | string;
  hora: string | null;
  tipoSeguimiento: string;
  predecesora: { id: string; nombre: string } | null;
  ocurrencias: Ocurrencia[];
};

export default function ActividadItem({
  actividad,
  actividadesExistentes,
}: {
  actividad: Actividad;
  actividadesExistentes: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombre: actividad.nombre,
    periodicidad: actividad.periodicidad,
    fechaInicio: format(new Date(actividad.fechaInicio), "yyyy-MM-dd"),
    fechaFin: format(new Date(actividad.fechaFin), "yyyy-MM-dd"),
    hora: actividad.hora || "",
    tipoSeguimiento: actividad.tipoSeguimiento,
    predecesoraId: actividad.predecesora?.id || "",
  });

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/actividades/${actividad.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, predecesoraId: form.predecesoraId || null }),
    });
    setEditando(false);
    router.refresh();
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar "${actividad.nombre}" y todas sus ocurrencias?`)) return;
    await fetch(`/api/actividades/${actividad.id}`, { method: "DELETE" });
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
        <div className="grid grid-cols-2 gap-2">
          <select
            value={form.periodicidad}
            onChange={(e) => setForm({ ...form, periodicidad: e.target.value })}
            className="border border-noche-100 rounded-lg px-3 py-2 text-sm"
          >
            <option value="UNICA">Única</option>
            <option value="QUINCENAL">Quincenal</option>
            <option value="MENSUAL">Mensual</option>
          </select>
          <select
            value={form.tipoSeguimiento}
            onChange={(e) => setForm({ ...form, tipoSeguimiento: e.target.value })}
            className="border border-noche-100 rounded-lg px-3 py-2 text-sm"
          >
            <option value="ESTADO">Check</option>
            <option value="PORCENTAJE">Porcentaje</option>
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
        {actividadesExistentes.filter((a) => a.id !== actividad.id).length > 0 && (
          <select
            value={form.predecesoraId}
            onChange={(e) => setForm({ ...form, predecesoraId: e.target.value })}
            className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Depende de... (opcional)</option>
            {actividadesExistentes
              .filter((a) => a.id !== actividad.id)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
          </select>
        )}
        <p className="text-xs text-noche-400">
          Si cambias las fechas o la periodicidad, las ocurrencias se vuelven a generar (se pierde el avance marcado en esta actividad).
        </p>
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
    <div className="bg-white border border-noche-100 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">{actividad.nombre}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-noche-400">{actividad.periodicidad.toLowerCase()}</span>
          <button onClick={() => setEditando(true)} className="text-xs text-noche-400">
            Editar
          </button>
          <button onClick={eliminar} className="text-xs text-arcilla-400">
            Eliminar
          </button>
        </div>
      </div>
      {actividad.predecesora && (
        <p className="text-xs text-noche-400 mb-2">Depende de: {actividad.predecesora.nombre}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {actividad.ocurrencias.map((o) => {
          const inicio = new Date(o.fecha);
          const fin = o.fechaFin ? new Date(o.fechaFin) : inicio;
          const mismoDia = format(inicio, "yyyy-MM-dd") === format(fin, "yyyy-MM-dd");
          return (
            <div key={o.id} className="flex items-center gap-1.5">
              <EstadoToggle ocurrenciaId={o.id} estadoInicial={o.estado as any} />
              <span className="text-[11px] text-noche-400">
                {mismoDia
                  ? format(inicio, "d MMM", { locale: es })
                  : `${format(inicio, "d MMM", { locale: es })} – ${format(fin, "d MMM", { locale: es })}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
