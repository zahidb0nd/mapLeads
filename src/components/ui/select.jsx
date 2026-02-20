import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-border bg-bg-elevated text-text-primary',
        'px-4 py-3 min-h-[44px] text-base transition-all duration-150 outline-none',
        'focus:border-purple focus:ring-2 focus:ring-purple-glow',
        'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
})

export { Select }
export default Select
