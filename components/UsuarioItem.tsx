"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

type Usuario = { id: string; email: string; nombre: string | null; rol: string };

export default function UsuarioItem({ usuario, propioId }: { usuario: Usuario; propioId: string }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(usuario.nombre || "");
  const [password, setPassword] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, password: password || undefined }),
    });
    setPassword("");
    setEditando(false);
    router.refresh();
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar al usuario "${usuario.nombre || usuario.email}"?`)) return;
    await fetch(`/api/usuarios/${usuario.id}`, { method: "DELETE" });
    router.refresh();
  }

  if (editando) {
    return (
      <form onSubmit={guardar} className="bg-white border border-noche-100 rounded-xl p-3 space-y-3">
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
        />
        <PasswordInput
          placeholder="Nueva contraseña (opcional)"
          value={password}
          onChange={setPassword}
        />
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditando(false)} className="flex-1 border border-noche-100 rounded-lg py-2 text-sm">
            Cancelar
          </button>
          <button type="submit" className="flex-1 bg-noche-900 text-white rounded-lg py-2 text-sm">
            Guardar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="bg-white border border-noche-100 rounded-xl p-3 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{usuario.nombre || usuario.email}</p>
        <p className="text-xs text-noche-400">{usuario.email}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setEditando(true)} className="text-xs text-noche-400">
          Editar
        </button>
        {usuario.id !== propioId && (
          <button onClick={eliminar} className="text-xs text-arcilla-400">
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
