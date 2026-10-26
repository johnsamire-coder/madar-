import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth-screen";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = { title: "إنشاء حساب" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthScreen mode="register" />;
}
