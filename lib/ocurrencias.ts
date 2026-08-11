import { addDays, addMonths, isAfter, isEqual } from "date-fns";
import { Periodicidad } from "@prisma/client";

/**
 * Genera las fechas de ocurrencia de una actividad según su periodicidad.
 * - UNICA: una sola ocurrencia en fechaInicio.
 * - QUINCENAL: una cada 15 días entre fechaInicio y fechaFin.
 * - MENSUAL: una por mes (mismo día que fechaInicio) entre fechaInicio y fechaFin.
 *
 * Esto es lo que permite que el usuario configure la actividad UNA vez
 * y el sistema arme todo el calendario de "checks" automáticamente.
 */
export function generarFechasOcurrencia(
  periodicidad: Periodicidad,
  fechaInicio: Date,
  fechaFin: Date
): Date[] {
  const fechas: Date[] = [];

  if (periodicidad === "UNICA") {
    fechas.push(fechaInicio);
    return fechas;
  }

  let actual = fechaInicio;
  const paso = periodicidad === "QUINCENAL" ? (d: Date) => addDays(d, 15) : (d: Date) => addMonths(d, 1);

  while (isAfter(fechaFin, actual) || isEqual(actual, fechaFin)) {
    fechas.push(actual);
    actual = paso(actual);
  }

  return fechas;
}
