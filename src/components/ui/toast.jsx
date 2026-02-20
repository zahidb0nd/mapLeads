import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastContext = createContext(null)

let toastId = 0

const iconMap = {
  success: <CheckCircle className="h-5 w-5 text-success flex-shrink-0" aria-hidden="true" />,
  error:   <XCircle    className="h-5 w-5 text-danger  flex-shrink-0" aria-hidden="true" />,
  info:    <Info       className="h-5 w-5 text-purple  flex-shrink-0" aria-hidden="true" />,
  warning: <Info       className="h-5 w-5 text-warning flex-shrink-0" aria-hidden="true" />,
}

const borderMap = {
  success: 'border-l-success',
  error:   'border-l-danger',
  info:    'border-l-purple',
  warning: 'border-l-warning',
}

function ToastItem({ toast, onRemove }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border border-border border-l-4 shadow-card',
        'animate-slideInRight md:animate-slideInRight',
        'w-full max-w-sm',
        borderMap[toast.type] ?? borderMap.info
      )}
      style={{ background: '#13111C' }}
      role="alert"
      aria-live="polite"
    >
      {iconMap[toast.type]}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
        )}
        {toast.message && (
          <p className="text-sm text-text-secondary mt-0.5">{toast.message}</p>
        )}
        {/* Progress bar */}
        <div className="mt-2 h-0.5 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-purple rounded-full"
            style={{ animation: 'shrink 3s linear forwards' }}
          />
        </div>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors min-h-0 w-6 h-6"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const add = useCallback((type, title, message, duration = 3000) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, type, title, message }])
    timers.current[id] = setTimeout(() => remove(id), duration)
    return id
  }, [remove])

  const value = {
    success: (title, message) => add('success', title, message),
    error:   (title, message) => add('error',   title, message),
    info:    (title, message) => add('info',     title, message),
    warning: (title, message) => add('warning',  title, message),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-20 right-4 md:bottom-6 z-50 flex flex-col gap-3 items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default ToastProvider
