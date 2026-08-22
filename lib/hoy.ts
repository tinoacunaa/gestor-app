import { startOfDay, endOfDay, isSameDay, isBefore } from "date-fns";
import { prisma } from "@/lib/prisma";
import { alcanceDatos, UsuarioSesion } from "@/lib/alcance";
import { fechasCitaEnRango } from "@/lib/citaOcurrencias";

export async function getDatosHoy(usuario: UsuarioSesion) {
  const alcance = alcanceDatos(usuario);
  const hoy = new Date();
  const inicio = startOfDay(hoy);
  const fin = endOfDay(hoy);

  const [ocurrenciasHoy, ocurrenciasAtrasadas, citasHoy, pagosPendientes, cumpleanios] = await Promise.all([
    // "De hoy" = el día de hoy cae dentro del ciclo [fecha, fechaFin].
    prisma.ocurrenciaActividad.findMany({
      where: {
        fecha: { lte: fin },
        OR: [{ fechaFin: { gte: inicio } }, { fechaFin: null, fecha: { gte: inicio } }],
        actividad: { proyecto: alcance },
      },
      include: { actividad: { include: { proyecto: true } } },
      orderBy: { fecha: "asc" },
    }),
    // "Atrasada" = el ciclo ya terminó (fechaFin, o fecha si dura 1 día) antes de hoy y sigue sin completarse.
    prisma.ocurrenciaActividad.findMany({
      where: {
        OR: [{ fechaFin: { lt: inicio } }, { fechaFin: null, fecha: { lt: inicio } }],
        estado: { not: "COMPLETADO" },
        actividad: { proyecto: alcance },
      },
      include: { actividad: { include: { proyecto: true } } },
      orderBy: { fecha: "asc" },
    }),
    // Trae la cita si su fecha ancla es hoy, O si es recurrente (puede caer
    // hoy aunque su fecha ancla original sea de hace meses).
    prisma.cita.findMany({
      where: { AND: [alcance, { OR: [{ fecha: { gte: inicio, lte: fin } }, { periodicidad: { not: "UNICA" } }] }] },
      orderBy: { hora: "asc" },
    }),
    prisma.pago.findMany({
      where: { AND: [alcance, { estado: "PENDIENTE", fechaVencimiento: { lte: fin } }] },
      orderBy: { fechaVencimiento: "asc" },
    }),
    prisma.cumpleanio.findMany({ where: alcance }),
  ]);

  const cumpleaniosHoy = cumpleanios.filter((c) => {
    const f = new Date(c.fecha);
    return f.getDate() === hoy.getDate() && f.getMonth() === hoy.getMonth();
  });

  // Filtra las citas cuyas recurrencias realmente caigan hoy (las UNICA ya
  // vinieron filtradas por fecha desde la consulta; las recurrentes hay que
  // verificarlas expandiendo sus ciclos).
  const citasHoyFiltradas = citasHoy.filter(
    (c) => fechasCitaEnRango(c.fecha, c.periodicidad, inicio, fin).length > 0
  );

  return { ocurrenciasHoy, ocurrenciasAtrasadas, citasHoy: citasHoyFiltradas, pagosPendientes, cumpleaniosHoy };
}
