import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UsuarioSesion } from "@/lib/alcance";

// Solo el SUPER_ADMIN gestiona empresas.
async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const usuario = session.user as any as UsuarioSesion;
  if (usuario.rol !== "SUPER_ADMIN") return null;
  return usuario;
}

export async function GET() {
  const usuario = await requireSuperAdmin();
  if (!usuario) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const empresas = await prisma.empresa.findMany({
    include: { usuarios: { select: { id: true, email: true, nombre: true, rol: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(empresas);
}

// Crea una empresa junto con su primer usuario administrador.
export async function POST(req: Request) {
  const usuario = await requireSuperAdmin();
  if (!usuario) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  if (!body.nombreEmpresa || !body.emailAdmin || !body.passwordAdmin) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const existente = await prisma.usuario.findUnique({ where: { email: body.emailAdmin } });
  if (existente) {
    return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(body.passwordAdmin, 10);

  const empresa = await prisma.empresa.create({
    data: {
      nombre: body.nombreEmpresa,
      usuarios: {
        create: {
          email: body.emailAdmin,
          password: passwordHash,
          nombre: body.nombreAdmin || null,
          rol: "ADMIN_EMPRESA",
        },
      },
    },
    include: { usuarios: true },
  });

  return NextResponse.json(empresa, { status: 201 });
}
