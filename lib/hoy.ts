import { startOfDay, endOfDay, isSameDay, isBefore } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function getDatosHoy(usuarioId: string) {
  const hoy = new Date();
  const inicio = startOfDay(hoy);
  const fin = endOfDay(hoy);

  const [ocurrenciasHoy, ocurrenciasAtrasadas, citasHoy, pagosPendientes, cumpleanios] = await Promise.all([
    // "De hoy" = el día de hoy cae dentro del ciclo [fecha, fechaFin].
    prisma.ocurrenciaActividad.findMany({
      where: {
        fecha: { lte: fin },
        OR: [{ fechaFin: { gte: inicio } }, { fechaFin: null, fecha: { gte: inicio } }],
        actividad: { proyecto: { usuarioId } },
      },
      include: { actividad: { include: { proyecto: true } } },
      orderBy: { fecha: "asc" },
    }),
    // "Atrasada" = el ciclo ya terminó (fechaFin, o fecha si dura 1 día) antes de hoy y sigue sin completarse.
    prisma.ocurrenciaActividad.findMany({
      where: {
        OR: [{ fechaFin: { lt: inicio } }, { fechaFin: null, fecha: { lt: inicio } }],
        estado: { not: "COMPLETADO" },
        actividad: { proyecto: { usuarioId } },
      },
      include: { actividad: { include: { proyecto: true } } },
      orderBy: { fecha: "asc" },
    }),
    prisma.cita.findMany({
      where: { usuarioId, fecha: { gte: inicio, lte: fin } },
      orderBy: { hora: "asc" },
    }),
    prisma.pago.findMany({
      where: { usuarioId, estado: "PENDIENTE", fechaVencimiento: { lte: fin } },
      orderBy: { fechaVencimiento: "asc" },
    }),
    prisma.cumpleanio.findMany({ where: { usuarioId } }),
  ]);

  const cumpleaniosHoy = cumpleanios.filter((c) => {
    const f = new Date(c.fecha);
    return f.getDate() === hoy.getDate() && f.getMonth() === hoy.getMonth();
  });

  return { ocurrenciasHoy, ocurrenciasAtrasadas, citasHoy, pagosPendientes, cumpleaniosHoy };
}
