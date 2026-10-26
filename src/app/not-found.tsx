import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <section>
        <p className="text-sm text-emerald-700">٤٠٤</p>
        <h1 className="mt-3 text-3xl font-bold">الصفحة مش موجودة</h1>
        <p className="mt-4 text-slate-500">ممكن العنوان اتغيّر، ارجع لمساحة عملك.</p>
        <Link href="/" className="mt-7 inline-block rounded-xl bg-emerald-800 px-6 py-3 text-white">ارجع للرئيسية</Link>
      </section>
    </main>
  );
}
