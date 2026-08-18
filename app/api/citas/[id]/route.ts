import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";
import { puedeEditar, UsuarioSesion } from "@/lib/alcance";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const usuario = session.user as any as UsuarioSesion;

  const existente = await prisma.cita.findUnique({ where: { id } });
  if (!existente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!puedeEditar(usuario, existente)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const cita = await prisma.cita.update({
    where: { id: id },
    data: {
      titulo: body.titulo,
      fecha: parseISO(body.fecha),
      hora: body.hora || null,
      lugar: body.lugar || null,
      descripcion: body.descripcion || null,
      recurrente: !!body.recurrente,
      visibilidad: body.visibilidad === "EMPRESA" && usuario.empresaId ? "EMPRESA" : body.visibilidad === "PRIVADO" ? "PRIVADO" : undefined,
    },
  });
  return NextResponse.json(cita);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const usuario = session.user as any as UsuarioSesion;

  const existente = await prisma.cita.findUnique({ where: { id } });
  if (!existente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!puedeEditar(usuario, existente)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  await prisma.cita.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}
