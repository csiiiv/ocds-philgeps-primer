import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import { fileURLToPath, URL } from "node:url";

// Local dev serves from the repo root, so base "/" is correct. Production
// builds (GitHub Actions) set VITE_BASE to the Pages subpath, e.g.
// "/ocds-philgeps-primer/", so that /assets/* resolve under the project page.
// We pair this with HashRouter so deep links and refreshes work on a static
// host with no SPA fallback.
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
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
