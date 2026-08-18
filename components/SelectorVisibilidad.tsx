"use client";

import { useSession } from "next-auth/react";

export default function SelectorVisibilidad({
  value,
  onChange,
}: {
  value: "PRIVADO" | "EMPRESA";
  onChange: (v: "PRIVADO" | "EMPRESA") => void;
}) {
  const { data: session } = useSession();
  const empresaId = (session?.user as any)?.empresaId;

  // Si el usuario no pertenece a ninguna empresa, no tiene sentido mostrar
  // la opción: todo lo suyo es privado por definición.
  if (!empresaId) return null;

  return (
    <label className="flex items-center gap-2 text-sm text-noche-600">
      <input
        type="checkbox"
        checked={value === "EMPRESA"}
        onChange={(e) => onChange(e.target.checked ? "EMPRESA" : "PRIVADO")}
      />
      Compartir con mi empresa
    </label>
  );
}
