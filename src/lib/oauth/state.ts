import { randomBytes, timingSafeEqual } from "node:crypto";

export const OAUTH_STATE_COOKIE = "madar-oauth-state";
export const OAUTH_STATE_MAX_AGE = 600;

export function generateOAuthState() {
  return `${randomBytes(24).toString("hex")}.${Date.now()}`;
}

export function isOAuthStateFresh(state: string) {
  if (!/^[a-f0-9]{48}\.\d{13}$/.test(state)) return false;
  const timestamp = Number(state.split(".")[1]);
  return Number.isFinite(timestamp) && Math.abs(Date.now() - timestamp) < OAUTH_STATE_MAX_AGE * 1000;
}

export function oauthStatesMatch(expected: string | null | undefined, received: string | null | undefined) {
  if (!expected || !received || !isOAuthStateFresh(expected)) return false;
  if (expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}
