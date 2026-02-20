import { useNavigate } from 'react-router-dom'
import { MapPin, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useStore from '@/stores/useStore'

export default function NotFound() {
  const navigate = useNavigate()
  const { isAuthenticated } = useStore()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-24 w-24 bg-primary-500/10 rounded-full flex items-center justify-center">
            <MapPin className="h-12 w-12 text-primary-500" />
          </div>
        </div>
        <div>
          <h1 className="text-6xl font-bold text-primary-500">404</h1>
          <h2 className="text-2xl font-semibold mt-2">Page Not Found</h2>
          <p className="text-muted-foreground mt-2">
            Looks like this page doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
            <Home className="h-4 w-4 mr-2" />
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
          </Button>
        </div>
      </div>
    </div>
  )
}
