import { expect, test } from "@playwright/test";
import { Pool } from "pg";
import fs from "node:fs";
import { createCipheriv, randomBytes } from "node:crypto";

function readEnvValue(key: string, fallback?: string): string {
  if (fallback) return fallback;
  for (const file of [".env", ".env.local"]) {
    try {
      const match = fs.readFileSync(file, "utf8").match(new RegExp(`^${key}="?([^"\\n]+)"?`, "m"));
      if (match) return match[1];
    } catch {
      // file missing
    }
  }
  throw new Error(`${key} غير موجود في ملفات البيئة`);
}

const pool = new Pool({ connectionString: readEnvValue("DATABASE_URL", process.env.DATABASE_URL) });
const encryptionKey = Buffer.from(readEnvValue("TOKEN_ENCRYPTION_KEY", process.env.TOKEN_ENCRYPTION_KEY), "hex");

function encryptToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return {
    tokenCiphertext: ciphertext.toString("base64"),
    tokenIv: iv.toString("base64"),
    tokenTag: cipher.getAuthTag().toString("base64"),
  };
}

const password = "OAuth-Test-Password-2026!";

test("connect requires a session, builds a valid Facebook dialog request, and stores tokens safely", async ({ page, request, context }) => {
  const anonymous = await request.get("/api/auth/facebook", { maxRedirects: 0 });
  expect(anonymous.status()).toBe(307);
  expect(anonymous.headers().location).toContain("/login");

  const forged = await request.get(`/api/auth/facebook/callback?code=abc&state=${"f".repeat(48)}.${Date.now()}`, { maxRedirects: 0 });
  expect(forged.headers().location).toContain("status=state");

  const email = `oauth-${Date.now()}@example.test`;
  await page.goto("/register");
  await page.getByLabel("الاسم الكامل").fill("مختبر الربط");
  await page.getByLabel("اسم مساحة العمل").fill("مساحة الربط");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(password);
  await page.getByRole("textbox", { name: "تأكيد كلمة المرور", exact: true }).fill(password);
  await page.getByRole("button", { name: "أنشئ حسابك" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  const start = await context.request.get("/api/auth/facebook", { maxRedirects: 0 });
  expect(start.status()).toBe(307);
  const dialog = new URL(start.headers().location ?? "");
  expect(dialog.host).toBe("www.facebook.com");
  expect(dialog.pathname).toMatch(/\/v\d+\.\d+\/dialog\/oauth$/);
  expect(dialog.searchParams.get("client_id")).toBe("400000000000000");
  expect(dialog.searchParams.get("redirect_uri")).toBe("http://127.0.0.1:3100/api/auth/facebook/callback");
  expect(dialog.searchParams.get("scope")).toContain("pages_manage_posts");
  expect(dialog.searchParams.get("scope")).toContain("instagram_content_publish");
  expect(dialog.searchParams.get("state")).toMatch(/^[a-f0-9]{48}\.\d{13}$/);
  const stateCookie = (await context.cookies()).find((cookie) => cookie.name === "madar-oauth-state");
  expect(stateCookie?.httpOnly).toBe(true);

  const userResult = await pool.query('SELECT id FROM "User" WHERE email=$1', [email]);
  const userId: string = userResult.rows[0].id;
  const workspaceResult = await pool.query('SELECT "workspaceId" FROM "Membership" WHERE "userId"=$1 LIMIT 1', [userId]);
  const workspaceId: string = workspaceResult.rows[0].workspaceId;

  const secretToken = "EAAG-oauth-test-secret-token";
  const encrypted = encryptToken(secretToken);
  const accountId = `c${Date.now().toString(36)}${randomBytes(9).toString("hex")}`;
  await pool.query(
    'INSERT INTO "SocialAccount" (id, "workspaceId", "userId", platform, "accountType", "externalId", "displayName", "tokenCiphertext", "tokenIv", "tokenTag", "tokenVersion", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,1,now())',
    [accountId, workspaceId, userId, "FACEBOOK", "PAGE", "1000999", "صفحة المختبر", encrypted.tokenCiphertext, encrypted.tokenIv, encrypted.tokenTag]
  );

  await page.goto("/dashboard/settings/accounts");
  await expect(page.getByText("صفحة المختبر")).toBeVisible();
  await expect(page.getByText(secretToken)).toHaveCount(0);
  const html = await page.content();
  expect(html).not.toContain(secretToken);

  const disconnected = await page.getByRole("button", { name: "فصل" }).first();
  await disconnected.click();
  await expect(page.getByText("صفحة المختبر")).toHaveCount(0);
  const remaining = await pool.query('SELECT count(*)::int AS count FROM "SocialAccount" WHERE id=$1', [accountId]);
  expect(remaining.rows[0].count).toBe(0);

  await pool.end();
});
