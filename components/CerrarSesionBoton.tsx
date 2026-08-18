"use client";

import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function CerrarSesionBoton() {
  const pathname = usePathname();
  const { data: session } = useSession();
  if (pathname === "/login" || !session) return null;

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="fixed top-3 right-3 md:top-3.5 z-30 text-xs bg-white border border-noche-100 rounded-full px-3 py-1.5 text-noche-400 shadow-sm"
    >
      Cerrar sesión
    </button>
  );
}
