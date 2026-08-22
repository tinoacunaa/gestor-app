"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { soloFecha } from "@/lib/fecha";
import SelectorVisibilidad from "@/components/SelectorVisibilidad";

type Cita = {
  visibilidad?: string;
  id: string;
  titulo: string;
  fecha: Date | string;
  hora: string | null;
  lugar: string | null;
  periodicidad?: string;
};

const ETIQUETA_PERIODICIDAD: Record<string, string> = {
  UNICA: "No se repite",
  SEMANAL: "Cada semana",
  QUINCENAL: "Cada quincena",
  MENSUAL: "Cada mes",
  ANUAL: "Cada año",
};

export default function CitaItem({ cita }: { cita: Cita }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    titulo: cita.titulo,
    fecha: format(soloFecha(cita.fecha), "yyyy-MM-dd"),
    hora: cita.hora || "",
    lugar: cita.lugar || "",
    periodicidad: cita.periodicidad || "UNICA",
  });
  const [visibilidad, setVisibilidad] = useState<"PRIVADO" | "EMPRESA">(
    (cita.visibilidad as "EMPRESA") || "PRIVADO"
  );

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/citas/${cita.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, visibilidad }),
    });
    setEditando(false);
    router.refresh();
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar la cita "${cita.titulo}"?`)) return;
    await fetch(`/api/citas/${cita.id}`, { method: "DELETE" });
    router.refresh();
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="bg-white border border-noche-100 rounded-xl p-3 space-y-3">
        <input
          required
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
        <div>
          <label className="block text-xs text-noche-400 mb-1">Repetir</label>
          <select
            value={form.periodicidad}
            onChange={(e) => setForm({ ...form, periodicidad: e.target.value })}
            className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
          >
            <option value="UNICA">No se repite</option>
            <option value="SEMANAL">Cada semana</option>
            <option value="QUINCENAL">Cada quincena</option>
            <option value="MENSUAL">Cada mes</option>
            <option value="ANUAL">Cada año</option>
          </select>
        </div>
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

  return (
    <div className="bg-white border border-noche-100 rounded-xl p-3 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{cita.titulo}</p>
        <p className="text-xs text-noche-400">
          {format(soloFecha(cita.fecha), "d MMM yyyy", { locale: es })} {cita.hora ? `· ${cita.hora}` : ""}{" "}
          {cita.lugar ? `· ${cita.lugar}` : ""}
        </p>
        {cita.periodicidad && cita.periodicidad !== "UNICA" && (
          <p className="text-[11px] text-noche-400">↻ {ETIQUETA_PERIODICIDAD[cita.periodicidad]}</p>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
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
