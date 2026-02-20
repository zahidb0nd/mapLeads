import { cn } from '@/lib/utils'

function Card({ className, hover = false, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4 md:p-6 transition-all duration-200',
        'bg-card-gradient backdrop-blur-sm',
        hover && 'cursor-pointer hover:border-purple hover:shadow-purple-glow hover:-translate-y-0.5',
        className
      )}
      style={{ borderColor: '#2E2A45' }}
      {...props}
    >
      {children}
    </div>
  )
}

function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-lg font-semibold text-text-primary', className)} {...props}>
      {children}
    </h3>
  )
}

function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-sm text-text-muted mt-1', className)} {...props}>
      {children}
    </p>
  )
}

function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('mt-4 flex items-center', className)} {...props}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
