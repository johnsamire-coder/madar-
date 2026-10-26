import { redirect } from "next/navigation";
import { ProfilePanel } from "@/components/profile-panel";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "إعدادات الحساب" };

export default async function SettingsPage() {
  const user = await requireUser();
  const workspace = user.memberships[0]?.workspace;
  if (!workspace) redirect("/login");
  return <ProfilePanel user={{
    name: user.name,
    email: user.email,
    workspaceName: workspace.name,
    createdAt: user.createdAt.toISOString(),
  }} />;
}
