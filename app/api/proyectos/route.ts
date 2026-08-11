import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const proyectos = await prisma.proyecto.findMany({
    where: { usuarioId: (session.user as any).id },
    include: { actividades: { include: { ocurrencias: true } } },
    orderBy: { fechaInicio: "asc" },
  });
  return NextResponse.json(proyectos);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const proyecto = await prisma.proyecto.create({
    data: {
      nombre: body.nombre,
      tipo: body.tipo || null,
      fechaInicio: parseISO(body.fechaInicio),
      fechaFin: parseISO(body.fechaFin),
      usuarioId: (session.user as any).id,
    },
  });
  return NextResponse.json(proyecto, { status: 201 });
}
