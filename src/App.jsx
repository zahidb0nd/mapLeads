import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useStore from './stores/useStore'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import History from './pages/History'
import SavedSearches from './pages/SavedSearches'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  const { isAuthenticated, user } = useStore()

  useEffect(() => {
    // Load initial data when authenticated
    // Temporarily disabled until collections are created
    if (isAuthenticated && user) {
      // useStore.getState().loadSearchHistory()
      // useStore.getState().loadSavedSearches()
      // useStore.getState().loadStats()
    }
  }, [isAuthenticated, user])

  return (
    <Router>
      <div className="dark min-h-screen bg-background text-foreground">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
          
          {/* Protected routes */}
          <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="search" element={<Search />} />
            <Route path="history" element={<History />} />
            <Route path="saved-searches" element={<SavedSearches />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
