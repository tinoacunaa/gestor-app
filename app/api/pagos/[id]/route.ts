import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO } from "date-fns";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const data: any = {};
  if (body.estado !== undefined) data.estado = body.estado;
  if (body.concepto !== undefined) data.concepto = body.concepto;
  if (body.monto !== undefined) data.monto = body.monto ? Number(body.monto) : null;
  if (body.fechaVencimiento !== undefined) data.fechaVencimiento = parseISO(body.fechaVencimiento);
  if (body.periodicidad !== undefined) data.periodicidad = body.periodicidad;

  const pago = await prisma.pago.update({ where: { id: params.id }, data });
  return NextResponse.json(pago);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.pago.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
