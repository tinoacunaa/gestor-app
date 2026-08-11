import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const cumpleanios = await prisma.cumpleanio.findMany({
    where: { usuarioId: (session.user as any).id },
  });
  return NextResponse.json(cumpleanios);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const cumpleanio = await prisma.cumpleanio.create({
    data: {
      nombre: body.nombre,
      fecha: parseISO(body.fecha),
      notas: body.notas || null,
      usuarioId: (session.user as any).id,
    },
  });
  return NextResponse.json(cumpleanio, { status: 201 });
}
