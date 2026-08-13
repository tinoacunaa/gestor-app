import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";
import { generarFechasOcurrencia } from "@/lib/ocurrencias";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const fechaInicio = parseISO(body.fechaInicio);
  const fechaFin = parseISO(body.fechaFin);

  const actividad = await prisma.actividad.update({
    where: { id: id },
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
    include: { proyecto: true },
  });

  // Si cambió el rango de fechas o la periodicidad, las ocurrencias ya no
  // corresponden — se regeneran desde cero (se pierde el check ya hecho de
  // las ocurrencias afectadas, es lo esperado al reprogramar una actividad).
  // La fechaFin del PROYECTO sigue siendo el límite hasta donde se repiten.
  await prisma.ocurrenciaActividad.deleteMany({ where: { actividadId: actividad.id } });
  const ciclos = generarFechasOcurrencia(
    actividad.periodicidad,
    fechaInicio,
    fechaFin,
    actividad.proyecto.fechaFin
  );
  await prisma.ocurrenciaActividad.createMany({
    data: ciclos.map((c) => ({ actividadId: actividad.id, fecha: c.fecha, fechaFin: c.fechaFin })),
  });

  return NextResponse.json(actividad);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  await prisma.actividad.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}
