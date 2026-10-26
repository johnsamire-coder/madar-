"use client";

import { useActionState, useState, type ComponentProps } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { loginAction, registerAction, type AuthActionState } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { SocialOrbit } from "@/components/social-orbit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

function AuthField({ label, name, errors, hint, password = false, ...props }: ComponentProps<typeof Input> & {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  password?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const hasErrors = Boolean(errors?.length);
  const describedBy = [hint && `${name}-hint`, hasErrors && `${name}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="auth-field">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          {...props}
          id={name}
          name={name}
          type={password ? (visible ? "text" : "password") : props.type}
          aria-invalid={hasErrors || undefined}
          aria-describedby={describedBy}
          className={password ? "pe-12" : undefined}
        />
        {password && (
          <button type="button" className="password-toggle" onClick={() => setVisible(!visible)} aria-label={visible ? `إخفاء ${label}` : `إظهار ${label}`} aria-pressed={visible} aria-controls={name}>
            {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {hint && <p id={`${name}-hint`} className="field-hint">{hint}</p>}
      {hasErrors && <p id={`${name}-error`} className="field-error" role="alert">{errors!.join(" ")}</p>}
    </div>
  );
}

export function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const [state, formAction, pending] = useActionState(isRegister ? registerAction : loginAction, initialState);
  const errors = state.fieldErrors;

  return (
    <main className="auth-page">
      <section className="auth-form-section" aria-labelledby="auth-title">
        <div className="auth-top"><Link href="/login" aria-label="مدار، تسجيل الدخول"><Brand /></Link><span className="auth-top-note"><span />مساحتك لبداية جديدة</span></div>
        <div className="auth-form-wrap">
          <div className="auth-heading">
            <span className="eyebrow"><span className="eyebrow-line" />{isRegister ? "أهلًا بيك في مدار" : "سعيدين برجوعك"}</span>
            <h1 id="auth-title">{isRegister ? "حضورك الأقوى يبدأ هنا." : "أهلًا بيك من جديد."}</h1>
            <p>{isRegister ? "أنشئ حسابك ومساحة عملك، وخلي البداية علينا." : "سجّل دخولك وكمّل رحلتك من مساحة عملك."}</p>
          </div>
          <form action={formAction} className="auth-form" aria-busy={pending}>
            {state.error && <div className="form-error" role="alert">{state.error}</div>}
            {isRegister && (
              <div className="auth-name-row">
                <AuthField label="الاسم الكامل" name="name" placeholder="اسمك الكامل" autoComplete="name" maxLength={80} required errors={errors?.name} />
                <AuthField label="اسم مساحة العمل" name="workspaceName" placeholder="اسم شركتك أو مشروعك" autoComplete="organization" maxLength={80} required errors={errors?.workspaceName} />
              </div>
            )}
            <AuthField label="البريد الإلكتروني" name="email" type="email" dir="ltr" placeholder="you@example.com" autoComplete="email" inputMode="email" maxLength={254} required errors={errors?.email} />
            <AuthField label="كلمة المرور" name="password" password placeholder={isRegister ? "اختار كلمة مرور قوية" : "أدخل كلمة المرور"} autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 12 : undefined} maxLength={128} required errors={errors?.password} hint={isRegister ? "12 حرفًا على الأقل. استخدم مزيجًا من الحروف والأرقام والرموز." : undefined} />
            {isRegister && <AuthField label="تأكيد كلمة المرور" name="confirmPassword" password placeholder="أدخل كلمة المرور مرة تانية" autoComplete="new-password" minLength={12} maxLength={128} required errors={errors?.confirmPassword} />}
            <Button type="submit" className="auth-submit" size="lg" disabled={pending}>
              {pending ? <><LoaderCircle className="animate-spin" aria-hidden="true" />{isRegister ? "بنجهّز مساحة عملك..." : "جارٍ تسجيل الدخول..."}</> : <>{isRegister ? "أنشئ حسابك" : "تسجيل الدخول"}<ArrowLeft aria-hidden="true" /></>}
            </Button>
            <p className="auth-security"><LockKeyhole size={13} aria-hidden="true" />جلسة آمنة لمدة 7 أيام، وتقدر تسجّل خروجك في أي وقت.</p>
          </form>
          <p className="auth-switch">{isRegister ? "عندك حساب بالفعل؟" : "لسه جديد في مدار؟"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "سجّل دخولك" : "أنشئ حسابك"}<ArrowLeft size={14} aria-hidden="true" /></Link></p>
        </div>
        <footer className="auth-footer"><span>مدار. مساحة لحضور يستاهل.</span><span><ShieldCheck size={14} aria-hidden="true" />خصوصيتك أولًا</span></footer>
      </section>
      <aside className="auth-brand-panel" aria-label="عن مدار">
        <div className="auth-panel-grid" />
        <div className="auth-panel-content">
          <span className="auth-panel-badge"><Sparkles size={13} aria-hidden="true" />بداية أبسط. حضور أقوى.</span>
          <h2>أفكارك تستاهل<br />تكون في <span>مدار الاهتمام.</span></h2>
          <p className="auth-panel-description">مساحتك لتنظيم حضورك الاجتماعي،<br />عشان تركّز على اللي بتعمله أحسن.</p>
          <SocialOrbit large />
          <div className="auth-benefits">
            <div><span><Check size={16} aria-hidden="true" /></span><p>مساحة عمل تخصّك<small>بداية منظّمة لمشروعك وطموحك.</small></p></div>
            <div><span><Check size={16} aria-hidden="true" /></span><p>من أول خطوة، بالعربي<small>تجربة واضحة، وقريبة منك.</small></p></div>
          </div>
        </div>
        <div className="auth-panel-footer"><span className="panel-footer-line" />كل حضورك، في مكان واحد.<span className="panel-footer-line" /></div>
      </aside>
    </main>
  );
}
