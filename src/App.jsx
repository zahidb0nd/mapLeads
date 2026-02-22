import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import useStore from './stores/useStore'
import Layout from './components/layout/Layout'
import { ToastProvider } from './components/ui/toast'
import AnimatedBackground from './components/ui/AnimatedBackground'
import pb from './lib/pocketbase'

// Lazy load all page components
const Dashboard      = lazy(() => import('./pages/Dashboard'))
const Search         = lazy(() => import('./pages/Search'))
const History        = lazy(() => import('./pages/History'))
const SavedSearches  = lazy(() => import('./pages/SavedSearches'))
const Profile        = lazy(() => import('./pages/Profile'))
const Login          = lazy(() => import('./pages/Login'))
const Signup         = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword  = lazy(() => import('./pages/ResetPassword'))
const VerifyEmail    = lazy(() => import('./pages/VerifyEmail'))
const NotFound       = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-purple border-t-transparent animate-spin" />
        <p className="text-text-muted text-sm">Loading...</p>
      </div>
    </div>
  )
}

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useStore()
  const location = useLocation()
  
  if (!isAuthenticated) {
    // Store the intended destination
    const returnUrl = location.pathname + location.search
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} replace />
  }
  
  return children
}

// Public Route wrapper (redirects to dashboard if already authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated } = useStore()
  const location = useLocation()
  
  if (isAuthenticated) {
    // Check if there's a returnUrl in query params
    const params = new URLSearchParams(location.search)
    const returnUrl = params.get('returnUrl')
    return <Navigate to={returnUrl || '/dashboard'} replace />
  }
  
  return children
}

function App() {
  const { isAuthenticated, user, setUser } = useStore()

  useEffect(() => {
    // Always force dark mode
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    // Check auth status on mount and restore session
    if (pb.authStore.isValid && pb.authStore.model) {
      setUser(pb.authStore.model)
    }
  }, [setUser])

  useEffect(() => {
    // Handle 401 errors globally (session expiry)
    const handleAuthError = (e) => {
      if (e.detail?.status === 401) {
        pb.authStore.clear()
        useStore.getState().setUser(null)
        window.location.href = '/login?session=expired'
      }
    }
    
    window.addEventListener('pocketbase-auth-error', handleAuthError)
    return () => window.removeEventListener('pocketbase-auth-error', handleAuthError)
  }, [])

  useEffect(() => {
    if (isAuthenticated && user) {
      useStore.getState().loadSearchHistory()
      useStore.getState().loadSavedSearches()
      useStore.getState().loadStats()
    }
  }, [isAuthenticated, user])

  return (
    <ToastProvider>
      <Router>
        <AnimatedBackground />
        <div className="min-h-screen bg-bg-deep text-text-primary">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public auth routes */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="search" element={<Search />} />
                <Route path="history" element={<History />} />
                <Route path="saved-searches" element={<SavedSearches />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ToastProvider>
  )
}

export default App
