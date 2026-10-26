"use client";

import Link from "next/link";
import { ArrowUpLeft, BarChart3, CalendarDays, Check, CheckCheck, ChevronLeft, CircleHelp, Clock3, FileText, LayoutDashboard, Link2, Menu, Plus, Settings2, ShieldCheck, Sparkles, Sprout, Users, Zap } from "lucide-react";
import { Brand, BrandMark } from "@/components/brand";
import { FeatureGuide } from "@/components/feature-guide";
import { LogoutButton } from "@/components/logout-button";
import { SocialOrbit } from "@/components/social-orbit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export type DashboardUser = { name: string; email: string; workspaceName: string; createdAt: string };

const plannedNavigation = [
  { label: "الحسابات الاجتماعية", icon: Link2, href: "/dashboard/settings/accounts", badge: "متاح" },
  { label: "المنشورات", icon: FileText },
  { label: "تقويم المحتوى", icon: CalendarDays },
  { label: "التحليلات", icon: BarChart3 },
];

function UserAvatar({ name, small = false }: { name: string; small?: boolean }) {
  return <span className={`user-avatar${small ? " user-avatar-small" : ""}`} aria-hidden="true">{name.trim().slice(0, 1) || "م"}</span>;
}

function SidebarContent({ user }: { user: DashboardUser }) {
  return (
    <>
      <Link href="/dashboard" className="sidebar-brand" aria-label="مدار، نظرة عامة"><Brand light /></Link>
      <div className="sidebar-workspace"><span className="workspace-icon"><BrandMark className="size-6" /></span><div><span>مساحة العمل</span><strong title={user.workspaceName}>{user.workspaceName}</strong></div><span className="workspace-dot" aria-label="مساحة العمل جاهزة" /></div>
      <div className="sidebar-section-label">مساحة العمل</div>
      <nav aria-label="القائمة الرئيسية" className="sidebar-nav">
        <Link href="/dashboard" className="sidebar-nav-item is-active" aria-current="page"><LayoutDashboard size={18} aria-hidden="true" /><span>نظرة عامة</span><span className="active-nav-dot" /></Link>
        {plannedNavigation.map(({ label, icon: Icon, href, badge }) => href
          ? <Link key={label} href={href} className="sidebar-nav-item"><Icon size={18} aria-hidden="true" /><span>{label}</span><span className="nav-badge">{badge}</span><ChevronLeft size={14} className="nav-end-icon" aria-hidden="true" /></Link>
          : <button key={label} type="button" className="sidebar-nav-item is-planned" disabled><Icon size={18} aria-hidden="true" /><span>{label}</span><span className="nav-soon">قريبًا</span></button>)}
      </nav>
      <div className="sidebar-divider" />
      <div className="sidebar-section-label">حسابك</div>
      <nav aria-label="إعدادات الحساب" className="sidebar-nav"><Link href="/dashboard/settings" className="sidebar-nav-item"><Settings2 size={18} aria-hidden="true" /><span>إعدادات الحساب</span><ChevronLeft size={14} className="nav-end-icon" aria-hidden="true" /></Link></nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note"><span className="sidebar-note-icon"><Sprout size={20} aria-hidden="true" /></span><h2>معاك، من أول خطوة.</h2><p>دي البداية بس. بنجهّز لك أدوات تخلي حضورك أبسط وأقوى.</p><span className="sidebar-version"><span />المرحلة الأولى</span></div>
        <Link href="/dashboard/settings" className="sidebar-profile"><UserAvatar name={user.name} small /><div><strong title={user.name}>{user.name}</strong><span>مالك مساحة العمل</span></div><Settings2 size={16} aria-hidden="true" /></Link>
        <LogoutButton sidebar />
      </div>
    </>
  );
}

