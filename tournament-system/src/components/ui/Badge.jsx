import { cn } from '@/lib/utils'

export default function Badge({ children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold font-[Orbitron] tracking-widest uppercase',
        className
      )}
    >
      {children}
    </span>
  )
}
