import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UsuarioSesion } from "@/lib/alcance";

async function requireAdminEmpresa() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const usuario = session.user as any as UsuarioSesion;
  if (usuario.rol !== "ADMIN_EMPRESA" || !usuario.empresaId) return null;
  return usuario;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminEmpresa();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;

  const objetivo = await prisma.usuario.findUnique({ where: { id } });
  // Solo puede editar usuarios de su propia empresa (no a otros admins/empresas).
  if (!objetivo || objetivo.empresaId !== admin.empresaId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const data: any = { nombre: body.nombre };
  if (body.password) data.password = await bcrypt.hash(body.password, 10);

  const usuario = await prisma.usuario.update({
    where: { id },
    data,
    select: { id: true, email: true, nombre: true, rol: true, createdAt: true },
  });
  return NextResponse.json(usuario);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminEmpresa();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;

  const objetivo = await prisma.usuario.findUnique({ where: { id } });
  if (!objetivo || objetivo.empresaId !== admin.empresaId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  if (objetivo.id === admin.id) {
    return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 });
  }

  await prisma.usuario.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
