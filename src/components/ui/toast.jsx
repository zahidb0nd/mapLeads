import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

const TOAST_ICONS = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
}

const TOAST_STYLES = {
  success: 'border-green-500/30 bg-green-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, title, description, type, duration }])
    return id
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-20 md:bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map(t => (
          <Toast key={t.id} {...t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function Toast({ id, title, description, type, duration, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onDismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg',
        'animate-in slide-in-from-right-full duration-300',
        'bg-card text-card-foreground',
        TOAST_STYLES[type]
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{TOAST_ICONS[type]}</div>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm">{title}</p>}
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  const { toast, dismiss } = ctx

  return {
    toast,
    dismiss,
    success: (title, description) => toast({ title, description, type: 'success' }),
    error: (title, description) => toast({ title, description, type: 'error' }),
    warning: (title, description) => toast({ title, description, type: 'warning' }),
    info: (title, description) => toast({ title, description, type: 'info' }),
  }
}
