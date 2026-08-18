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

  const existente = await prisma.pago.findUnique({ where: { id } });
  if (!existente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!puedeEditar(usuario, existente)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const data: any = {};
  if (body.estado !== undefined) data.estado = body.estado;
  if (body.concepto !== undefined) data.concepto = body.concepto;
  if (body.monto !== undefined) data.monto = body.monto ? Number(body.monto) : null;
  if (body.fechaVencimiento !== undefined) data.fechaVencimiento = parseISO(body.fechaVencimiento);
  if (body.periodicidad !== undefined) data.periodicidad = body.periodicidad;
  if (body.visibilidad === "EMPRESA" && usuario.empresaId) data.visibilidad = "EMPRESA";
  if (body.visibilidad === "PRIVADO") data.visibilidad = "PRIVADO";

  const pago = await prisma.pago.update({ where: { id: id }, data });
  return NextResponse.json(pago);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const usuario = session.user as any as UsuarioSesion;

  const existente = await prisma.pago.findUnique({ where: { id } });
  if (!existente) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!puedeEditar(usuario, existente)) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  await prisma.pago.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}
