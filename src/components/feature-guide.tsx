"use client";

import { BookOpen, Check, CircleDashed, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function FeatureGuide({ compact = false }: { compact?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={compact ? "link" : "outline"} size={compact ? "sm" : "default"} className={compact ? "guide-link" : undefined}><BookOpen aria-hidden="true" />دليل البداية</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <span className="guide-symbol"><Sprout size={22} aria-hidden="true" /></span>
          <DialogTitle>كل رحلة كبيرة، ليها بداية بسيطة.</DialogTitle>
          <DialogDescription>مدار بيتطوّر خطوة بخطوة. دي الحاجات المتاحة دلوقتي، واللي بنجهّزها للمراحل الجاية.</DialogDescription>
        </DialogHeader>
        <ol className="guide-phases">
          <li className="guide-phase-current"><Check size={19} aria-hidden="true" /><div><h3>المرحلة الأولى: أساس حضورك</h3><p>إنشاء حسابك، تسجيل دخول آمن، ومساحة عمل خاصة بيك مع عرض بيانات حسابك.</p><span className="status-pill">متاحة الآن</span></div></li>
          <li className="guide-phase-current"><Check size={19} aria-hidden="true" /><div><h3>المرحلة الثانية: ربط حساباتك</h3><p>ربط صفحات فيسبوك التي تديرها من مساحة عمل واحدة، مع تخزين مشفّر لرموز الوصول.</p><span className="status-pill">متاحة الآن</span></div></li>
          <li><CircleDashed size={19} aria-hidden="true" /><div><h3>بعدها: المحتوى وقياس الأداء</h3><p>ربط إنستجرام وتيك توك، إنشاء المنشورات وجدولتها، تقويم المحتوى، ومتابعة النتائج. هتتوفر في مراحل لاحقة.</p><span className="neutral-pill">قريبًا</span></div></li>
        </ol>
        <DialogFooter><DialogClose asChild><Button>تمام، خلّينا نبدأ<Check aria-hidden="true" /></Button></DialogClose></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
