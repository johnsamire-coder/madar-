export default function DashboardLoading() {
  return (
    <main aria-busy="true" aria-label="جاري تحميل مساحة العمل" className="min-h-screen p-8 lg:p-16">
      <div className="mx-auto max-w-6xl animate-pulse space-y-8">
        <div className="h-8 w-40 rounded-lg bg-emerald-900/10" />
        <div className="h-44 rounded-2xl bg-emerald-900/10" />
        <div className="grid gap-5 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-32 rounded-2xl bg-emerald-900/10" />)}
        </div>
        <span className="sr-only">بنجهّز مساحة عملك.</span>
      </div>
    </main>
  );
}