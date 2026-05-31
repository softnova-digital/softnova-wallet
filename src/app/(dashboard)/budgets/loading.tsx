export default function BudgetsLoading() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-28 bg-accent/50 rounded-lg animate-pulse" />
          <div className="h-4 w-52 bg-accent/50 rounded animate-pulse hidden sm:block" />
        </div>
        <div className="h-10 w-32 bg-accent/50 rounded-lg animate-pulse" />
      </div>

      {/* Budget cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="h-5 w-32 bg-accent/50 rounded animate-pulse" />
                <div className="h-4 w-20 bg-accent/50 rounded animate-pulse" />
              </div>
              <div className="h-8 w-8 bg-accent/50 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-accent/50 rounded animate-pulse" />
                <div className="h-4 w-24 bg-accent/50 rounded animate-pulse" />
              </div>
              <div className="h-2.5 w-full bg-accent/50 rounded-full animate-pulse" />
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-accent/50 rounded animate-pulse" />
                <div className="h-3 w-20 bg-accent/50 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
