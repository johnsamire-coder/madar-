import "server-only";
import { createHmac } from "node:crypto";

const GRAPH_VERSION = "v26.0";

export type FacebookConfig = { appId: string; appSecret: string; redirectUri: string };
export type FacebookPage = { id: string; name: string; category?: string; tasks?: string[]; pic?: { url?: string }; access_token: string };
export type FacebookProfile = { id: string; name: string };
export type LongLivedToken = { token: string; expiresAt: Date | null };

export function facebookConfig(): FacebookConfig | null {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) return null;
  let appUrl: URL;
  try {
    appUrl = new URL(process.env.APP_URL ?? "http://localhost:3000");
  } catch {
    return null;
  }
  return { appId, appSecret, redirectUri: `${appUrl.origin}/api/auth/facebook/callback` };
}

export function facebookAuthorizationUrl(config: FacebookConfig, state: string) {
  const parameters = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    state,
  });
  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${parameters}`;
}

function appSecretProof(secret: string, accessToken: string) {
  return createHmac("sha256", secret).update(accessToken).digest("hex");
}

async function graphJson(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(15_000) });
  const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (!response.ok || payload?.error) {
    const error = payload?.error as { message?: string } | undefined;
    throw new Error(error?.message ?? `فشل الاتصال بفيسبوك (رمز ${response.status}).`);
  }
  return payload ?? {};
}

export async function exchangeCodeForLongLivedToken(config: FacebookConfig, code: string): Promise<LongLivedToken> {
  const baseParameters = new URLSearchParams({ client_id: config.appId, redirect_uri: config.redirectUri });
  const codeExchange = await graphJson(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token?${new URLSearchParams({
    ...Object.fromEntries(baseParameters),
    client_secret: config.appSecret,
    code,
  })}`);
  const shortToken = String(codeExchange.access_token ?? "");
  if (!shortToken) throw new Error("فيسبوك لم يرسل رمز وصول صالح.");

  const appToken = await graphJson(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token?${new URLSearchParams({
    grant_type: "client_credentials",
    appid: config.appId,
    secret: config.appSecret,
  })}`);
  const proof = appSecretProof(config.appSecret, shortToken);

  const exchanged = await graphJson(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token?${new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: shortToken,
    appsecret_proof: proof,
  })}`);
  const longToken = String(exchanged.access_token ?? "");
  if (!longToken) throw new Error("تعذّر الحصول على رمز طويل العمر من فيسبوك.");

  let expiresAt: Date | null = exchanged.expires_in ? new Date(Date.now() + Number(exchanged.expires_in) * 1000) : null;
  if (!expiresAt) {
    const debug = await graphJson(`https://graph.facebook.com/${GRAPH_VERSION}/debug_token?${new URLSearchParams({
      input_token: longToken,
      access_token: String(appToken.access_token ?? ""),
    })}`).catch(() => ({ data: null }));
    const data = debug.data as { expires_at?: number } | null;
    if (data?.expires_at) expiresAt = new Date(data.expires_at * 1000);
  }
  return { token: longToken, expiresAt };
}

export async function fetchFacebookProfile(config: FacebookConfig, accessToken: string): Promise<FacebookProfile> {
  const profile = await graphJson(`https://graph.facebook.com/${GRAPH_VERSION}/me?${new URLSearchParams({
    fields: "id,name",
    access_token: accessToken,
    appsecret_proof: appSecretProof(config.appSecret, accessToken),
  })}`);
  if (!profile.id) throw new Error("تعذّر قراءة بيانات حساب فيسبوك.");
  return { id: String(profile.id), name: String(profile.name ?? "حساب فيسبوك") };
}

export async function fetchFacebookPages(config: FacebookConfig, accessToken: string): Promise<FacebookPage[]> {
  let url = `https://graph.facebook.com/${GRAPH_VERSION}/me/accounts?${new URLSearchParams({
    fields: "id,name,category,tasks,picture{url}",
    limit: "200",
    access_token: accessToken,
    appsecret_proof: appSecretProof(config.appSecret, accessToken),
  })}`;
  const pages: FacebookPage[] = [];
  const seen = new Set<string>();

  while (url && !seen.has(url)) {
    seen.add(url);
    const response = await graphJson(url) as { data?: unknown[]; paging?: { next?: string } };
    for (const item of response.data ?? []) {
      const page = item as Partial<FacebookPage>;
      if (page.id && page.name && page.access_token) {
        pages.push({ id: String(page.id), name: String(page.name), category: page.category, tasks: page.tasks, pic: page.pic, access_token: String(page.access_token) });
      }
    }
    url = response.paging?.next ? String(response.paging.next).replace(/^http:/, "https:") : "";
  }
  return pages;
}
