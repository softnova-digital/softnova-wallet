export default function ExpensesLoading() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-accent/50 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-accent/50 rounded animate-pulse hidden sm:block" />
        </div>
        <div className="h-10 w-36 bg-accent/50 rounded-lg animate-pulse" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="h-10 w-52 bg-accent/50 rounded-lg animate-pulse" />
        <div className="h-10 w-36 bg-accent/50 rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-accent/50 rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-accent/50 rounded-lg animate-pulse" />
        <div className="h-10 w-28 bg-accent/50 rounded-lg animate-pulse" />
      </div>

      {/* Desktop table skeleton */}
      <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-accent/20">
          <div className="h-4 w-1/3 bg-accent/50 rounded animate-pulse" />
          <div className="h-4 w-1/6 bg-accent/50 rounded animate-pulse" />
          <div className="h-4 w-1/6 bg-accent/50 rounded animate-pulse" />
          <div className="h-4 w-1/6 bg-accent/50 rounded animate-pulse" />
          <div className="h-4 w-16 bg-accent/50 rounded animate-pulse ml-auto" />
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-4 border-b border-border last:border-0"
          >
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-48 bg-accent/50 rounded animate-pulse" />
              <div className="h-3 w-20 bg-accent/50 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2 w-1/6">
              <div className="h-7 w-7 bg-accent/50 rounded-lg animate-pulse shrink-0" />
              <div className="h-4 w-20 bg-accent/50 rounded animate-pulse" />
            </div>
            <div className="h-6 w-20 bg-accent/50 rounded-full animate-pulse w-1/6" />
            <div className="h-4 w-24 bg-accent/50 rounded animate-pulse w-1/6" />
            <div className="h-4 w-20 bg-accent/50 rounded animate-pulse ml-auto" />
          </div>
        ))}
      </div>

      {/* Mobile card skeleton */}
      <div className="md:hidden space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 bg-accent/50 rounded-lg animate-pulse shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="h-4 w-3/4 bg-accent/50 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-accent/50 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-20 bg-accent/50 rounded animate-pulse shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
