import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const cumpleanio = await prisma.cumpleanio.update({
    where: { id: params.id },
    data: {
      nombre: body.nombre,
      fecha: parseISO(body.fecha),
      notas: body.notas || null,
    },
  });
  return NextResponse.json(cumpleanio);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.cumpleanio.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
