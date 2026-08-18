import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsuarioSesion } from "@/lib/alcance";
import NuevoUsuarioForm from "@/components/NuevoUsuarioForm";
import UsuarioItem from "@/components/UsuarioItem";

export default async function AdminUsuariosPage() {
  const session = await getServerSession(authOptions);
  const usuario = session?.user as any as UsuarioSesion | undefined;
  if (!usuario || usuario.rol !== "ADMIN_EMPRESA" || !usuario.empresaId) redirect("/hoy");

  const usuarios = await prisma.usuario.findMany({
    where: { empresaId: usuario.empresaId },
    select: { id: true, email: true, nombre: true, rol: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="px-4 pt-8 pb-6">
      <h1 className="font-display text-2xl mb-1">Usuarios de mi empresa</h1>
      <p className="text-sm text-noche-400 mb-6">Crea y administra las cuentas de tu equipo.</p>

      <NuevoUsuarioForm />

      <div className="mt-6 space-y-3">
        {usuarios.length === 0 && <p className="text-sm text-noche-400">Aún no hay usuarios.</p>}
        {usuarios.map((u) => (
          <UsuarioItem key={u.id} usuario={u} propioId={usuario.id} />
        ))}
      </div>
    </div>
  );
}
