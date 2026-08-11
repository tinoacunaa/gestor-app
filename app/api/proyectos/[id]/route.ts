import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const proyecto = await prisma.proyecto.findUnique({
    where: { id: params.id },
    include: {
      actividades: {
        include: { ocurrencias: { orderBy: { fecha: "asc" } } },
        orderBy: { fechaInicio: "asc" },
      },
    },
  });
  if (!proyecto) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(proyecto);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const proyecto = await prisma.proyecto.update({
    where: { id: params.id },
    data: {
      nombre: body.nombre,
      tipo: body.tipo,
      estado: body.estado,
      fechaInicio: body.fechaInicio ? parseISO(body.fechaInicio) : undefined,
      fechaFin: body.fechaFin ? parseISO(body.fechaFin) : undefined,
    },
  });
  return NextResponse.json(proyecto);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.proyecto.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
