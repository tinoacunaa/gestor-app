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

  const pagos = await prisma.pago.findMany({
    where: alcanceDatos(usuario),
    orderBy: { fechaVencimiento: "asc" },
  });
  return NextResponse.json(pagos);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const usuario = session.user as any as UsuarioSesion;

  const body = await req.json();
  const pago = await prisma.pago.create({
    data: {
      concepto: body.concepto,
      monto: body.monto ? Number(body.monto) : null,
      fechaVencimiento: parseISO(body.fechaVencimiento),
      periodicidad: body.periodicidad || "UNICA",
      usuarioId: usuario.id,
      empresaId: usuario.empresaId,
      visibilidad: body.visibilidad === "EMPRESA" && usuario.empresaId ? "EMPRESA" : "PRIVADO",
    },
  });
  return NextResponse.json(pago, { status: 201 });
}
