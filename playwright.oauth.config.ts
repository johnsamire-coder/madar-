import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e/oauth",
  timeout: 90_000,
  retries: 0,
  globalSetup: "./tests/e2e/oauth-server.global-setup.ts",
  use: { baseURL: "http://127.0.0.1:3100", locale: "ar-EG" },
  projects: [{ name: "msedge", use: { channel: "msedge" } }],
});
