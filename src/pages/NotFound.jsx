import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useStore from '@/stores/useStore'
import AnimatedBackground from '@/components/ui/AnimatedBackground'

export default function NotFound() {
  const navigate = useNavigate()
  const { isAuthenticated } = useStore()

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep p-4">
      <AnimatedBackground />
      <div className="text-center max-w-md animate-slideUp space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: '#7C3AED15' }}>
              <MapPin className="h-12 w-12 text-purple" aria-hidden="true" />
            </div>
            <div className="absolute inset-0 rounded-full" style={{ background: '#7C3AED22', filter: 'blur(20px)' }} />
          </div>
        </div>

        <div>
          <h1 className="text-7xl font-extrabold text-purple">404</h1>
          <h2 className="text-2xl font-bold text-text-primary mt-2">Page Not Found</h2>
          <p className="text-text-muted mt-2">
            Looks like this page doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />Go Back
          </Button>
          <Button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
            <Home className="h-4 w-4" />
            {isAuthenticated ? 'Dashboard' : 'Go to Login'}
          </Button>
        </div>
      </div>
    </div>
  )
}
