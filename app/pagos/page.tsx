import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NuevoPagoForm from "@/components/NuevoPagoForm";
import PagoItem from "@/components/PagoItem";

export default async function PagosPage() {
  const session = await getServerSession(authOptions);
  const usuarioId = (session!.user as any).id;
  const pagos = await prisma.pago.findMany({ where: { usuarioId }, orderBy: { fechaVencimiento: "asc" } });

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="font-display text-2xl mb-6">Pagos</h1>
      <ul className="space-y-2 mb-4">
        {pagos.map((p) => (
          <li key={p.id}>
            <PagoItem pago={p} />
          </li>
        ))}
        {pagos.length === 0 && <p className="text-sm text-noche-400">No tienes pagos registrados.</p>}
      </ul>
      <NuevoPagoForm />
    </div>
  );
}
