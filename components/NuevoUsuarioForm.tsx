"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

export default function NuevoUsuarioForm() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEnviando(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo crear el usuario");
      return;
    }
    setForm({ nombre: "", email: "", password: "" });
    setAbierto(false);
    router.refresh();
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="w-full border border-dashed border-noche-200 rounded-xl py-3 text-sm text-noche-400"
      >
        + Nuevo usuario
      </button>
    );
  }

  return (
    <form onSubmit={crear} className="bg-white border border-noche-100 rounded-xl p-3 space-y-3">
      <input
        placeholder="Nombre (opcional)"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      />
      <input
        required
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      />
      <PasswordInput
        required
        placeholder="Contraseña"
        value={form.password}
        onChange={(v) => setForm({ ...form, password: v })}
      />
      {error && <p className="text-xs text-arcilla-400">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setAbierto(false)} className="flex-1 border border-noche-100 rounded-lg py-2 text-sm">
          Cancelar
        </button>
        <button type="submit" disabled={enviando} className="flex-1 bg-noche-900 text-white rounded-lg py-2 text-sm disabled:opacity-50">
          Crear usuario
        </button>
      </div>
    </form>
  );
}
