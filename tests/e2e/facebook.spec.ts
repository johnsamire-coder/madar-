import { expect, test } from "@playwright/test";

const appUrl = process.env.APP_URL ?? "http://127.0.0.1:3000";

test("facebook connect stays safe when app credentials are incomplete", async ({ request }) => {
  const protectedPage = await request.get(`${appUrl}/dashboard/settings/accounts`, { maxRedirects: 0 });
  expect(protectedPage.status()).toBe(307);
  expect(protectedPage.headers().location).toContain("/login");

  const noSecret = await request.get(`${appUrl}/api/auth/facebook`, { maxRedirects: 0 });
  expect(noSecret.status()).toBe(307);
  expect(noSecret.headers().location).toContain("status=config");

  const noState = await request.get(`${appUrl}/api/auth/facebook/callback`, { maxRedirects: 0 });
  expect(noState.status()).toBe(307);
  expect(noState.headers().location).toContain("status=config");
});