const metricCards = [
  { title: "الحسابات المتصلة", note: "حساباتك هتظهر هنا", icon: Users, className: "metric-green", live: true },
  { title: "المنشورات المجدولة", value: "0", note: "في انتظار أول فكرة", icon: CalendarDays, className: "metric-blue" },
  { title: "المنشورات المنشورة", value: "0", note: "حكايتك لسه بتبدأ", icon: CheckCheck, className: "metric-orange" },
  { title: "إجمالي التفاعل", value: "—", note: "متاح بعد الربط", icon: BarChart3, className: "metric-purple" },
];

export function Dashboard({ user, connectedAccounts = 0 }: { user: DashboardUser; connectedAccounts?: number }) {
  const connected = connectedAccounts > 0;
  const stepsCompleted = connected ? 2 : 1;
  return (
    <div className="dashboard-shell">
      <a href="#dashboard-main" className="skip-link">انتقل إلى المحتوى</a>
      <aside className="desktop-sidebar"><SidebarContent user={user} /></aside>
      <div className="dashboard-body">
        <header className="dashboard-topbar">
          <div className="topbar-breadcrumb">
            <div className="mobile-menu"><Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="فتح القائمة الرئيسية"><Menu /></Button></SheetTrigger><SheetContent><SheetTitle className="sr-only">القائمة الرئيسية</SheetTitle><SheetDescription className="sr-only">مساحة عملك وروابط التنقل في مدار</SheetDescription><SidebarContent user={user} /></SheetContent></Sheet></div>
            <span className="breadcrumb-icon"><LayoutDashboard size={17} aria-hidden="true" /></span><span className="breadcrumb-parent">مساحة عملك</span><ChevronLeft size={14} aria-hidden="true" /><strong title={user.workspaceName}>{user.workspaceName}</strong>
          </div>
          <div className="topbar-account"><span className="topbar-status"><span />مساحة خاصة وآمنة</span><span className="topbar-separator" /><Link href="/dashboard/settings" aria-label={`إعدادات حساب ${user.name}`}><UserAvatar name={user.name} small /></Link></div>
        </header>
        <main id="dashboard-main" className="dashboard-main" tabIndex={-1}>
          <section className="dashboard-heading" aria-labelledby="dashboard-title"><div><span className="eyebrow">نظرة عامة</span><h1 id="dashboard-title">كل حضورك، في مكان واحد.</h1><p>أهلًا بيك يا {user.name.split(" ")[0]}، دي أول خطوة لحضور اجتماعي أكثر تنظيمًا.</p></div><FeatureGuide /></section>
          <section className="welcome-banner" aria-labelledby="welcome-title">
            <div className="welcome-copy"><span className="welcome-kicker"><span className="welcome-check"><Check size={12} aria-hidden="true" /></span>بداية موفّقة</span><h2 id="welcome-title">مساحة عملك جاهزة<Sparkles size={21} aria-hidden="true" /></h2><p>الأفكار منك، والتنظيم على مدار. خلّينا نبني حضورك خطوة بخطوة.</p><div className="welcome-progress"><div className="progress-track" role="progressbar" aria-label="تقدم إعداد مساحة العمل" aria-valuemin={0} aria-valuemax={3} aria-valuenow={stepsCompleted}><span style={{ width: `${stepsCompleted * 33.333}%` }} /></div><span>اكتملت <b>{stepsCompleted}</b> من <b>3</b> خطوات</span></div></div>
            <div className="welcome-art"><SocialOrbit /><span className="welcome-art-label">حساباتك أقرب لبعض.</span></div>
          </section>
          <section className="metrics-grid" aria-label="ملخص مساحة العمل">{metricCards.map(({ title, value, note, icon: Icon, className, live }) => <Card className="metric-card" key={title}><div className="metric-card-top"><h2>{title}</h2><span className={`metric-icon ${className}`}><Icon size={17} aria-hidden="true" /></span></div><div className="metric-card-bottom"><strong>{live ? connectedAccounts : value}</strong><span>{live && connected ? "جاهزة للمرحلة القادمة" : note}</span></div></Card>)}</section>
          <div className="dashboard-content-grid">
            <Card className="upcoming-card"><CardHeader className="upcoming-header"><div><span className="section-icon"><CalendarDays size={17} aria-hidden="true" /></span><CardTitle>المنشورات القادمة</CardTitle></div><span className="neutral-pill">0 منشور</span></CardHeader><CardContent className="upcoming-empty"><div className="empty-illustration" aria-hidden="true"><span className="empty-sheet-back" /><span className="empty-sheet"><CalendarDays size={30} strokeWidth={1.3} /><i /><i /></span><span className="empty-plus"><Plus size={17} /></span><span className="empty-decoration-one" /><span className="empty-decoration-two" /></div><h3>مساحة فاضية، لأفكار مليانة.</h3><p>لما تبدأ تربط حساباتك وتجدول محتواك،<br />هتلاقي كل منشوراتك الجاية هنا.</p><Button variant="outline" size="sm" disabled><Plus aria-hidden="true" />إنشاء منشور<span className="button-coming">المرحلة القادمة</span></Button></CardContent><div className="upcoming-footnote"><Clock3 size={13} aria-hidden="true" />النشر والجدولة هيتوفروا في مرحلة لاحقة.</div></Card>
            <div className="dashboard-side-cards">
              <Card className="onboarding-card"><CardHeader className="onboarding-header"><CardTitle>ابدأ على مهلك</CardTitle><span>{stepsCompleted} من 3</span></CardHeader><CardContent className="onboarding-content"><ol className="onboarding-list"><li className="is-complete"><span className="step-number"><Check size={13} aria-hidden="true" /></span><div><h3>حسابك ومساحة عملك</h3><p>أول خطوة خلصت. أهلًا بيك!</p></div><span className="step-done">تم</span></li><li className={connected ? "is-complete" : undefined}><span className="step-number">{connected ? <Check size={13} aria-hidden="true" /> : "2"}</span><div><h3>{connected ? "حساباتك الاجتماعية مربوطة" : "اربط حساباتك الاجتماعية"}</h3><p>{connected ? "صفحاتك وصلت إلى مدار بنجاح." : "كل منصاتك في مكان واحد."}</p></div>{connected ? <span className="step-done">تم</span> : <Link href="/dashboard/settings/accounts" className="step-go">اربط الآن</Link>}</li><li><span className="step-number">3</span><div><h3>شارك أول منشور</h3><p>حوّل أفكارك لمحتوى يوصل.</p></div><span className="step-soon">قريبًا</span></li></ol></CardContent></Card>
              <Card className="starter-plan"><div className="starter-plan-heading"><span className="plan-icon"><Zap size={16} aria-hidden="true" /></span><h2>خطة البداية</h2><span className="status-pill">{connected ? "المرحلة الثانية" : "المرحلة الأولى"}</span></div><p><Check size={13} aria-hidden="true" />حساب آمن، ومساحة عمل خاصة بيك.</p><p><Check size={13} aria-hidden="true" />{connected ? "صفحاتك متصلة وجاهزة للنشر." : "اربط صفحاتك على فيسبوك من صفحة الحسابات."}</p><p className="plan-future"><Clock3 size={13} aria-hidden="true" />قادمًا: النشر وجدولة المحتوى وقياس الأداء.</p><Link href={connected ? "/dashboard/settings" : "/dashboard/settings/accounts"}>{connected ? "عرض بيانات حسابك" : "اربط حساباتك الاجتماعية"}<ArrowUpLeft size={14} aria-hidden="true" /></Link></Card>
            </div>
          </div>
          <footer className="dashboard-footer"><span><ShieldCheck size={14} aria-hidden="true" />خطوة صغيرة النهارده، حضور أكبر بكرة.</span><span className="footer-guide"><CircleHelp size={13} aria-hidden="true" />محتاج تعرف أكتر؟<FeatureGuide compact /></span></footer>
        </main>
      </div>
    </div>
  );
}
