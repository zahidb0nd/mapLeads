import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useStore from './stores/useStore'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import History from './pages/History'
import SavedSearches from './pages/SavedSearches'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import { ToastProvider } from './components/ui/toast'
import NotFound from './pages/NotFound'

function App() {
  const { isAuthenticated, user, theme } = useStore()

  useEffect(() => {
    // Apply theme on load
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

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
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Public auth routes — redirect to dashboard if already logged in */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected routes */}
          <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="search" element={<Search />} />
            <Route path="history" element={<History />} />
            <Route path="saved-searches" element={<SavedSearches />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
    </ToastProvider>
  )
}

export default App
