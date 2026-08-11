import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  format,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import CalendarioGrid, { EventoCalendario } from "@/components/CalendarioGrid";

export default async function CalendarioPage({ searchParams }: { searchParams: { mes?: string } }) {
  const session = await getServerSession(authOptions);
  const usuarioId = (session!.user as any).id;

  // parseISO respeta la fecha local (1 de septiembre = 1 de septiembre).
  // new Date("2026-09-01") en cambio la lee como UTC y en Perú (UTC-5)
  // se corre al 31 de agosto — el mismo bug que ya resolviste en la app de la parroquia.
  const mesBase = searchParams.mes ? parseISO(`${searchParams.mes}-01`) : new Date();
  const inicioMes = startOfMonth(mesBase);
  const finMes = endOfMonth(mesBase);
  const inicioGrid = startOfWeek(inicioMes, { weekStartsOn: 1 });
  const finGrid = endOfWeek(finMes, { weekStartsOn: 1 });
  const dias = eachDayOfInterval({ start: inicioGrid, end: finGrid });

  const [ocurrencias, citas, pagos, cumpleanios] = await Promise.all([
    prisma.ocurrenciaActividad.findMany({
      where: { fecha: { gte: inicioGrid, lte: finGrid }, actividad: { proyecto: { usuarioId } } },
      include: { actividad: { include: { proyecto: true } } },
    }),
    prisma.cita.findMany({ where: { usuarioId, fecha: { gte: inicioGrid, lte: finGrid } } }),
    prisma.pago.findMany({ where: { usuarioId, fechaVencimiento: { gte: inicioGrid, lte: finGrid } } }),
    prisma.cumpleanio.findMany({ where: { usuarioId } }),
  ]);

  const eventosPorDia: Record<string, EventoCalendario[]> = {};
  const push = (iso: string, ev: EventoCalendario) => {
    (eventosPorDia[iso] ||= []).push(ev);
  };

  ocurrencias.forEach((o) =>
    push(format(o.fecha, "yyyy-MM-dd"), {
      id: o.id,
      tipo: "PROYECTO",
      titulo: o.actividad.nombre,
      proyecto: o.actividad.proyecto.nombre,
    })
  );
  citas.forEach((c) => push(format(c.fecha, "yyyy-MM-dd"), { id: c.id, tipo: "CITA", titulo: c.titulo }));
  pagos.forEach((p) =>
    push(format(p.fechaVencimiento, "yyyy-MM-dd"), { id: p.id, tipo: "PAGO", titulo: p.concepto })
  );
  cumpleanios.forEach((c) => {
    const f = new Date(c.fecha);
    if (f.getMonth() === mesBase.getMonth()) {
      const iso = format(new Date(mesBase.getFullYear(), f.getMonth(), f.getDate()), "yyyy-MM-dd");
      push(iso, { id: c.id, tipo: "CUMPLEANOS", titulo: c.nombre });
    }
  });

  const semanas: string[][] = [];
  for (let i = 0; i < dias.length; i += 7) {
    semanas.push(
      dias.slice(i, i + 7).map((d) => (d.getMonth() === mesBase.getMonth() ? format(d, "yyyy-MM-dd") : ""))
    );
  }

  const mesAnterior = format(addMonths(mesBase, -1), "yyyy-MM");
  const mesSiguiente = format(addMonths(mesBase, 1), "yyyy-MM");

  return (
    <div className="px-4 pt-8 pb-4">
      <CalendarioGrid
        semanas={semanas}
        eventosPorDia={eventosPorDia}
        mesLabel={format(mesBase, "MMMM yyyy", { locale: es })}
        mesAnteriorHref={`/calendario?mes=${mesAnterior}`}
        mesSiguienteHref={`/calendario?mes=${mesSiguiente}`}
      />
    </div>
  );
}
