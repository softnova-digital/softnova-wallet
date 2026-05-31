export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <div className="h-9 w-28 bg-accent/50 rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-accent/50 rounded animate-pulse" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-28 bg-accent/50 rounded-t-lg animate-pulse" />
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {/* Action header */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 bg-accent/50 rounded animate-pulse" />
          <div className="h-9 w-32 bg-accent/50 rounded-lg animate-pulse" />
        </div>

        {/* List items */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-accent/50 rounded-lg animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-accent/50 rounded animate-pulse" />
                <div className="h-3 w-20 bg-accent/50 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-8 bg-accent/50 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
