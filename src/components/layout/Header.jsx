import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, User, ChevronDown, Settings, LogOut, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import useStore from '@/stores/useStore'

const pageTitles = {
  '/dashboard':      'Dashboard',
  '/search':         'Search',
  '/history':        'History',
  '/saved-searches': 'Saved Searches',
  '/profile':        'Profile & Settings',
}

function getInitials(name, email) {
  if (name) return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  if (email) return email[0].toUpperCase()
  return 'U'
}

export default function Header() {
  const { user } = useStore()
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const title = pageTitles[location.pathname] || 'MapLeads'

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b"
      style={{
        background: 'rgba(19, 17, 28, 0.8)',
        backdropFilter: 'blur(12px)',
        borderColor: '#1E1A30',
      }}
    >
      {/* Page title */}
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          className="flex items-center justify-center w-10 h-10 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-bg-elevated transition-all min-h-[44px]"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div
              className="rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
              style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              }}
            >
              {getInitials(user?.name, user?.email)}
            </div>
            <ChevronDown className="h-4 w-4 text-text-muted" aria-hidden="true" />
          </button>

          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              {/* Dropdown */}
              <div
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl border shadow-card z-20 py-2 animate-slideUp"
                style={{ background: '#13111C', borderColor: '#2E2A45' }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: '#2E2A45' }}>
                  <p className="text-sm font-semibold text-text-primary truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { navigate('/profile'); setDropdownOpen(false) }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors min-h-[40px]"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  Profile
                </button>
                <button
                  onClick={() => { navigate('/profile'); setDropdownOpen(false) }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors min-h-[40px]"
                >
                  <Zap className="h-4 w-4 text-warning" aria-hidden="true" />
                  Upgrade to Pro
                </button>
                <div className="border-t my-1" style={{ borderColor: '#2E2A45' }} />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-danger hover:bg-danger-subtle transition-colors min-h-[40px]"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
