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

  // Solo el SUPER_ADMIN puede cambiar quién es admin de una empresa.
  if (body.rol !== undefined && gestor.rol === "SUPER_ADMIN") {
    if (body.rol !== "ADMIN_EMPRESA" && body.rol !== "USUARIO") {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }
    // No se puede dejar una empresa sin ningún admin: si se está quitando el
    // rol de admin al ÚLTIMO admin de la empresa, se bloquea.
    if (objetivo.rol === "ADMIN_EMPRESA" && body.rol === "USUARIO") {
      const otrosAdmins = await prisma.usuario.count({
        where: { empresaId: objetivo.empresaId, rol: "ADMIN_EMPRESA", id: { not: objetivo.id } },
      });
      if (otrosAdmins === 0) {
        return NextResponse.json(
          { error: "Esta empresa debe tener al menos un administrador" },
          { status: 400 }
        );
      }
    }
    data.rol = body.rol;
  }

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
  // No se puede eliminar al último admin de una empresa.
  if (objetivo.rol === "ADMIN_EMPRESA") {
    const otrosAdmins = await prisma.usuario.count({
      where: { empresaId: objetivo.empresaId, rol: "ADMIN_EMPRESA", id: { not: objetivo.id } },
    });
    if (otrosAdmins === 0) {
      return NextResponse.json(
        { error: "Esta empresa debe tener al menos un administrador" },
        { status: 400 }
      );
    }
  }

  await prisma.usuario.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
