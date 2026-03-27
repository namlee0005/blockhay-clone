export function ArticleCardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse" aria-hidden="true">
      <div className="w-full aspect-video rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}
