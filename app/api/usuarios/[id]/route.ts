import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { puedeGestionarUsuario, UsuarioSesion } from "@/lib/alcance";

async function requireGestor() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const usuario = session.user as any as UsuarioSesion;
  if (usuario.rol !== "ADMIN_EMPRESA" && usuario.rol !== "SUPER_ADMIN") return null;
  return usuario;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gestor = await requireGestor();
  if (!gestor) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;

  const objetivo = await prisma.usuario.findUnique({ where: { id } });
  if (!objetivo || !puedeGestionarUsuario(gestor, objetivo)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const data: any = {};
  if (body.nombre !== undefined) data.nombre = body.nombre || null;
  if (body.password) data.password = await bcrypt.hash(body.password, 10);

  const usuario = await prisma.usuario.update({
    where: { id },
    data,
    select: { id: true, email: true, nombre: true, rol: true, createdAt: true },
  });
  return NextResponse.json(usuario);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gestor = await requireGestor();
  if (!gestor) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;

  const objetivo = await prisma.usuario.findUnique({ where: { id } });
  if (!objetivo || !puedeGestionarUsuario(gestor, objetivo)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  if (objetivo.id === gestor.id) {
    return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 });
  }

  await prisma.usuario.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
