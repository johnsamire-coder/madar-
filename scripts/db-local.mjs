import "dotenv/config";
import { randomBytes } from "node:crypto";
import { access, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import EmbeddedPostgres from "embedded-postgres";

const root = fileURLToPath(new URL("../", import.meta.url));
if (!process.env.DATABASE_URL) {
  const password = randomBytes(24).toString("hex");
  const databaseUrl = `postgresql://postgres:${password}@127.0.0.1:54329/madar?schema=public`;
  await writeFile(resolve(root, ".env"), `DATABASE_URL="${databaseUrl}"\nAPP_URL="http://localhost:3000"\nTRUST_PROXY="false"\n`, { flag: "wx" });
  process.env.DATABASE_URL = databaseUrl;
}

const url = new URL(process.env.DATABASE_URL);
if (url.hostname !== "127.0.0.1" || url.pathname !== "/madar" || url.username !== "postgres") {
  throw new Error("Local database launcher requires 127.0.0.1, database madar, and user postgres. Use your existing database directly otherwise.");
}

const databaseDir = resolve(root, ".local/postgres");
await mkdir(resolve(root, ".local"), { recursive: true });
const database = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password: decodeURIComponent(url.password),
  port: Number(url.port || 54329),
  persistent: true,
  authMethod: "scram-sha-256",
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  postgresFlags: ["-c", "listen_addresses=127.0.0.1"],
  onLog: () => {},
  onError: (message) => console.error(message),
});

try {
  await access(resolve(databaseDir, "PG_VERSION"));
} catch {
  await database.initialise();
}
await database.start();
const client = database.getPgClient();
await client.connect();
const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", ["madar"]);
await client.end();
if (existing.rowCount === 0) await database.createDatabase("madar");
console.log(`Local PostgreSQL ready on 127.0.0.1:${url.port || 54329}. Data is persisted in .local/postgres.`);

let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  await database.stop();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
