import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    // mammoth — CommonJS, требует предобработки для корректной браузерной сборки
    include: ["mammoth/mammoth.browser"],
  },
  build: {
    target: "es2020",
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    commonjsOptions: {
      // mammoth.browser использует require(), нужно трансформировать
      transformMixedEsModules: true,
    },
  },
  // Vite injects these at build time — available as import.meta.env.VITE_*
  // Set them in Vercel Dashboard → Settings → Environment Variables
  envPrefix: "VITE_",
});
