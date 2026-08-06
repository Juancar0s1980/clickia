import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    // 5173 es el puerto por defecto de Vite y ya lo usa otro proyecto local
    // (monorepo_lairn) via Docker; se fija a 5180 para no chocar con el.
    port: 5180,
    strictPort: true,
  },
});
