import { cn } from '@/lib/utils'

const variantStyles = {
  purple:  'bg-purple-subtle text-purple-light',
  green:   'bg-success-subtle text-success',
  amber:   'bg-warning-subtle text-warning',
  red:     'bg-danger-subtle text-danger',
  default: 'bg-bg-elevated text-text-secondary border border-border',
}

function Badge({ className, variant = 'purple', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        variantStyles[variant] ?? variantStyles.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }
export default Badge
