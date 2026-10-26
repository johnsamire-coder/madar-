"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { consumeAuthAttempt } from "@/lib/auth/rate-limit";

export type DisconnectResult = { ok: boolean; error?: string };

export async function disconnectAccountAction(accountId: string): Promise<DisconnectResult> {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("host");
  if (!origin || !host || new URL(origin).host !== host) return { ok: false, error: "الطلب غير مسموح." };

  const user = await getCurrentUser();
  const workspaceId = user?.memberships[0]?.workspace.id;
  if (!user || !workspaceId) return { ok: false, error: "لازم تسجّل الدخول الأول." };
  if (!(await consumeAuthAttempt(`disconnect:${workspaceId}`, 30))) return { ok: false, error: "محاولات كتير، استنى شوية." };
  if (typeof accountId !== "string" || !/^c[a-z0-9]{20,32}$/.test(accountId)) return { ok: false, error: "معرّف الحساب غير صالح." };

  await db.socialAccount.deleteMany({ where: { id: accountId, workspaceId } });
  revalidatePath("/dashboard/settings/accounts");
  revalidatePath("/dashboard");
  return { ok: true };
}
