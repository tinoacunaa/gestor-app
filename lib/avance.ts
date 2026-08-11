import { differenceInCalendarDays } from "date-fns";

type Ocurrencia = { fecha: Date | string; estado: string };
type Actividad = { ocurrencias: Ocurrencia[] };

export function calcularAvance(actividades: Actividad[], fechaInicio: Date | string, fechaFin: Date | string) {
  const todas = actividades.flatMap((a) => a.ocurrencias);
  const hoy = new Date();

  const totalOcurrencias = todas.length;
  const completadas = todas.filter((o) => o.estado === "COMPLETADO").length;
  const avanceReal = totalOcurrencias > 0 ? Math.round((completadas / totalOcurrencias) * 100) : 0;

  const debieronCompletarse = todas.filter((o) => new Date(o.fecha) <= hoy).length;
  const avancePlanificado =
    totalOcurrencias > 0 ? Math.round((debieronCompletarse / totalOcurrencias) * 100) : 0;

  const diasRestantes = differenceInCalendarDays(new Date(fechaFin), hoy);

  let estadoSemaforo: "adelantado" | "atiempo" | "atrasado" = "atiempo";
  if (avanceReal >= avancePlanificado) estadoSemaforo = "adelantado";
  else if (avanceReal < avancePlanificado - 10) estadoSemaforo = "atrasado";

  return { avanceReal, avancePlanificado, diasRestantes, estadoSemaforo };
}
