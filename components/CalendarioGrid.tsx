"use client";

import { useState } from "react";
import Link from "next/link";

export type EventoCalendario = {
  id: string;
  tipo: "PROYECTO" | "CITA" | "CUMPLEANOS" | "PAGO";
  titulo: string;
  proyecto?: string;
  marcador?: "INICIO" | "FIN"; // solo aplica a tipo PROYECTO (actividades con rango)
  detalle?: {
    rango?: string; // fecha (o rango de fechas) ya formateada, calculada en el servidor
    hora?: string | null;
    lugar?: string | null;
    descripcion?: string | null;
    estado?: string;
    monto?: number | null;
  };
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
  const [seleccionado, setSeleccionado] = useState<EventoCalendario | null>(null);

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
                    <button
                      key={`${e.id}-${e.marcador || ""}`}
                      onClick={() => setSeleccionado(e)}
                      className={`w-full text-left text-[10px] truncate rounded px-1 ${t.bg} ${t.text}`}
                      title={e.marcador === "INICIO" ? "Inicio" : e.marcador === "FIN" ? "Fin" : undefined}
                    >
                      {prefijo}
                      {e.titulo}
                    </button>
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

      {seleccionado && (
        <div
          className="fixed inset-0 bg-noche-900/40 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
          onClick={() => setSeleccionado(null)}
        >
          <div
            className="bg-white rounded-t-2xl md:rounded-2xl p-5 w-full md:max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const t = TIPOS.find((x) => x.key === seleccionado.tipo)!;
              const d = seleccionado.detalle;
              return (
                <>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                    <span className={`text-xs ${t.text}`}>{t.label.replace(/s$/, "")}</span>
                  </div>
                  <h2 className="font-display text-lg mb-1">{seleccionado.titulo}</h2>
                  {seleccionado.proyecto && (
                    <p className="text-xs text-noche-400 mb-2">{seleccionado.proyecto}</p>
                  )}
                  <div className="space-y-1 text-sm text-noche-600">
                    {d?.rango && <p>📅 {d.rango}</p>}
                    {d?.hora && <p>🕒 {d.hora}</p>}
                    {d?.lugar && <p>📍 {d.lugar}</p>}
                    {typeof d?.monto === "number" && <p>💵 S/ {d.monto}</p>}
                    {d?.estado && <p>Estado: {d.estado.charAt(0) + d.estado.slice(1).toLowerCase()}</p>}
                    {d?.descripcion && <p className="text-noche-400">{d.descripcion}</p>}
                  </div>
                  <button
                    onClick={() => setSeleccionado(null)}
                    className="w-full mt-4 border border-noche-100 rounded-lg py-2 text-sm"
                  >
                    Cerrar
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
