export default function DashboardLoading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-36 bg-accent/50 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-accent/50 rounded animate-pulse hidden sm:block" />
        </div>
        <div className="h-10 w-32 bg-accent/50 rounded-lg animate-pulse" />
      </div>

      {/* Stats cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-accent/50 rounded animate-pulse" />
              <div className="h-8 w-8 bg-accent/50 rounded-lg animate-pulse" />
            </div>
            <div className="h-7 w-28 bg-accent/50 rounded animate-pulse" />
            <div className="h-3 w-24 bg-accent/50 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Charts and budget overview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="h-5 w-36 bg-accent/50 rounded animate-pulse" />
          <div className="h-[280px] bg-accent/50 rounded-lg animate-pulse" />
        </div>
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="h-5 w-32 bg-accent/50 rounded animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-28 bg-accent/50 rounded animate-pulse" />
                <div className="h-4 w-16 bg-accent/50 rounded animate-pulse" />
              </div>
              <div className="h-2 w-full bg-accent/50 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((col) => (
          <div key={col} className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="h-5 w-32 bg-accent/50 rounded animate-pulse" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-accent/50 rounded-lg animate-pulse shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-accent/50 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-accent/50 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-5 w-20 bg-accent/50 rounded animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
