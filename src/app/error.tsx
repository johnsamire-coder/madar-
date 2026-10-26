"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section role="alert" className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">فيه مشكلة في الاتصال</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">مش قادرين نحمّل الصفحة دلوقتي. اتأكد إن قاعدة البيانات شغّالة وجرّب تاني.</p>
        <button onClick={reset} className="mt-6 rounded-xl bg-emerald-800 px-6 py-3 text-white">حاول تاني</button>
      </section>
    </main>
  );
}
