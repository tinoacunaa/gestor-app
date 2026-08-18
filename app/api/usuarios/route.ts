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

export async function GET() {
  const admin = await requireAdminEmpresa();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const usuarios = await prisma.usuario.findMany({
    where: { empresaId: admin.empresaId },
    select: { id: true, email: true, nombre: true, rol: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(usuarios);
}

// El admin de empresa crea usuarios de su propia empresa (rol USUARIO).
export async function POST(req: Request) {
  const admin = await requireAdminEmpresa();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const existente = await prisma.usuario.findUnique({ where: { email: body.email } });
  if (existente) {
    return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);
  const usuario = await prisma.usuario.create({
    data: {
      email: body.email,
      password: passwordHash,
      nombre: body.nombre || null,
      rol: "USUARIO",
      empresaId: admin.empresaId,
    },
    select: { id: true, email: true, nombre: true, rol: true, createdAt: true },
  });

  return NextResponse.json(usuario, { status: 201 });
}
