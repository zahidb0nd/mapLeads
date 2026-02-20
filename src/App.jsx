import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import useStore from './stores/useStore'
import Layout from './components/layout/Layout'
import { ToastProvider } from './components/ui/toast'
import AnimatedBackground from './components/ui/AnimatedBackground'

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

function App() {
  const { isAuthenticated, user } = useStore()

  useEffect(() => {
    // Always force dark mode
    document.documentElement.classList.add('dark')
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
              <Route path="/login"          element={!isAuthenticated ? <Login />          : <Navigate to="/dashboard" replace />} />
              <Route path="/signup"         element={!isAuthenticated ? <Signup />         : <Navigate to="/dashboard" replace />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password"  element={<ResetPassword />} />
              <Route path="/verify-email"    element={<VerifyEmail />} />

              {/* Protected routes */}
              <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard"      element={<Dashboard />} />
                <Route path="search"         element={<Search />} />
                <Route path="history"        element={<History />} />
                <Route path="saved-searches" element={<SavedSearches />} />
                <Route path="profile"        element={<Profile />} />
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
