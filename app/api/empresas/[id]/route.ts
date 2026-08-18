import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsuarioSesion } from "@/lib/alcance";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const usuario = session.user as any as UsuarioSesion;
  if (usuario.rol !== "SUPER_ADMIN") return null;
  return usuario;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await requireSuperAdmin();
  if (!usuario) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;

  const body = await req.json();
  const empresa = await prisma.empresa.update({
    where: { id },
    data: { nombre: body.nombre },
  });
  return NextResponse.json(empresa);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await requireSuperAdmin();
  if (!usuario) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { id } = await params;

  // Se eliminan primero los usuarios de la empresa (y con ellos, en cascada,
  // sus proyectos/citas/pagos/cumpleaños vía las relaciones existentes).
  await prisma.usuario.deleteMany({ where: { empresaId: id } });
  await prisma.empresa.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
