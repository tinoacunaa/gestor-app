import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcularAvance } from "@/lib/avance";
import EliminarProyectoBoton from "@/components/EliminarProyectoBoton";

const SEMAFORO_COLOR: Record<string, string> = {
  adelantado: "bg-salvia-400",
  atiempo: "bg-ambar-400",
  atrasado: "bg-arcilla-400",
};

export default async function ProyectosPage() {
  const session = await getServerSession(authOptions);
  const usuarioId = (session!.user as any).id;

  const proyectos = await prisma.proyecto.findMany({
    where: { usuarioId },
    include: { actividades: { include: { ocurrencias: true } } },
    orderBy: { fechaInicio: "asc" },
  });

  return (
    <div className="px-4 pt-8 pb-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Proyectos</h1>
        <Link href="/proyectos/nuevo" className="text-sm bg-noche-900 text-white rounded-lg px-3 py-1.5">
          + Nuevo
        </Link>
      </div>

      <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
        {proyectos.map((p) => {
          const { avanceReal, avancePlanificado, diasRestantes, estadoSemaforo } = calcularAvance(
            p.actividades,
            p.fechaInicio,
            p.fechaFin
          );
          return (
            <li key={p.id}>
              <Link href={`/proyectos/${p.id}`} className="block bg-white rounded-xl p-4 border border-noche-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{p.nombre}</p>
                  <span className={`w-2.5 h-2.5 rounded-full ${SEMAFORO_COLOR[estadoSemaforo]}`} />
                </div>
                {p.tipo && <p className="text-xs text-noche-400 mb-2">{p.tipo}</p>}

                <div className="relative h-1.5 bg-noche-50 rounded-full overflow-hidden mb-1">
                  <div
                    className="absolute inset-y-0 left-0 bg-noche-100"
                    style={{ width: `${avancePlanificado}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 bg-salvia-400"
                    style={{ width: `${avanceReal}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-noche-400">
                  <span>{avanceReal}% real</span>
                  <span>
                    {diasRestantes >= 0 ? `Faltan ${diasRestantes} días` : `Vencido hace ${-diasRestantes} días`}
                  </span>
                </div>
              </Link>
              <div className="flex justify-end mt-1">
                <EliminarProyectoBoton proyectoId={p.id} />
              </div>
            </li>
          );
        })}
      </ul>

      {proyectos.length === 0 && (
        <p className="text-sm text-noche-400">Aún no tienes proyectos. Crea el primero.</p>
      )}
    </div>
  );
}
