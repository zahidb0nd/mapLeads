import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('skeleton rounded-xl', className)}
      {...props}
    />
  )
}

function BusinessCardSkeleton() {
  return (
    <div className="rounded-2xl border p-5 bg-card-gradient" style={{ borderColor: '#2E2A45' }}>
      <div className="flex items-start gap-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-9 w-1/2" />
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border p-5 bg-card-gradient" style={{ borderColor: '#2E2A45' }}>
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

function HistoryItemSkeleton() {
  return (
    <div className="rounded-2xl border p-5 bg-card-gradient" style={{ borderColor: '#2E2A45' }}>
      <div className="flex justify-between mb-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export { Skeleton, BusinessCardSkeleton, StatCardSkeleton, HistoryItemSkeleton }
export default Skeleton
