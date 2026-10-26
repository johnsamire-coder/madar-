"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Check, CircleAlert, CircleOff, Link2, LoaderCircle, LockKeyhole, Music2, RefreshCw, ShieldCheck } from "lucide-react";
import { disconnectAccountAction } from "@/app/actions/social-accounts";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type ConnectedAccount = { id: string; displayName: string; externalId: string; pictureUrl: string | null; expiresAt: string | null; connectedAt: string };

const statusMessages: Record<string, { text: string; tone: "success" | "warning" | "error" }> = {
  connected: { text: "تم ربط حساباتك على فيسبوك بنجاح.", tone: "success" },
  updated: { text: "تم تحديث قائمة صفحاتك من فيسبوك.", tone: "success" },
  cancelled: { text: "تم إلغاء الربط من غير تغيير في حساباتك.", tone: "warning" },
  nopages: { text: "تم تسجيل الدخول، لكن مفيش صفحات وصلت لمدار. لازم تكون مشرف على الصفحة.", tone: "warning" },
  expired: { text: "انتهت جلسة الدخول، سجّل دخولك تاني وكرر المحاولة.", tone: "error" },
  state: { text: "انتهت صلاحية طلب الربط. ابدأ عملية الربط من الأول.", tone: "error" },
  config: { text: "الربط غير متاح حاليًا: بيانات تطبيق فيسبوك ناقصة في ملف البيئة.", tone: "error" },
  limit: { text: "محاولات ربط كتير في وقت قصير. استنى ١٥ دقيقة وجرب تاني.", tone: "error" },
  failed: { text: "مش قادرين نكمل الربط دلوقتي. جرّب تاني بعد شوية.", tone: "error" },
};

const dateFormat = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function FacebookGlyph() {
  return <span className="account-platform-glyph facebook-glyph"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.7 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.6 1.6-1.6H18V3.1c-.3 0-1.4-.1-2.5-.1-2.6 0-4.3 1.5-4.3 4.4v2.2H8.3v3.2h2.9V21z" /></svg></span>;
}

function AccountRow({ account, onDisconnect, busy }: { account: ConnectedAccount; onDisconnect: (id: string) => void; busy: boolean }) {
  return (
    <li className="account-row">
      {account.pictureUrl
        ? <Image src={account.pictureUrl} alt="" width={38} height={38} unoptimized className="account-avatar" />
        : <span className="account-avatar account-avatar-fallback"><Link2 size={17} aria-hidden="true" /></span>}
      <div className="account-row-copy">
        <strong title={account.displayName}>{account.displayName}</strong>
        <span>
          {account.expiresAt ? `صلاحية الوصول لحد ${dateFormat.format(new Date(account.expiresAt))}` : "صلاحية الوصول غير محدّدة من فيسبوك"}
          {" · "}<span dir="ltr">{account.externalId}</span>
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={() => onDisconnect(account.id)} disabled={busy}>
        {busy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <CircleOff aria-hidden="true" />}فصل
      </Button>
    </li>
  );
}

