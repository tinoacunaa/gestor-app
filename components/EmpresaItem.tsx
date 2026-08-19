"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

type Usuario = { id: string; email: string; nombre: string | null; rol: string };
type Empresa = { id: string; nombre: string; usuarios: Usuario[] };

function UsuarioRow({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(usuario.nombre || "");
  const [password, setPassword] = useState("");
  const [esAdmin, setEsAdmin] = useState(usuario.rol === "ADMIN_EMPRESA");
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        password: password || undefined,
        rol: esAdmin ? "ADMIN_EMPRESA" : "USUARIO",
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo guardar");
      return;
    }
    setPassword("");
    setEditando(false);
    router.refresh();
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="py-2 space-y-2 border-t border-noche-100">
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
        <label className="flex items-center gap-2 text-xs text-noche-600">
          <input type="checkbox" checked={esAdmin} onChange={(e) => setEsAdmin(e.target.checked)} />
          Es administrador de la empresa
        </label>
        {error && <p className="text-xs text-arcilla-400">{error}</p>}
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
    <div className="flex items-center justify-between py-1.5 border-t border-noche-100">
      <div>
        <p className="text-xs">
          {usuario.nombre || usuario.email}
          {usuario.rol === "ADMIN_EMPRESA" && <span className="text-noche-400"> · admin</span>}
        </p>
      </div>
      <button onClick={() => setEditando(true)} className="text-xs text-noche-400 underline">
        Editar
      </button>
    </div>
  );
}

export default function EmpresaItem({ empresa }: { empresa: Empresa }) {
  const router = useRouter();
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombre, setNombre] = useState(empresa.nombre);

  async function guardarNombre(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/empresas/${empresa.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    });
    setEditandoNombre(false);
    router.refresh();
  }

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

  return (
    <div className="bg-white border border-noche-100 rounded-xl p-3">
      {editandoNombre ? (
        <form onSubmit={guardarNombre} className="flex gap-2 mb-1">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="flex-1 border border-noche-100 rounded-lg px-2 py-1 text-sm"
            autoFocus
          />
          <button type="submit" className="text-xs bg-noche-900 text-white rounded-lg px-2">
            Guardar
          </button>
          <button
            type="button"
            onClick={() => {
              setNombre(empresa.nombre);
              setEditandoNombre(false);
            }}
            className="text-xs border border-noche-100 rounded-lg px-2"
          >
            Cancelar
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => setEditandoNombre(true)} className="text-sm font-medium underline decoration-dotted">
            {empresa.nombre}
          </button>
          <button onClick={eliminar} className="text-xs text-arcilla-400">
            Eliminar
          </button>
        </div>
      )}

      <p className="text-xs text-noche-400 mb-1">
        {empresa.usuarios.length} usuario{empresa.usuarios.length !== 1 ? "s" : ""}
      </p>

      {empresa.usuarios.map((u) => (
        <UsuarioRow key={u.id} usuario={u} />
      ))}
    </div>
  );
}
