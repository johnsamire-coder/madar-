import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { consumeAuthAttempt } from "@/lib/auth/rate-limit";
import { exchangeCodeForLongLivedToken, facebookConfig, fetchFacebookPages, fetchFacebookProfile } from "@/lib/integrations/facebook";
import { oauthStatesMatch, OAUTH_STATE_COOKIE } from "@/lib/oauth/state";
import { encryptToken } from "@/lib/tokens/encryption";

function back(status: string) {
  return NextResponse.redirect(`${process.env.APP_URL ?? "http://localhost:3000"}/dashboard/settings/accounts?status=${status}`);
}

export async function GET(request: Request) {
  const config = facebookConfig();
  if (!config) return back("config");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const denied = url.searchParams.get("error_reason") ?? url.searchParams.get("error");
  if (denied) return back(denied === "access_denied" ? "cancelled" : "failed");
  if (!code || !state) return back("failed");

  const cookieStore = await cookies();
  const savedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);
  if (!oauthStatesMatch(savedState, state)) return back("state");

  const user = await getCurrentUser();
  if (!user) return back("expired");
  const workspaceId = user.memberships[0]?.workspace.id;
  if (!workspaceId) return back("expired");

  if (!(await consumeAuthAttempt(`facebook-callback:${workspaceId}`, 10))) return back("limit");

  try {
    const { token, expiresAt } = await exchangeCodeForLongLivedToken(config, code);
    await fetchFacebookProfile(config, token);
    const pages = await fetchFacebookPages(config, token);

    await db.$transaction([
      db.socialAccount.deleteMany({ where: { workspaceId, platform: "FACEBOOK", externalId: { notIn: pages.map((page) => page.id) } } }),
      ...pages.map((page) => db.socialAccount.upsert({
        where: { workspaceId_platform_externalId: { workspaceId, platform: "FACEBOOK", externalId: page.id } },
        create: {
          workspaceId, userId: user.id, platform: "FACEBOOK", accountType: "PAGE",
          externalId: page.id, displayName: page.name, pictureUrl: page.pic?.url ?? null,
          longLivedTokenExpires: expiresAt,
          ...encryptToken(page.access_token),
        },
        update: {
          userId: user.id, displayName: page.name, pictureUrl: page.pic?.url ?? null,
          longLivedTokenExpires: expiresAt,
          ...encryptToken(page.access_token),
        },
      })),
    ]);
    return back(pages.length ? "connected" : "nopages");
  } catch (error) {
    console.error("Facebook OAuth callback failed:", error instanceof Error ? error.message : error);
    return back("failed");
  }
}
