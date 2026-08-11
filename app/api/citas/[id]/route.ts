import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const cita = await prisma.cita.update({
    where: { id: params.id },
    data: {
      titulo: body.titulo,
      fecha: parseISO(body.fecha),
      hora: body.hora || null,
      lugar: body.lugar || null,
      descripcion: body.descripcion || null,
      recurrente: !!body.recurrente,
    },
  });
  return NextResponse.json(cita);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.cita.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
