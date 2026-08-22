import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";
import { alcanceDatos, UsuarioSesion } from "@/lib/alcance";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const usuario = session.user as any as UsuarioSesion;

  const citas = await prisma.cita.findMany({
    where: alcanceDatos(usuario),
    orderBy: { fecha: "asc" },
  });
  return NextResponse.json(citas);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const usuario = session.user as any as UsuarioSesion;

  const body = await req.json();
  const cita = await prisma.cita.create({
    data: {
      titulo: body.titulo,
      fecha: parseISO(body.fecha),
      hora: body.hora || null,
      lugar: body.lugar || null,
      descripcion: body.descripcion || null,
      periodicidad: body.periodicidad || "UNICA",
      usuarioId: usuario.id,
      empresaId: usuario.empresaId,
      visibilidad: body.visibilidad === "EMPRESA" && usuario.empresaId ? "EMPRESA" : "PRIVADO",
    },
  });
  return NextResponse.json(cita, { status: 201 });
}
