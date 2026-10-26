import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const KEY_VERSION = 1;

function encryptionKey() {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key || !/^[a-f0-9]{64}$/.test(key)) {
    throw new Error("TOKEN_ENCRYPTION_KEY لازم يكون ٦٤ حرفًا سداسيًا (٣٢ بايت). شغّل: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
  }
  return Buffer.from(key, "hex");
}

export function encryptToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return {
    tokenCiphertext: ciphertext.toString("base64"),
    tokenIv: iv.toString("base64"),
    tokenTag: cipher.getAuthTag().toString("base64"),
    tokenVersion: KEY_VERSION,
  };
}

export function decryptToken(record: { tokenCiphertext: string; tokenIv: string; tokenTag: string; tokenVersion: number }) {
  if (record.tokenVersion !== KEY_VERSION) throw new Error("نسخة تشفير التوكن غير مدعومة.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(record.tokenIv, "base64"));
  decipher.setAuthTag(Buffer.from(record.tokenTag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(record.tokenCiphertext, "base64")), decipher.final()]).toString("utf8");
}
