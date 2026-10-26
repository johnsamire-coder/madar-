import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { facebookAuthorizationUrl, facebookConfig } from "@/lib/integrations/facebook";
import { generateOAuthState, OAUTH_STATE_COOKIE, OAUTH_STATE_MAX_AGE } from "@/lib/oauth/state";

export async function GET() {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const config = facebookConfig();
  if (!config) return NextResponse.redirect(`${appUrl}/dashboard/settings/accounts?status=config`);

  try {
    await requireUser();
  } catch {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const state = generateOAuthState();
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE,
  });
  return NextResponse.redirect(facebookAuthorizationUrl(config, state));
}
