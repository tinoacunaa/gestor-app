import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NuevoCumpleanioForm from "@/components/NuevoCumpleanioForm";
import CumpleanioItem from "@/components/CumpleanioItem";

export default async function CumpleanosPage() {
  const session = await getServerSession(authOptions);
  const usuarioId = (session!.user as any).id;
  const cumpleanios = await prisma.cumpleanio.findMany({ where: { usuarioId } });

  const ordenados = [...cumpleanios].sort((a, b) => {
    const da = new Date(a.fecha), db = new Date(b.fecha);
    return da.getMonth() * 31 + da.getDate() - (db.getMonth() * 31 + db.getDate());
  });

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="font-display text-2xl mb-6">Cumpleaños</h1>
      <ul className="space-y-2 mb-4">
        {ordenados.map((c) => (
          <li key={c.id}>
            <CumpleanioItem cumpleanio={c} />
          </li>
        ))}
        {ordenados.length === 0 && <p className="text-sm text-noche-400">No tienes cumpleaños registrados.</p>}
      </ul>
      <NuevoCumpleanioForm />
    </div>
  );
}
