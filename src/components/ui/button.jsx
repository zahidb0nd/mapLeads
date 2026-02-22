import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const variantStyles = {
  primary: [
    'bg-purple-gradient text-white font-semibold',
    'hover:shadow-purple-glow hover:scale-[1.02]',
    'active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
  ].join(' '),
  secondary: [
    'bg-bg-elevated border border-border text-text-primary',
    'hover:border-purple hover:bg-purple-subtle',
  ].join(' '),
  ghost: [
    'bg-transparent text-text-secondary',
    'hover:text-text-primary hover:bg-bg-elevated',
  ].join(' '),
  danger: [
    'bg-danger-subtle text-danger border border-danger/30',
    'hover:bg-danger hover:text-white',
  ].join(' '),
  success: [
    'bg-success-subtle text-success border border-success/30',
    'hover:bg-success hover:text-white',
  ].join(' '),
  outline: [
    'bg-transparent border border-border text-text-secondary',
    'hover:border-purple hover:text-text-primary hover:bg-purple-subtle',
  ].join(' '),
}

const sizeStyles = {
  sm:   'text-sm px-3 py-2 min-h-[44px] gap-1.5', // Increased min-height for better touch targets
  md:   'text-sm px-6 py-3 min-h-[48px] gap-2',   // Increased for mobile accessibility
  lg:   'text-base px-8 py-3.5 min-h-[52px] gap-2',
  icon: 'w-10 h-10 min-h-[44px] p-0',             // Minimum 44px for touch targets
}

const Button = forwardRef(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 cursor-pointer select-none',
        'touch-manipulation', // Improves touch responsiveness on mobile
        variantStyles[variant] ?? variantStyles.primary,
        sizeStyles[size] ?? sizeStyles.md,
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})

export { Button }
export default Button
