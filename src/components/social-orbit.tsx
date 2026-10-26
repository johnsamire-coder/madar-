import { Camera, Check, Music2 } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { cn } from "@/lib/utils";

export function SocialOrbit({ large = false }: { large?: boolean }) {
  return (
    <div className={cn("social-orbit", large && "social-orbit-large")} aria-hidden="true">
      <div className="orbit-ring orbit-ring-outer" />
      <div className="orbit-ring orbit-ring-inner" />
      <div className="orbit-core"><BrandMark /></div>
      <span className="social-chip social-facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.7 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.6 1.6-1.6H18V3.1c-.3 0-1.4-.1-2.5-.1-2.6 0-4.3 1.5-4.3 4.4v2.2H8.3v3.2h2.9V21z" /></svg></span>
      <span className="social-chip social-instagram"><Camera /></span>
      <span className="social-chip social-tiktok"><Music2 /></span>
      <span className="orbit-dot orbit-dot-one" />
      <span className="orbit-dot orbit-dot-two" />
      {large && <div className="orbit-caption"><span className="orbit-caption-check"><Check size={13} /></span>مساحة واحدة. احتمالات أكبر.</div>}
    </div>
  );
}
