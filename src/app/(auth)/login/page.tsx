import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth-screen";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "تسجيل الدخول" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthScreen mode="login" />;
}
