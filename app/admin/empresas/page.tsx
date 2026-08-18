import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsuarioSesion } from "@/lib/alcance";
import NuevaEmpresaForm from "@/components/NuevaEmpresaForm";
import EmpresaItem from "@/components/EmpresaItem";

export default async function AdminEmpresasPage() {
  const session = await getServerSession(authOptions);
  const usuario = session?.user as any as UsuarioSesion | undefined;
  if (!usuario || usuario.rol !== "SUPER_ADMIN") redirect("/hoy");

  const empresas = await prisma.empresa.findMany({
    include: { usuarios: { select: { id: true, email: true, nombre: true, rol: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="px-4 pt-8 pb-6">
      <h1 className="font-display text-2xl mb-1">Empresas</h1>
      <p className="text-sm text-noche-400 mb-6">Crea empresas y su usuario administrador.</p>

      <NuevaEmpresaForm />

      <div className="mt-6 space-y-3">
        {empresas.length === 0 && <p className="text-sm text-noche-400">Aún no hay empresas.</p>}
        {empresas.map((e) => (
          <EmpresaItem key={e.id} empresa={e} />
        ))}
      </div>
    </div>
  );
}
