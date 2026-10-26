import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";

export async function consumeAuthAttempt(key: string, limit: number) {
  const digest = createHash("sha256").update(key).digest("hex");
  const rows = await db.$queryRaw<{ attempts: number }[]>`
    INSERT INTO "AuthRateLimit" ("key", "attempts", "windowStart")
    VALUES (${digest}, 1, NOW())
    ON CONFLICT ("key") DO UPDATE SET
      "attempts" = CASE
        WHEN "AuthRateLimit"."windowStart" < NOW() - INTERVAL '15 minutes' THEN 1
        ELSE "AuthRateLimit"."attempts" + 1
      END,
      "windowStart" = CASE
        WHEN "AuthRateLimit"."windowStart" < NOW() - INTERVAL '15 minutes' THEN NOW()
        ELSE "AuthRateLimit"."windowStart"
      END
    RETURNING "attempts"
  `;
  return rows[0].attempts <= limit;
}
