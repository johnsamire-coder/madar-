"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function LogoutSubmit({ sidebar }: { sidebar: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={sidebar ? "ghost" : "outline"} className={cn(sidebar && "sidebar-logout")} disabled={pending}>
      {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <LogOut aria-hidden="true" />}
      {pending ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
    </Button>
  );
}

export function LogoutButton({ sidebar = false }: { sidebar?: boolean }) {
  return <form action={logoutAction}><LogoutSubmit sidebar={sidebar} /></form>;
}
