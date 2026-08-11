import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const citas = await prisma.cita.findMany({
    where: { usuarioId: (session.user as any).id },
    orderBy: { fecha: "asc" },
  });
  return NextResponse.json(citas);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const cita = await prisma.cita.create({
    data: {
      titulo: body.titulo,
      fecha: parseISO(body.fecha),
      hora: body.hora || null,
      lugar: body.lugar || null,
      descripcion: body.descripcion || null,
      recurrente: !!body.recurrente,
      usuarioId: (session.user as any).id,
    },
  });
  return NextResponse.json(cita, { status: 201 });
}
