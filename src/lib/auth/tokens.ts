import { createHash, randomBytes } from "node:crypto";

export const SESSION_SECONDS = 60 * 60 * 24 * 7;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSession() {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + SESSION_SECONDS * 1000),
  };
}
