import type { Metadata } from "next";
import "@fontsource-variable/noto-sans-arabic";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "مدار | حضورك الاجتماعي، ببساطة",
    template: "%s | مدار",
  },
  description: "مساحة عمل عربية تجمع حضورك الاجتماعي في مكان واحد. ابدأ رحلتك مع مدار وأنشئ حسابك ومساحة عملك.",
  applicationName: "مدار",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
