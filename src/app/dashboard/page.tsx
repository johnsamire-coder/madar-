import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata = { title: "لوحة التحكم" };

export default async function DashboardPage() {
  const user = await requireUser();
  const workspace = user.memberships[0]?.workspace;
  if (!workspace) redirect("/login");
  const connectedAccounts = await db.socialAccount.count({ where: { workspaceId: workspace.id } });
  return <Dashboard
    connectedAccounts={connectedAccounts}
    user={{
      name: user.name,
      email: user.email,
      workspaceName: workspace.name,
      createdAt: user.createdAt.toISOString(),
    }}
  />;
}
