import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(function Input(
  { className, type = 'text', icon: Icon, error, ...props },
  ref
) {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="h-4 w-4 text-purple" aria-hidden="true" />
        </div>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full rounded-xl border bg-bg-elevated text-text-primary placeholder:text-text-muted',
          'px-4 py-3 min-h-[44px] text-base md:text-sm transition-all duration-150 outline-none',
          'border-border focus:border-purple focus:ring-2 focus:ring-purple-glow',
          'touch-manipulation', // Improves touch responsiveness on mobile
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          Icon && 'pl-10',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger" aria-live="polite" role="alert">{error}</p>
      )}
    </div>
  )
})

export { Input }
export default Input
