import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generarFechasOcurrencia } from "@/lib/ocurrencias";
import { parseISO } from "date-fns";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  // parseISO respeta la fecha local; new Date("2026-08-11") la lee como UTC
  // y en Perú (UTC-5) se corre al día 10.
  const fechaInicio = parseISO(body.fechaInicio);
  const fechaFin = parseISO(body.fechaFin);

  const actividad = await prisma.actividad.create({
    data: {
      proyectoId: body.proyectoId,
      nombre: body.nombre,
      descripcion: body.descripcion || null,
      duracion: body.duracion ? Number(body.duracion) : null,
      unidadDuracion: body.unidadDuracion || null,
      periodicidad: body.periodicidad,
      hora: body.hora || null,
      fechaInicio,
      fechaFin,
      tipoSeguimiento: body.tipoSeguimiento || "ESTADO",
      predecesoraId: body.predecesoraId || null,
    },
  });

  // Genera automáticamente todas las ocurrencias del rango: esto es lo que
  // evita que el usuario tenga que "recrear" la tarea cada quincena/mes.
  const fechas = generarFechasOcurrencia(actividad.periodicidad, fechaInicio, fechaFin);
  await prisma.ocurrenciaActividad.createMany({
    data: fechas.map((fecha) => ({ actividadId: actividad.id, fecha })),
  });

  return NextResponse.json(actividad, { status: 201 });
}
