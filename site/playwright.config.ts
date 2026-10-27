import { defineConfig } from "@playwright/test";

const baseURL = process.env.PRIMER_TEST_URL ?? "http://127.0.0.1:5184";
export default defineConfig({
  testDir: "./tests", fullyParallel: true, workers: 2,
  use: {
    baseURL, trace: "retain-on-failure",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {},
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: process.env.PRIMER_TEST_URL ? undefined : {
    command: "npm run dev -- --host 127.0.0.1 --port 5184 --strictPort",
    url: baseURL, reuseExistingServer: !process.env.CI,
  },
});
