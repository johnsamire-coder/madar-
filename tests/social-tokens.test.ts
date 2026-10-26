import assert from "node:assert/strict";
import { test } from "node:test";
import { randomBytes } from "node:crypto";

process.env.TOKEN_ENCRYPTION_KEY ??= randomBytes(32).toString("hex");

import { decryptToken, encryptToken } from "../src/lib/tokens/encryption";
import { generateOAuthState, isOAuthStateFresh, oauthStatesMatch } from "../src/lib/oauth/state";

test("access tokens round-trip through AES-256-GCM without exposing plaintext", () => {
  const token = "EAAG" + randomBytes(24).toString("hex");
  const encrypted = encryptToken(token);
  assert.notEqual(encrypted.tokenCiphertext, token);
  assert.equal(encrypted.tokenVersion, 1);
  assert.equal(decryptToken(encrypted), token);
  assert.equal(decryptToken(encryptToken("صفحة-عربية-تجربة")), "صفحة-عربية-تجربة");
});

test("tampered ciphertext or foreign key is rejected", () => {
  const encrypted = encryptToken("secret-token-value");
  const tampered = { ...encrypted, tokenCiphertext: Buffer.from("x" + Buffer.from(encrypted.tokenCiphertext, "base64").toString("binary")).toString("base64") };
  assert.throws(() => decryptToken(tampered));
  assert.throws(() => decryptToken({ ...encrypted, tokenTag: randomBytes(16).toString("base64") }));
  assert.throws(() => decryptToken({ ...encrypted, tokenVersion: 2 }), /نسخة تشفير/);
});

test("missing or weak encryption key fails loudly", async () => {
  const previous = process.env.TOKEN_ENCRYPTION_KEY;
  try {
    delete process.env.TOKEN_ENCRYPTION_KEY;
    assert.throws(() => encryptToken("token"), /TOKEN_ENCRYPTION_KEY/);
    process.env.TOKEN_ENCRYPTION_KEY = "short";
    assert.throws(() => encryptToken("token"), /TOKEN_ENCRYPTION_KEY/);
  } finally {
    process.env.TOKEN_ENCRYPTION_KEY = previous;
  }
});

test("oauth state is random, time-limited and compared in constant time", () => {
  const first = generateOAuthState();
  const second = generateOAuthState();
  assert.match(first, /^[a-f0-9]{48}\.\d{13}$/);
  assert.notEqual(first, second);
  assert.equal(isOAuthStateFresh(first), true);
  assert.equal(oauthStatesMatch(first, first), true);
  assert.equal(oauthStatesMatch(first, second), false);
  assert.equal(oauthStatesMatch(first, undefined), false);
  assert.equal(oauthStatesMatch(null, first), false);
  assert.equal(oauthStatesMatch("z".repeat(48) + "." + Date.now(), "z".repeat(48) + "." + Date.now()), false);
  assert.equal(isOAuthStateFresh("a".repeat(48) + "." + (Date.now() - 11 * 60 * 1000)), false);
});
