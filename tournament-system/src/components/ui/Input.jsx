import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-[Orbitron] uppercase tracking-widest text-white/50">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg text-sm',
          'bg-white/5 border border-white/10',
          'text-white/90 placeholder:text-white/25',
          'focus:outline-none focus:border-neon-purple/50 focus:bg-white/6',
          'focus:shadow-[0_0_0_2px_rgba(184,69,245,0.15)]',
          'transition-all duration-200 font-[Rajdhani]',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
