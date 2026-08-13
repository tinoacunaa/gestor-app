"use client";

import { useState } from "react";
import Link from "next/link";

export type EventoCalendario = {
  id: string;
  tipo: "PROYECTO" | "CITA" | "CUMPLEANOS" | "PAGO";
  titulo: string;
  proyecto?: string;
  marcador?: "INICIO" | "FIN"; // solo aplica a tipo PROYECTO (actividades con rango)
};

const TIPOS: { key: EventoCalendario["tipo"]; label: string; dot: string; text: string; bg: string }[] = [
  { key: "PROYECTO", label: "Proyectos", dot: "bg-salvia-400", text: "text-salvia-700", bg: "bg-salvia-50" },
  { key: "CITA", label: "Citas", dot: "bg-ambar-400", text: "text-ambar-600", bg: "bg-ambar-50" },
  { key: "CUMPLEANOS", label: "Cumpleaños", dot: "bg-arcilla-400", text: "text-arcilla-600", bg: "bg-arcilla-50" },
  { key: "PAGO", label: "Pagos", dot: "bg-noche-600", text: "text-noche-600", bg: "bg-noche-50" },
];

export default function CalendarioGrid({
  semanas,
  eventosPorDia,
  mesLabel,
  mesAnteriorHref,
  mesSiguienteHref,
}: {
  semanas: string[][]; // arreglo de semanas, cada una con 7 fechas ISO ("" para relleno)
  eventosPorDia: Record<string, EventoCalendario[]>;
  mesLabel: string;
  mesAnteriorHref: string;
  mesSiguienteHref: string;
}) {
  const [activos, setActivos] = useState<Set<EventoCalendario["tipo"]>>(
    new Set(TIPOS.map((t) => t.key))
  );

  function alternar(tipo: EventoCalendario["tipo"]) {
    setActivos((prev) => {
      const nuevo = new Set(prev);
      nuevo.has(tipo) ? nuevo.delete(tipo) : nuevo.add(tipo);
      return nuevo;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link href={mesAnteriorHref} className="text-noche-400 px-2">‹</Link>
        <h1 className="font-display text-xl capitalize">{mesLabel}</h1>
        <Link href={mesSiguienteHref} className="text-noche-400 px-2">›</Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {TIPOS.map((t) => (
          <button
            key={t.key}
            onClick={() => alternar(t.key)}
            className={`text-xs rounded-full px-3 py-1 border flex items-center gap-1.5 ${
              activos.has(t.key) ? `${t.bg} ${t.text} border-transparent` : "border-noche-100 text-noche-400"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-noche-400 mb-1">
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {semanas.flat().map((fechaIso, i) => {
          if (!fechaIso) return <div key={i} className="min-h-[64px] md:min-h-[92px]" />;
          const eventos = (eventosPorDia[fechaIso] || []).filter((e) => activos.has(e.tipo));
          const dia = Number(fechaIso.slice(-2));
          return (
            <div key={i} className="min-h-[64px] md:min-h-[92px] bg-white border border-noche-100 rounded-lg p-1">
              <p className="text-[11px] text-noche-400 mb-0.5">{dia}</p>
              <div className="space-y-0.5">
                {eventos.slice(0, 3).map((e) => {
                  const t = TIPOS.find((x) => x.key === e.tipo)!;
                  const prefijo = e.marcador === "INICIO" ? "▶ " : e.marcador === "FIN" ? "■ " : "";
                  return (
                    <div
                      key={`${e.id}-${e.marcador || ""}`}
                      className={`text-[10px] truncate rounded px-1 ${t.bg} ${t.text}`}
                      title={e.marcador === "INICIO" ? "Inicio" : e.marcador === "FIN" ? "Fin" : undefined}
                    >
                      {prefijo}
                      {e.titulo}
                    </div>
                  );
                })}
                {eventos.length > 3 && (
                  <p className="text-[10px] text-noche-400">+{eventos.length - 3} más</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
