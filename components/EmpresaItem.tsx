"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

type Usuario = { id: string; email: string; nombre: string | null; rol: string };
type Empresa = { id: string; nombre: string; usuarios: Usuario[] };

function AdminRow({ admin }: { admin: Usuario }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(admin.nombre || "");
  const [password, setPassword] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/usuarios/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, password: password || undefined }),
    });
    setPassword("");
    setEditando(false);
    router.refresh();
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="mt-2 space-y-2 border-t border-noche-100 pt-2">
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border border-noche-100 rounded-lg px-3 py-1.5 text-xs"
        />
        <PasswordInput
          placeholder="Nueva contraseña (opcional)"
          value={password}
          onChange={setPassword}
          className="w-full border border-noche-100 rounded-lg px-3 py-1.5 text-xs"
        />
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditando(false)} className="flex-1 border border-noche-100 rounded-lg py-1.5 text-xs">
            Cancelar
          </button>
          <button type="submit" className="flex-1 bg-noche-900 text-white rounded-lg py-1.5 text-xs">
            Guardar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-noche-400">Admin: {admin.nombre || admin.email}</p>
      <button onClick={() => setEditando(true)} className="text-xs text-noche-400 underline">
        Editar
      </button>
    </div>
  );
}

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
      <p className="text-xs text-noche-400 mb-1">
        {empresa.usuarios.length} usuario{empresa.usuarios.length !== 1 ? "s" : ""}
      </p>
      {admins.map((a) => (
        <AdminRow key={a.id} admin={a} />
      ))}
    </div>
  );
}
