"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useItemsConAdmin } from "@/components/BottomNav";

// Barra de navegación para laptop: fija arriba, como un header.
export default function TopNav() {
  const pathname = usePathname();
  const items = useItemsConAdmin();
  if (pathname === "/login") return null;

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 items-center gap-1 bg-noche-50/95 backdrop-blur border-b border-noche-100 px-4 py-3 z-20">
      <div className="max-w-4xl mx-auto w-full flex items-center gap-1">
        <span className="font-display text-lg mr-6">Gestor</span>
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm px-3 py-1.5 rounded-lg ${
                active ? "bg-noche-900 text-white" : "text-noche-400 hover:text-noche-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
