import { spawn } from "node:child_process";
import path from "node:path";

export const OAUTH_TEST_URL = "http://127.0.0.1:3100";

const nextBin = path.resolve(process.cwd(), "node_modules", "next", "dist", "bin", "next");

function stopTree(pid: number) {
  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore" });
    killer.on("error", () => { /* already stopped */ });
  } else {
    try {
      process.kill(-pid);
    } catch {
      /* already stopped */
    }
  }
}

export default async function globalSetup() {
  const server = spawn(process.execPath, [nextBin, "dev", "--hostname", "127.0.0.1", "--port", "3100"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXT_DIST_DIR: ".next-oauth",
      APP_URL: OAUTH_TEST_URL,
      FACEBOOK_APP_ID: "400000000000000",
      FACEBOOK_APP_SECRET: "test-app-secret-not-real",
    },
    stdio: "ignore",
    detached: true,
  });

  try {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        const response = await fetch(`${OAUTH_TEST_URL}/login`, { signal: AbortSignal.timeout(2000) });
        if (response.ok) break;
      } catch {
        // server still compiling
      }
      if (attempt === 59) throw new Error("test oauth server did not start");
    }
    return async () => stopTree(server.pid as number);
  } catch (error) {
    stopTree(server.pid as number);
    throw error;
  }
}
