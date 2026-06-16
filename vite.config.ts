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
  build: {
    target: "es2020",
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
  },
  // Vite injects these at build time — available as import.meta.env.VITE_*
  // Set them in Vercel Dashboard → Settings → Environment Variables
  envPrefix: "VITE_",
});
