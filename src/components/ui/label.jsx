import { cn } from '@/lib/utils'

function Label({ className, children, ...props }) {
  return (
    <label
      className={cn(
        'block text-xs font-semibold uppercase tracking-widest text-text-muted mb-1.5',
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
}

export { Label }
export default Label
