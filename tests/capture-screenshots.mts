import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const password = "Review-Password-2026!";
const uniqueEmail = () => `review-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@example.test`;
const base = process.env.APP_URL ?? "http://127.0.0.1:3000";
const outDir = ".local/screenshots";

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]] as const) {
  const context = await browser.newContext({ viewport, locale: "ar-EG" });
  const page = await context.newPage();
  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${outDir}/${name}-login.png` });
  await page.goto(`${base}/register`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${outDir}/${name}-register.png` });
  await page.getByLabel("الاسم الكامل").fill("مراجع التصميم");
  await page.getByLabel("اسم مساحة العمل").fill("مساحة المراجعة");
  await page.getByLabel("البريد الإلكتروني").fill(uniqueEmail());
  await page.getByLabel("كلمة المرور", { exact: true }).fill(password);
  await page.getByRole("textbox", { name: "تأكيد كلمة المرور", exact: true }).fill(password);
  await page.getByRole("button", { name: "أنشئ حسابك" }).click();
  await page.waitForURL("**/dashboard", { timeout: 60_000 }).catch(async () => {
    await page.screenshot({ path: `${outDir}/failure-${name}.png`, fullPage: true });
    throw new Error(`registration did not reach dashboard: ${page.url()}`);
  });
  await page.getByRole("button", { name: "دليل البداية" }).first().click();
  await page.getByRole("dialog").waitFor();
  await page.screenshot({ path: `${outDir}/${name}-guide.png` });
  await page.keyboard.press("Escape");
  await page.screenshot({ path: `${outDir}/${name}-dashboard.png`, fullPage: true });
  await context.close();
}
await browser.close();
console.log(`Screenshots saved in ${outDir}`);
