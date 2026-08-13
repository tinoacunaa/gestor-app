import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const data: any = {};
  if (body.estado) {
    data.estado = body.estado;
    data.completadoEn = body.estado === "COMPLETADO" ? new Date() : null;
  }
  if (body.porcentaje !== undefined) data.porcentaje = body.porcentaje;
  if (body.nota !== undefined) data.nota = body.nota;

  const ocurrencia = await prisma.ocurrenciaActividad.update({
    where: { id: id },
    data,
  });
  return NextResponse.json(ocurrencia);
}
