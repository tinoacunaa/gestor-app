import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NuevaCitaForm from "@/components/NuevaCitaForm";
import CitaItem from "@/components/CitaItem";

export default async function CitasPage() {
  const session = await getServerSession(authOptions);
  const usuarioId = (session!.user as any).id;
  const citas = await prisma.cita.findMany({ where: { usuarioId }, orderBy: { fecha: "asc" } });

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="font-display text-2xl mb-6">Agenda</h1>
      <ul className="space-y-2 mb-4">
        {citas.map((c) => (
          <li key={c.id}>
            <CitaItem cita={c} />
          </li>
        ))}
        {citas.length === 0 && <p className="text-sm text-noche-400">No tienes citas registradas.</p>}
      </ul>
      <NuevaCitaForm />
    </div>
  );
}
