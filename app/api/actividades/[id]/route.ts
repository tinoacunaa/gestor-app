import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";
import { generarFechasOcurrencia } from "@/lib/ocurrencias";
import { puedeEditar, UsuarioSesion } from "@/lib/alcance";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const usuario = session.user as any as UsuarioSesion;

  const existente = await prisma.actividad.findUnique({ where: { id }, include: { proyecto: true } });
  if (!existente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!puedeEditar(usuario, existente.proyecto)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const fechaInicio = parseISO(body.fechaInicio);
  const fechaFin = parseISO(body.fechaFin);

  // Solo se regeneran las ocurrencias (perdiendo el avance ya marcado) si
  // REALMENTE cambió algo que afecta los ciclos: las fechas o la periodicidad.
  // Editar solo el nombre, la hora, la descripción, etc. no debe resetear nada.
  const cambioFechas =
    fechaInicio.getTime() !== existente.fechaInicio.getTime() ||
    fechaFin.getTime() !== existente.fechaFin.getTime() ||
    body.periodicidad !== existente.periodicidad;

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

  if (cambioFechas) {
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
  }

  return NextResponse.json(actividad);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const usuario = session.user as any as UsuarioSesion;

  const existente = await prisma.actividad.findUnique({ where: { id }, include: { proyecto: true } });
  if (!existente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!puedeEditar(usuario, existente.proyecto)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.actividad.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}
