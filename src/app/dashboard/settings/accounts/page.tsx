import { redirect } from "next/navigation";
import { ConnectedAccounts } from "@/components/connected-accounts";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const metadata = { title: "الحسابات المتصلة" };

export default async function AccountsPage({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const user = await requireUser();
  const workspace = user.memberships[0]?.workspace;
  if (!workspace) redirect("/login");

  const accounts = await db.socialAccount.findMany({
    where: { workspaceId: workspace.id, platform: "FACEBOOK" },
    orderBy: { displayName: "asc" },
    select: { id: true, displayName: true, externalId: true, pictureUrl: true, longLivedTokenExpires: true, connectedAt: true },
  });
  const { status } = await searchParams;

  return <ConnectedAccounts
    initialStatus={Array.isArray(status) ? status[0] : status}
    accounts={accounts.map((account) => ({
      id: account.id,
      displayName: account.displayName,
      externalId: account.externalId,
      pictureUrl: account.pictureUrl,
      expiresAt: account.longLivedTokenExpires?.toISOString() ?? null,
      connectedAt: account.connectedAt.toISOString(),
    }))}
  />;
}
