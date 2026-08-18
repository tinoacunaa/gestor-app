"use client";

import { useRouter } from "next/navigation";

type Usuario = { id: string; email: string; nombre: string | null; rol: string };
type Empresa = { id: string; nombre: string; usuarios: Usuario[] };

export default function EmpresaItem({ empresa }: { empresa: Empresa }) {
  const router = useRouter();

  async function eliminar() {
    if (
      !confirm(
        `¿Eliminar la empresa "${empresa.nombre}"? Se eliminarán también todos sus usuarios y datos.`
      )
    )
      return;
    await fetch(`/api/empresas/${empresa.id}`, { method: "DELETE" });
    router.refresh();
  }

  const admins = empresa.usuarios.filter((u) => u.rol === "ADMIN_EMPRESA");

  return (
    <div className="bg-white border border-noche-100 rounded-xl p-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium">{empresa.nombre}</p>
        <button onClick={eliminar} className="text-xs text-arcilla-400">
          Eliminar
        </button>
      </div>
      <p className="text-xs text-noche-400">
        {empresa.usuarios.length} usuario{empresa.usuarios.length !== 1 ? "s" : ""}
      </p>
      {admins.map((a) => (
        <p key={a.id} className="text-xs text-noche-400">
          Admin: {a.nombre || a.email}
        </p>
      ))}
    </div>
  );
}
