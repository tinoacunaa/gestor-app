"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Correo o contraseña incorrectos.");
    else router.push("/hoy");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="font-display text-2xl text-noche-900 mb-6">Gestor</h1>
        <div>
          <label className="block text-sm text-noche-400 mb-1">Correo</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-noche-100 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-noche-400 mb-1">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-noche-100 rounded-lg px-3 py-2"
          />
        </div>
        {error && <p className="text-arcilla-400 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-noche-900 text-white rounded-lg py-2.5 font-medium">
          Entrar
        </button>
      </form>
    </div>
  );
}
