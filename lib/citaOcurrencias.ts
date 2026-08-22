import { addDays, addMonths, addYears, isAfter, isBefore } from "date-fns";
import type { PeriodicidadCita } from "@prisma/client";

/**
 * Las citas no guardan una ocurrencia por fila (a diferencia de las
 * actividades): una cita recurrente es UN registro con UNA fecha ancla, y
 * las fechas en las que realmente aparece se calculan al vuelo con esta
 * función, según su periodicidad.
 *
 * - UNICA: solo su propia fecha.
 * - SEMANAL: cada 7 días desde la fecha ancla.
 * - QUINCENAL: dos veces al mes, ancladas al día de la fecha (día X y día
 *   X+15), igual que se corrigió para las actividades — para que no se
 *   desalinee con el paso de los meses.
 * - MENSUAL: mismo día cada mes.
 * - ANUAL: mismo día y mes cada año (cumpleaños de la cita, por así decirlo).
 */
export function fechasCitaEnRango(
  fechaAncla: Date,
  periodicidad: PeriodicidadCita,
  rangoInicio: Date,
  rangoFin: Date
): Date[] {
  const fechas: Date[] = [];

  if (periodicidad === "UNICA") {
    if (!isBefore(fechaAncla, rangoInicio) && !isAfter(fechaAncla, rangoFin)) fechas.push(fechaAncla);
    return fechas;
  }

  if (periodicidad === "QUINCENAL") {
    let mesOffset = 0;
    // Límite de seguridad para no iterar para siempre si algo sale mal.
    while (mesOffset < 600) {
      const inicioA = addMonths(fechaAncla, mesOffset);
      if (isAfter(inicioA, rangoFin)) break;
      if (!isBefore(inicioA, rangoInicio)) fechas.push(inicioA);

      const inicioB = addDays(inicioA, 15);
      if (!isBefore(inicioB, rangoInicio) && !isAfter(inicioB, rangoFin)) fechas.push(inicioB);

      mesOffset++;
    }
    return fechas;
  }

  const avanzar =
    periodicidad === "SEMANAL"
      ? (d: Date) => addDays(d, 7)
      : periodicidad === "MENSUAL"
      ? (d: Date) => addMonths(d, 1)
      : (d: Date) => addYears(d, 1); // ANUAL

  let actual = fechaAncla;
  let iteraciones = 0;
  // Si la fecha ancla ya pasó el rango buscado, no hace falta iterar desde
  // ahí — pero para simplicidad y porque el volumen es bajo, iteramos desde
  // la fecha ancla siempre (con tope de seguridad).
  while (!isAfter(actual, rangoFin) && iteraciones < 2000) {
    if (!isBefore(actual, rangoInicio)) fechas.push(actual);
    actual = avanzar(actual);
    iteraciones++;
  }

  return fechas;
}
