import { cn } from '@/lib/utils'

export default function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'skeleton rounded-lg',
        className
      )}
    />
  )
}

export function TournamentCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-24" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

export function MatchRowSkeleton() {
  return (
    <div className="glass rounded-lg p-3 flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-32" />
    </div>
  )
}
