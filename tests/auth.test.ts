import assert from "node:assert/strict";
import { test } from "node:test";
import { loginSchema, registerSchema } from "../src/lib/auth/validation";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { generateSession, hashToken, SESSION_SECONDS } from "../src/lib/auth/tokens";

const registration = {
  name: "صاحب الحساب",
  workspaceName: "مساحة التجربة",
  email: "  OWNER@EXAMPLE.COM  ",
  password: "An-example-password-2026",
  confirmPassword: "An-example-password-2026",
};

test("registration validates and normalizes email and names", () => {
  const result = registerSchema.parse({ ...registration, name: "  صاحب الحساب  " });
  assert.equal(result.email, "owner@example.com");
  assert.equal(result.name, "صاحب الحساب");
});

test("short passwords and mismatched confirmation are rejected", () => {
  assert.equal(registerSchema.safeParse({ ...registration, password: "short", confirmPassword: "short" }).success, false);
  const result = registerSchema.safeParse({ ...registration, confirmPassword: "something-else" });
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.error.flatten().fieldErrors.confirmPassword);
});

test("bcrypt byte limit applies to multibyte passwords on both forms", () => {
  const password = "ع".repeat(37);
  assert.equal(registerSchema.safeParse({ ...registration, password, confirmPassword: password }).success, false);
  assert.equal(loginSchema.safeParse({ email: "a@example.com", password }).success, false);
});

test("invalid email, blank names, and file-like fields are rejected", () => {
  assert.equal(registerSchema.safeParse({ ...registration, email: "invalid" }).success, false);
  assert.equal(registerSchema.safeParse({ ...registration, name: "   " }).success, false);
  assert.equal(registerSchema.safeParse({ ...registration, workspaceName: " " }).success, false);
  assert.equal(registerSchema.safeParse({ ...registration, email: { value: "a@example.com" } }).success, false);
});

test("password hashes are salted and never equal plaintext", async () => {
  const first = await hashPassword(registration.password);
  const second = await hashPassword(registration.password);
  assert.notEqual(first, second);
  assert.notEqual(first, registration.password);
  assert.equal(await verifyPassword(registration.password, first), true);
  assert.equal(await verifyPassword("incorrect-password", first), false);
  assert.equal(await verifyPassword(registration.password), false);
});

test("session tokens are random, hashed, and expire in seven days", () => {
  const first = generateSession();
  const second = generateSession();
  assert.match(first.token, /^[a-f0-9]{64}$/);
  assert.notEqual(first.token, second.token);
  assert.notEqual(first.tokenHash, first.token);
  assert.equal(first.tokenHash, hashToken(first.token));
  assert.ok(Math.abs(first.expiresAt.getTime() - Date.now() - SESSION_SECONDS * 1000) < 1000);
});
