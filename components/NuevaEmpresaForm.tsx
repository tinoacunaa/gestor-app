"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

export default function NuevaEmpresaForm() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nombreEmpresa: "",
    nombreAdmin: "",
    emailAdmin: "",
    passwordAdmin: "",
  });

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");
    const res = await fetch("/api/empresas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEnviando(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "No se pudo crear la empresa");
      return;
    }
    setForm({ nombreEmpresa: "", nombreAdmin: "", emailAdmin: "", passwordAdmin: "" });
    setAbierto(false);
    router.refresh();
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="w-full border border-dashed border-noche-200 rounded-xl py-3 text-sm text-noche-400"
      >
        + Nueva empresa
      </button>
    );
  }

  return (
    <form onSubmit={crear} className="bg-white border border-noche-100 rounded-xl p-3 space-y-3">
      <input
        required
        placeholder="Nombre de la empresa"
        value={form.nombreEmpresa}
        onChange={(e) => setForm({ ...form, nombreEmpresa: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      />
      <p className="text-xs text-noche-400 pt-1">Usuario administrador de la empresa</p>
      <input
        placeholder="Nombre (opcional)"
        value={form.nombreAdmin}
        onChange={(e) => setForm({ ...form, nombreAdmin: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      />
      <input
        required
        type="email"
        placeholder="Email"
        value={form.emailAdmin}
        onChange={(e) => setForm({ ...form, emailAdmin: e.target.value })}
        className="w-full border border-noche-100 rounded-lg px-3 py-2 text-sm"
      />
      <PasswordInput
        required
        placeholder="Contraseña"
        value={form.passwordAdmin}
        onChange={(v) => setForm({ ...form, passwordAdmin: v })}
      />
      {error && <p className="text-xs text-arcilla-400">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setAbierto(false)} className="flex-1 border border-noche-100 rounded-lg py-2 text-sm">
          Cancelar
        </button>
        <button type="submit" disabled={enviando} className="flex-1 bg-noche-900 text-white rounded-lg py-2 text-sm disabled:opacity-50">
          Crear empresa
        </button>
      </div>
    </form>
  );
}
