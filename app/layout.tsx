import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import Providers from "./providers";
import CerrarSesionBoton from "@/components/CerrarSesionBoton";

export const metadata: Metadata = {
  title: "Gestor",
  description: "Proyectos, agenda, cumpleaños y pagos en un solo lugar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ ["--font-display" as any]: "'Fraunces'", ["--font-sans" as any]: "'Inter'" }}>
        <Providers>
          <CerrarSesionBoton />
          <TopNav />
          <div className="max-w-md mx-auto md:max-w-4xl min-h-screen pb-20 md:pb-6 md:pt-20">
            {children}
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
