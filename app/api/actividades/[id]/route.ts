import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";
import { generarFechasOcurrencia } from "@/lib/ocurrencias";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const fechaInicio = parseISO(body.fechaInicio);
  const fechaFin = parseISO(body.fechaFin);

  const actividad = await prisma.actividad.update({
    where: { id },
    data: {
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

  // Si cambió el rango de fechas o la periodicidad, las ocurrencias ya no
  // corresponden — se regeneran desde cero (se pierde el check ya hecho de
  // las ocurrencias afectadas, es lo esperado al reprogramar una actividad).
  await prisma.ocurrenciaActividad.deleteMany({ where: { actividadId: actividad.id } });
  const fechas = generarFechasOcurrencia(actividad.periodicidad, fechaInicio, fechaFin);
  await prisma.ocurrenciaActividad.createMany({
    data: fechas.map((fecha) => ({ actividadId: actividad.id, fecha })),
  });

  return NextResponse.json(actividad);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.actividad.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
