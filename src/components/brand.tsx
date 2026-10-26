import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={cn("size-10 shrink-0", className)}>
      <path d="M30.8 12.4C34.7 17.9 32.5 27.3 26 31.3C19.5 35.3 10.5 31.8 8.2 25.7C5.9 19.6 9.5 9.9 16.4 7.8" stroke="currentColor" strokeWidth="3.1" strokeLinecap="round" />
      <path d="M28.9 11.3C24.2 9.6 15.9 12.5 13.6 18.4C11.3 24.3 17.5 28.6 23 24.2C28.5 19.8 28.8 12.2 25.6 7" stroke="currentColor" strokeWidth="3.1" strokeLinecap="round" />
      <circle cx="31.9" cy="8" r="3.1" fill="currentColor" />
    </svg>
  );
}

export function Brand({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className={cn("brand inline-flex items-center gap-2.5", light ? "text-white" : "text-primary")}>
      <BrandMark />
      <span className="flex flex-col">
        <span className="text-[29px] font-bold leading-[1.5] tracking-tight">مدار</span>
        {!compact && <span className={cn("text-[9px] font-normal", light ? "text-white/55" : "text-muted-foreground")}>حضورك الاجتماعي، ببساطة.</span>}
      </span>
    </span>
  );
}
