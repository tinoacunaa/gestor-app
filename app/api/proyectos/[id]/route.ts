import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";
import { generarFechasOcurrencia } from "@/lib/ocurrencias";
import { puedeEditar, puedeVer, UsuarioSesion } from "@/lib/alcance";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const proyecto = await prisma.proyecto.findUnique({
    where: { id: id },
    include: {
      actividades: {
        include: { ocurrencias: { orderBy: { fecha: "asc" } } },
        orderBy: { fechaInicio: "asc" },
      },
    },
  });
  if (!proyecto) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const usuario = session.user as any as UsuarioSesion;
  if (!puedeVer(usuario, proyecto)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(proyecto);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const usuario = session.user as any as UsuarioSesion;

  const existente = await prisma.proyecto.findUnique({ where: { id } });
  if (!existente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!puedeEditar(usuario, existente)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const nuevaFechaFin = body.fechaFin ? parseISO(body.fechaFin) : undefined;
  // Solo regeneramos ocurrencias si la fechaFin del proyecto REALMENTE cambió
  // (no basta con que venga en el body: el formulario de edición la manda
  // siempre, así el usuario solo haya tocado otro campo como "visibilidad").
  const fechaFinCambio = nuevaFechaFin && nuevaFechaFin.getTime() !== existente.fechaFin.getTime();

  const proyecto = await prisma.proyecto.update({
    where: { id: id },
    data: {
      nombre: body.nombre,
      tipo: body.tipo,
      estado: body.estado,
      fechaInicio: body.fechaInicio ? parseISO(body.fechaInicio) : undefined,
      fechaFin: nuevaFechaFin,
      visibilidad: body.visibilidad === "EMPRESA" && usuario.empresaId ? "EMPRESA" : body.visibilidad === "PRIVADO" ? "PRIVADO" : undefined,
    },
  });

  // Si cambió la fechaFin del proyecto, las actividades recurrentes (quincenal/
  // mensual) deben re-generar sus ciclos hasta la nueva fecha límite — es
  // justo el bug que esto arregla: que dejaran de aparecer en el calendario
  // porque quedaban amarradas a un límite viejo.
  if (fechaFinCambio) {
    const actividades = await prisma.actividad.findMany({ where: { proyectoId: proyecto.id } });
    for (const actividad of actividades) {
      await prisma.ocurrenciaActividad.deleteMany({ where: { actividadId: actividad.id } });
      const ciclos = generarFechasOcurrencia(
        actividad.periodicidad,
        actividad.fechaInicio,
        actividad.fechaFin,
        proyecto.fechaFin
      );
      await prisma.ocurrenciaActividad.createMany({
        data: ciclos.map((c) => ({ actividadId: actividad.id, fecha: c.fecha, fechaFin: c.fechaFin })),
      });
    }
  }

  return NextResponse.json(proyecto);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const usuario = session.user as any as UsuarioSesion;

  const existente = await prisma.proyecto.findUnique({ where: { id } });
  if (!existente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!puedeEditar(usuario, existente)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.proyecto.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}
