import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";
import workshopTemplates from "../templates/workshop-templates.json";

// Local dev serves from the repo root, so base "/" is correct. Production
// builds (GitHub Actions) set VITE_BASE to the Pages subpath, e.g.
// "/ocds-philgeps-primer/", so that /assets/* resolve under the project page.
// We pair this with HashRouter so deep links and refreshes work on a static
// host with no SPA fallback.
const base = process.env.VITE_BASE ?? "/";

// Serve the original workbooks during development and emit the same bytes in
// production. The manifest is shared with the page; no duplicate copies are
// maintained in public/. Encoding matters for the blank workbook's # filename.
function workshopTemplateAssets(): Plugin {
  const templateDirectory = new URL("../templates/", import.meta.url);
  const readTemplate = (file: string) => readFileSync(new URL(encodeURIComponent(file), templateDirectory));
  return {
    name: "workshop-template-assets",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.method !== "GET" && request.method !== "HEAD") return next();
        let pathname: string;
        try { pathname = decodeURIComponent(new URL(request.url ?? "/", "http://vite.local").pathname); }
        catch { return next(); }
        const template = workshopTemplates.find(({ asset }) => pathname === `${server.config.base}templates/${asset}`);
        if (!template) return next();
        try {
          const bytes = readTemplate(template.file);
          response.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
          response.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(template.file)}`);
          response.setHeader("Content-Length", bytes.length);
          response.end(request.method === "HEAD" ? undefined : bytes);
        } catch (error) { next(error); }
      });
    },
    generateBundle() {
      for (const { file, asset } of workshopTemplates) {
        this.emitFile({ type: "asset", fileName: `templates/${asset}`, source: readTemplate(file) });
      }
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), mdx(), workshopTemplateAssets()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5174,
    open: false,
  },
  preview: {
    port: 5173,
  },
});
