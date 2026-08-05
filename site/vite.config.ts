import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  // Absolute base so deep BrowserRouter paths (e.g. /journey/3-mapped) still
  // resolve /assets/* correctly on refresh. Pair with SPA fallback on the host.
  base: "/",
  plugins: [react(), mdx()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5174,
    open: true,
  },
  preview: {
    port: 5173,
  },
});
