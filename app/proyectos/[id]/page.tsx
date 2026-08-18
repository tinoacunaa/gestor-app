import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularAvance } from "@/lib/avance";
import { alcanceDatos, UsuarioSesion } from "@/lib/alcance";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import NuevaActividadForm from "@/components/NuevaActividadForm";
import EditarProyectoForm from "@/components/EditarProyectoForm";
import ActividadItem from "@/components/ActividadItem";

export default async function ProyectoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const usuario = session!.user as any as UsuarioSesion;

  const proyecto = await prisma.proyecto.findFirst({
    where: { AND: [{ id }, alcanceDatos(usuario)] },
    include: {
      actividades: {
        include: { ocurrencias: { orderBy: { fecha: "asc" } }, predecesora: true },
        orderBy: { fechaInicio: "asc" },
      },
    },
  });

  if (!proyecto) return <div className="px-4 pt-8">Proyecto no encontrado.</div>;

  const { avanceReal, avancePlanificado, diasRestantes } = calcularAvance(
    proyecto.actividades,
    proyecto.fechaInicio,
    proyecto.fechaFin
  );

  return (
    <div className="px-4 pt-8 pb-4">
      <p className="text-noche-400 text-xs">{proyecto.tipo}</p>
      <h1 className="font-display text-2xl mb-1">{proyecto.nombre}</h1>
      <p className="text-sm text-noche-400 mb-4">
        {format(proyecto.fechaInicio, "d MMM yyyy", { locale: es })} —{" "}
        {format(proyecto.fechaFin, "d MMM yyyy", { locale: es })}
      </p>

      <EditarProyectoForm proyecto={proyecto} />

      <div className="bg-white border border-noche-100 rounded-xl p-4 mb-6">
        <div className="relative h-2 bg-noche-50 rounded-full overflow-hidden mb-2">
          <div className="absolute inset-y-0 left-0 bg-noche-100" style={{ width: `${avancePlanificado}%` }} />
          <div className="absolute inset-y-0 left-0 bg-salvia-400" style={{ width: `${avanceReal}%` }} />
        </div>
        <div className="flex justify-between text-xs text-noche-400">
          <span>Real {avanceReal}% · Planificado {avancePlanificado}%</span>
          <span>{diasRestantes >= 0 ? `Faltan ${diasRestantes} días` : `Vencido hace ${-diasRestantes} días`}</span>
        </div>
      </div>

      <h2 className="text-xs uppercase tracking-wide text-noche-400 mb-2">Actividades</h2>
      <ul className="space-y-3 mb-4">
        {proyecto.actividades.map((a) => (
          <li key={a.id}>
            <ActividadItem
              actividad={a}
              actividadesExistentes={proyecto.actividades.map((x) => ({ id: x.id, nombre: x.nombre }))}
            />
          </li>
        ))}
      </ul>

      <NuevaActividadForm
        proyectoId={proyecto.id}
        actividadesExistentes={proyecto.actividades.map((a) => ({ id: a.id, nombre: a.nombre }))}
      />
    </div>
  );
}
