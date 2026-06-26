import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marca: "#2563eb",
        marcaOscuro: "#1e40af",
      },
    },
  },
  plugins: [],
};
export default config;
