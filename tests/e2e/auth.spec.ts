import { expect, test } from "@playwright/test";

const password = "Strong-Local-Pass-2026!";

function uniqueEmail() {
  return `owner-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@example.test`;
}

async function register(page: import("@playwright/test").Page, email: string) {
  await page.goto("/register");
  await page.getByLabel("الاسم الكامل").fill("مالك التجربة");
  await page.getByLabel("اسم مساحة العمل").fill("مساحة التجربة");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(password);
  await page.getByRole("textbox", { name: "تأكيد كلمة المرور", exact: true }).fill(password);
  await page.getByRole("button", { name: "أنشئ حسابك" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("signup, protected dashboard, reload, settings, logout and login work end to end", async ({ page }) => {
  const email = uniqueEmail();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);

  await register(page, email);
  await expect(page.getByText("مساحة التجربة").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "كل حضورك، في مكان واحد." })).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.getByRole("link", { name: /إعدادات الحساب/ }).first().click();
  await expect(page.getByRole("textbox", { name: "البريد الإلكتروني", exact: true })).toHaveValue(email);

  await page.getByRole("button", { name: "تسجيل الخروج" }).first().click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(password);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("duplicate signup and bad login reveal no secret details", async ({ page }) => {
  const email = uniqueEmail();
  await register(page, email);
  await page.getByRole("button", { name: "تسجيل الخروج" }).first().click();

  await page.goto("/register");
  await page.getByLabel("الاسم الكامل").fill("مكرر");
  await page.getByLabel("اسم مساحة العمل").fill("مساحة مكررة");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(password);
  await page.getByRole("textbox", { name: "تأكيد كلمة المرور", exact: true }).fill(password);
  await page.getByRole("button", { name: "أنشئ حسابك" }).click();
  await expect(page.locator(".form-error")).toContainText("تعذّر إنشاء الحساب");

  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill("wrong-password-1234!");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page.locator(".form-error")).toContainText("البريد الإلكتروني أو كلمة المرور مش صح.");
});
