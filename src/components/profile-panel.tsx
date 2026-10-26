"use client";

import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, Check, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Brand } from "@/components/brand";
import type { DashboardUser } from "@/components/dashboard";
import { FeatureGuide } from "@/components/feature-guide";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfilePanel({ user }: { user: DashboardUser }) {
  const createdDate = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(user.createdAt));
  return (
    <div className="profile-page">
      <header className="profile-topbar"><Link href="/dashboard" aria-label="مدار، العودة للوحة التحكم"><Brand compact /></Link><Button variant="ghost" asChild><Link href="/dashboard"><ArrowRight aria-hidden="true" />العودة للوحة التحكم</Link></Button></header>
      <main className="profile-main">
        <div className="profile-heading"><span className="eyebrow">مساحتك، وبياناتك</span><h1>إعدادات الحساب</h1><p>كل التفاصيل الأساسية لحسابك ومساحة عملك.</p></div>
        <div className="profile-grid">
          <Card className="profile-details"><CardHeader><div className="profile-card-title"><span className="profile-title-icon"><UserRound size={20} aria-hidden="true" /></span><div><CardTitle>بياناتك الشخصية</CardTitle><CardDescription>بيانات حسابك للعرض فقط في المرحلة الحالية.</CardDescription></div></div></CardHeader><CardContent className="profile-fields"><div><Label htmlFor="profile-name"><UserRound size={14} aria-hidden="true" />الاسم الكامل</Label><Input id="profile-name" value={user.name} readOnly autoComplete="name" /></div><div><Label htmlFor="profile-email"><Mail size={14} aria-hidden="true" />البريد الإلكتروني</Label><Input id="profile-email" value={user.email} readOnly dir="ltr" type="email" autoComplete="email" /></div><div><Label htmlFor="profile-workspace"><Building2 size={14} aria-hidden="true" />اسم مساحة العمل</Label><Input id="profile-workspace" value={user.workspaceName} readOnly /></div><div><Label htmlFor="profile-created"><CalendarDays size={14} aria-hidden="true" />تاريخ إنشاء الحساب</Label><Input id="profile-created" value={createdDate} readOnly /></div><p className="profile-readonly-note"><LockKeyhole size={14} aria-hidden="true" />تعديل البيانات غير متاح حاليًا. بياناتك محفوظة بأمان.</p></CardContent></Card>
          <div className="profile-aside"><Card className="profile-workspace-card"><span className="profile-workspace-symbol"><Building2 size={24} aria-hidden="true" /></span><span className="eyebrow">مساحة عملك</span><h2>{user.workspaceName}</h2><span className="status-pill"><Check size={12} aria-hidden="true" />جاهزة للاستخدام</span><div className="profile-workspace-meta"><span>دورك في المساحة</span><strong>المالك</strong></div></Card><Card className="profile-security-card"><ShieldCheck className="text-primary" size={23} aria-hidden="true" /><h2>أمان حسابك، أولوية.</h2><p>جلسة دخولك صالحة لمدة 7 أيام. لو بتستخدم جهاز مشترك، افتكر تسجّل خروجك لما تخلص.</p><LogoutButton /></Card></div>
        </div>
        <footer className="profile-footer"><span>مدار. حضورك الاجتماعي، ببساطة.</span><FeatureGuide compact /></footer>
      </main>
    </div>
  );
}
