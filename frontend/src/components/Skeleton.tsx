// Shared skeleton component used across all loading states in IDRS
// Uses Tailwind animate-pulse shimmer blocks

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-700/60 rounded-lg ${className}`} />
  );
}

export function SOSQueueSkeleton() {
  return (
    <div className="space-y-4 w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 rounded-xl border border-gray-800 bg-gray-800/50 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function FacilitiesTableSkeleton() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <div className="bg-gray-800/80 p-4 flex gap-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-4 flex-1" />)}
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="border-t border-gray-800 p-4 flex gap-4 items-center">
            {[1,2,3,4].map(j => <Skeleton key={j} className="h-4 flex-1" />)}
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlertsPanelSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="p-4 rounded-lg border border-gray-800 bg-gray-800/50">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-5 w-3/4 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function VerificationListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 rounded-lg border border-gray-800 bg-gray-800">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-6 w-16 rounded" />
            <Skeleton className="h-4 w-14" />
          </div>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`w-full ${height} bg-gray-800/50 rounded-xl border border-gray-700 p-6 flex flex-col gap-4 animate-pulse`}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex-1 flex items-end gap-3">
        {[0.4, 0.6, 0.9, 0.7, 0.85, 0.55, 0.75].map((h, i) => (
          <div key={i} className="flex-1 bg-gray-700/60 rounded-t" style={{ height: `${h * 100}%` }} />
        ))}
      </div>
    </div>
  );
}
