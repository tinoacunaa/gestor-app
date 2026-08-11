import type { Config } from "tailwindcss";

// Paleta propia: azul noche + verde salvia (proyectos en curso) + ámbar (alertas)
// en vez del terracota/crema genérico. Pensada para uso rápido en celular:
// alto contraste, pocos colores, cada color tiene un significado fijo.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        noche: {
          50: "#f1f3f8",
          100: "#dde2ee",
          400: "#5b6b96",
          600: "#324066",
          800: "#1c2440",
          900: "#11162b",
        },
        salvia: {
          50: "#eef6ef",
          100: "#d3e9d6",
          400: "#5e9c68",
          600: "#3d7a48",
          700: "#2f5f38",
        },
        ambar: {
          50: "#fbf1e2",
          100: "#f3dcaf",
          400: "#d99a2b",
          600: "#a9740f",
        },
        arcilla: {
          50: "#fbeeec",
          400: "#c9634f",
          600: "#a1462f",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
