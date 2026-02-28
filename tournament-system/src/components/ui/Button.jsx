import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const variants = {
  purple: 'btn-neon-purple',
  cyan: 'btn-neon-cyan',
  ghost: 'bg-transparent border border-white/10 text-white/70 hover:bg-white/5 hover:text-white/90 transition-all',
  danger:
    'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/60 transition-all',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Button = forwardRef(
  ({ className, variant = 'purple', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.97 } : {}}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
          'font-[Orbitron] tracking-wide uppercase transition-all duration-200',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
export default Button
