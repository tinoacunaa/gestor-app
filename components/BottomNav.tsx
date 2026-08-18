"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const ITEMS = [
  { href: "/hoy", label: "Hoy", icon: "☀" },
  { href: "/calendario", label: "Calendario", icon: "▦" },
  { href: "/proyectos", label: "Proyectos", icon: "◈" },
  { href: "/citas", label: "Citas", icon: "◷" },
  { href: "/cumpleanos", label: "Cumple", icon: "♥" },
  { href: "/pagos", label: "Pagos", icon: "$" },
];

function useItemsConAdmin() {
  const { data: session } = useSession();
  const rol = (session?.user as any)?.rol;
  if (rol === "SUPER_ADMIN") return [{ href: "/admin/empresas", label: "Empresas", icon: "⚙" }];
  if (rol === "ADMIN_EMPRESA") return [...ITEMS, { href: "/admin/usuarios", label: "Equipo", icon: "⚙" }];
  return ITEMS;
}

// Barra de navegación para celular: fija abajo.
export default function BottomNav() {
  const pathname = usePathname();
  const items = useItemsConAdmin();
  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-noche-100 md:hidden z-20">
      <div className="max-w-md mx-auto grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${
                active ? "text-noche-900" : "text-noche-400"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { ITEMS, useItemsConAdmin };
