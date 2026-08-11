import { startOfDay, endOfDay, isSameDay, isBefore } from "date-fns";
import { prisma } from "@/lib/prisma";

export async function getDatosHoy(usuarioId: string) {
  const hoy = new Date();
  const inicio = startOfDay(hoy);
  const fin = endOfDay(hoy);

  const [ocurrenciasHoy, ocurrenciasAtrasadas, citasHoy, pagosPendientes, cumpleanios] = await Promise.all([
    prisma.ocurrenciaActividad.findMany({
      where: { fecha: { gte: inicio, lte: fin }, actividad: { proyecto: { usuarioId } } },
      include: { actividad: { include: { proyecto: true } } },
      orderBy: { fecha: "asc" },
    }),
    prisma.ocurrenciaActividad.findMany({
      where: {
        fecha: { lt: inicio },
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
