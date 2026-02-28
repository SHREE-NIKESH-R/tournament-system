import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function Card({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      className={cn('glass-card rounded-xl p-5', hover && 'transition-all duration-300', className)}
      whileHover={hover ? { y: -2 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3
      className={cn(
        'font-[Orbitron] font-bold text-sm uppercase tracking-widest text-white/90',
        className
      )}
    >
      {children}
    </h3>
  )
}
