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

  const existente = await prisma.cumpleanio.findUnique({ where: { id } });
  if (!existente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!puedeEditar(usuario, existente)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const cumpleanio = await prisma.cumpleanio.update({
    where: { id: id },
    data: {
      nombre: body.nombre,
      fecha: parseISO(body.fecha),
      notas: body.notas || null,
      visibilidad: body.visibilidad === "EMPRESA" && usuario.empresaId ? "EMPRESA" : body.visibilidad === "PRIVADO" ? "PRIVADO" : undefined,
    },
  });
  return NextResponse.json(cumpleanio);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const usuario = session.user as any as UsuarioSesion;

  const existente = await prisma.cumpleanio.findUnique({ where: { id } });
  if (!existente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!puedeEditar(usuario, existente)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  await prisma.cumpleanio.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}
