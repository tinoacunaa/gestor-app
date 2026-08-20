import { addDays, addMonths, differenceInCalendarDays, isAfter } from "date-fns";
import { Periodicidad } from "@prisma/client";

export type CicloOcurrencia = {
  fecha: Date; // inicio del ciclo
  fechaFin: Date; // fin del ciclo (igual a fecha si dura 1 día)
};

/**
 * Genera los ciclos de ocurrencia de una actividad según su periodicidad.
 *
 * - fechaInicioActividad / fechaFinActividad definen la VENTANA que se repite
 *   (ej. empieza el 19, termina el 22 → un ciclo de 4 días). Esa misma duración
 *   se mantiene en cada repetición.
 * - fechaFinProyecto es el límite: se sigue generando un nuevo ciclo mientras
 *   su fecha de inicio no supere la fecha de fin del proyecto.
 *
 * - UNICA: un solo ciclo, con la ventana tal cual (fechaInicioActividad → fechaFinActividad).
 * - SEMANAL: un ciclo cada 7 días desde fechaInicioActividad.
 * - QUINCENAL: un ciclo cada 15 días desde fechaInicioActividad.
 * - MENSUAL: un ciclo cada mes (mismo día) desde fechaInicioActividad.
 */
export function generarFechasOcurrencia(
  periodicidad: Periodicidad,
  fechaInicioActividad: Date,
  fechaFinActividad: Date,
  fechaFinProyecto: Date
): CicloOcurrencia[] {
  const ciclos: CicloOcurrencia[] = [];
  const duracionDias = differenceInCalendarDays(fechaFinActividad, fechaInicioActividad);

  if (periodicidad === "UNICA") {
    ciclos.push({ fecha: fechaInicioActividad, fechaFin: fechaFinActividad });
    return ciclos;
  }

  const avanzar =
    periodicidad === "SEMANAL"
      ? (d: Date) => addDays(d, 7)
      : periodicidad === "QUINCENAL"
      ? (d: Date) => addDays(d, 15)
      : (d: Date) => addMonths(d, 1);

  let inicioCiclo = fechaInicioActividad;
  // Se sigue generando mientras el INICIO del ciclo no supere la fechaFin del proyecto.
  while (!isAfter(inicioCiclo, fechaFinProyecto)) {
    const finCiclo = addDays(inicioCiclo, duracionDias);
    ciclos.push({ fecha: inicioCiclo, fechaFin: finCiclo });
    inicioCiclo = avanzar(inicioCiclo);
  }

  return ciclos;
}
