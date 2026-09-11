export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  if (type === 'card') {
    return (
      <div className="bg-base-200 rounded-xl p-4 border border-base-300 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-base-300" />
            <div>
              <div className="h-4 w-16 bg-base-300 rounded mb-1" />
              <div className="h-3 w-24 bg-base-300 rounded" />
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="h-6 w-20 bg-base-300 rounded mb-1" />
            <div className="h-3 w-16 bg-base-300 rounded" />
          </div>
          <div className="h-6 w-16 bg-base-300 rounded" />
        </div>
      </div>
    )
  }

  if (type === 'line') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-base-200 rounded-xl border border-base-300 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-base-300" />
            <div className="flex-1">
              <div className="h-4 w-24 bg-base-300 rounded mb-1" />
              <div className="h-3 w-32 bg-base-300 rounded" />
            </div>
            <div className="h-5 w-20 bg-base-300 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'detail') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-base-300" />
          <div>
            <div className="h-6 w-48 bg-base-300 rounded mb-2" />
            <div className="h-4 w-32 bg-base-300 rounded" />
          </div>
        </div>
        <div className="h-80 bg-base-300 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-base-300 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return null
}
