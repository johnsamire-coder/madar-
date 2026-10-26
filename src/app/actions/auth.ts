"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateSession } from "@/lib/auth/tokens";
import { clearSession, setSessionCookie } from "@/lib/auth/session";
import { consumeAuthAttempt } from "@/lib/auth/rate-limit";
import { loginSchema, registerSchema } from "@/lib/auth/validation";

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function isSameOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function allowedAttempt(action: "register" | "login", email: string) {
  const requestHeaders = await headers();
  const trustProxy = process.env.TRUST_PROXY === "true";
  const ip = trustProxy ? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown" : "local";
  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeAuthAttempt(`${action}:ip:${ip}`, trustProxy ? 30 : 100),
    consumeAuthAttempt(`${action}:email:${email}`, 10),
  ]);
  return ipAllowed && emailAllowed;
}

const unavailable = { error: "مش قادرين نتصل بالخدمة دلوقتي. حاول كمان شوية." };
const tooManyAttempts = { error: "محاولات كتير في وقت قصير. استنى ١٥ دقيقة وجرّب تاني." };
const invalidOrigin = { error: "الطلب غير مسموح. افتح الموقع من عنوانه الأصلي وحاول تاني." };

export async function registerAction(_previous: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!(await isSameOrigin())) return invalidOrigin;
  const result = registerSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { fieldErrors: result.error.flatten().fieldErrors };

  let token: string;
  try {
    if (!(await allowedAttempt("register", result.data.email))) return tooManyAttempts;
    const passwordHash = await hashPassword(result.data.password);
    const session = generateSession();
    await db.user.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        passwordHash,
        memberships: {
          create: { role: "OWNER", workspace: { create: { name: result.data.workspaceName } } },
        },
        sessions: { create: { tokenHash: session.tokenHash, expiresAt: session.expiresAt } },
      },
    });
    token = session.token;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "تعذّر إنشاء الحساب بهذه البيانات. لو عندك حساب، جرّب تسجيل الدخول." };
    }
    return unavailable;
  }
  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function loginAction(_previous: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!(await isSameOrigin())) return invalidOrigin;
  const result = loginSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { fieldErrors: result.error.flatten().fieldErrors };

  let token: string;
  try {
    if (!(await allowedAttempt("login", result.data.email))) return tooManyAttempts;
    const user = await db.user.findUnique({ where: { email: result.data.email } });
    const valid = await verifyPassword(result.data.password, user?.passwordHash);
    if (!user || !valid) return { error: "البريد الإلكتروني أو كلمة المرور مش صح." };
    const session = generateSession();
    await db.$transaction([
      db.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } }),
      db.session.create({ data: { userId: user.id, tokenHash: session.tokenHash, expiresAt: session.expiresAt } }),
    ]);
    token = session.token;
  } catch {
    return unavailable;
  }
  await setSessionCookie(token);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  if (!(await isSameOrigin())) throw new Error("الطلب غير مسموح.");
  await clearSession();
  redirect("/login");
}