export function ConnectedAccounts({ accounts, initialStatus }: { accounts: ConnectedAccount[]; initialStatus?: string }) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const notice = statusMessages[initialStatus ?? ""];

  async function disconnect(accountId: string) {
    setActionError(null);
    setDisconnectingId(accountId);
    const result = await disconnectAccountAction(accountId);
    setDisconnectingId(null);
    if (!result.ok) setActionError(result.error ?? "مش قادرين نفصل الحساب دلوقتي.");
  }

  return (
    <div className="profile-page">
        <header className="profile-topbar">
          <Link href="/dashboard" aria-label="مدار، العودة للوحة التحكم"><Brand /></Link>
          <Button variant="ghost" asChild><Link href="/dashboard"><ArrowRight aria-hidden="true" />العودة للوحة التحكم</Link></Button>
        </header>
        <main className="profile-main accounts-main">
          <div className="profile-heading">
            <span className="eyebrow">الحسابات الاجتماعية</span>
            <h1>اربط حضورك في مكان واحد</h1>
            <p>اربط صفحات فيسبوك اللي بتديرها، وبعدها حسابات إنستجرام المرتبطة، ثم تيك توك.</p>
          </div>

          {notice && (
            <div className={`account-notice is-${notice.tone}`} role="status">
              {notice.tone === "success" ? <Check size={15} aria-hidden="true" /> : <CircleAlert size={15} aria-hidden="true" />}
              {notice.text}
            </div>
          )}
          {actionError && <div className="account-notice is-error" role="alert">{actionError}</div>}

          <div className="profile-grid">
            <div className="accounts-column">
              <Card className="account-platform-card">
                <CardHeader>
                  <div className="profile-card-title">
                    <FacebookGlyph />
                    <div>
                      <CardTitle>فيسبوك</CardTitle>
                      <CardDescription>صفحات تديرها، للنشر وقراءات الأداء في المراحل الجاية.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="account-card-body">
                  {accounts.length > 0
                    ? <ul className="account-list">{accounts.map((account) =>                       <AccountRow key={account.id} account={account} busy={disconnectingId === account.id} onDisconnect={disconnect} />)}</ul>
                    : <div className="account-empty"><span><Link2 size={20} aria-hidden="true" /></span><p>لسه ما ربطت أي صفحة. اضغط «اربط فيسبوك» واختر الصفحات المسموح لمدار بالوصول إليها.</p></div>}
                  <div className="account-actions">
                    <Button asChild>
                      <a href="/api/auth/facebook"><Link2 aria-hidden="true" />{accounts.length > 0 ? "حدّث الصفحات" : "اربط فيسبوك"}</a>
                    </Button>
                    {accounts.length > 0 && <span className="account-count">{accounts.length} صفحة متصلة</span>}
                  </div>
                </CardContent>
              </Card>

              <Card className="account-platform-card is-planned">
                <CardHeader>
                  <div className="profile-card-title">
                    <span className="account-platform-glyph instagram-glyph"><Camera size={20} aria-hidden="true" /></span>
                    <div>
                      <CardTitle>إنستجرام</CardTitle>
                      <CardDescription>حسابات احترافية مرتبطة بصفحة فيسبوك.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="account-card-body">
                  <p className="account-planned-note">بعد ربط فيسبوك، لو حسابك على إنستجرام احترافي ومربوط بإحدى صفحاتك، هيظهر هنا تلقائيًا. النشر على إنستجرام في المرحلة الثالثة.</p>
                  <Button variant="outline" disabled><Camera aria-hidden="true" />اربط إنستجرام<span className="button-coming">المرحلة الثالثة</span></Button>
                </CardContent>
              </Card>

              <Card className="account-platform-card is-planned">
                <CardHeader>
                  <div className="profile-card-title">
                    <span className="account-platform-glyph tiktok-glyph"><Music2 size={20} aria-hidden="true" /></span>
                    <div>
                      <CardTitle>تيك توك</CardTitle>
                      <CardDescription>حسابات الأعمال عبر TikTok Login Kit.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="account-card-body">
                  <p className="account-planned-note">ربط تيك توك محتاج تطبيق خاص بك على منصة مطوّري تيك توك، وسنفعّله في المرحلة الثالثة.</p>
                  <Button variant="outline" disabled><Music2 aria-hidden="true" />اربط تيك توك<span className="button-coming">المرحلة الثالثة</span></Button>
                </CardContent>
              </Card>
            </div>

            <div className="profile-aside">
              <Card className="account-security-card">
                <span className="account-security-icon"><LockKeyhole size={20} aria-hidden="true" /></span>
                <h2>كيف نُخزّن وصولك؟</h2>
                <p>رموز الوصول بتتشفّر بمفتاح AES‑256 قبل التخزين، وما بتظهرش في الصفحة إطلاقًا. كل مساحة عمل بترى حساباتها هي فقط.</p>
                <p className="account-security-note"><ShieldCheck size={14} aria-hidden="true" />تقدر تفصل أي حساب في أي وقت، والصفحة اللي تشيلها من إدارتك بتختفي من القائمة عند التحديث.</p>
              </Card>
              <Card className="account-help-card">
                <h2>لو الربط ما كمّلش</h2>
                <ul>
                  <li>لازم تكون مشرف أو محرر على الصفحة.</li>
                  <li>لو تطبيق فيسبوك في وضع تطوير، استخدم حساب مضاف كمُختبِر.</li>
                  <li>تأكد إن عنوان إعادة التوجيه مضبوط في لوحة مطوّري فيسبوك.</li>
                </ul>
                <Button variant="outline" size="sm" asChild><a href="/api/auth/facebook"><RefreshCw size={14} aria-hidden="true" />إعادة محاولة الربط</a></Button>
              </Card>
            </div>
          </div>
        </main>
    </div>
  );
}
