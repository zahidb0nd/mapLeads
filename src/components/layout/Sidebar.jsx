import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Search, Clock, Bookmark, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import useStore from '@/stores/useStore'

const navItems = [
  { name: 'Dashboard',     href: '/dashboard',      icon: LayoutDashboard },
  { name: 'Search',        href: '/search',          icon: Search },
  { name: 'History',       href: '/history',         icon: Clock },
  { name: 'Saved Searches',href: '/saved-searches',  icon: Bookmark },
  { name: 'Settings',      href: '/profile',         icon: Settings },
]

function getInitials(name, email) {
  if (name) return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  if (email) return email[0].toUpperCase()
  return 'U'
}

export default function Sidebar({ variant = 'full' }) {
  const { user } = useStore()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isIcon = variant === 'icon'

  return (
    <aside
      className="h-screen flex flex-col border-r"
      style={{
        width: isIcon ? '64px' : '240px',
        background: '#13111C',
        borderColor: '#2E2A45',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-16 border-b px-4 flex-shrink-0"
        style={{ borderColor: '#2E2A45' }}
      >
        {/* Purple M icon */}
        <div
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
            fontSize: 18,
            fontWeight: 800,
            color: '#fff',
          }}
        >
          M
        </div>
        {!isIcon && (
          <span className="ml-3 text-lg font-800 text-text-primary font-extrabold tracking-tight">
            MapLeads
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.href}
              to={item.href}
              title={isIcon ? item.name : undefined}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-r-xl transition-all duration-150 group relative',
                  isIcon ? 'justify-center px-0 py-3 mx-auto w-10 rounded-xl' : 'px-4 py-3',
                  isActive
                    ? 'bg-purple-subtle text-purple-light border-l-2 border-purple'
                    : 'text-text-muted hover:bg-bg-elevated hover:text-text-primary border-l-2 border-transparent',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={['h-5 w-5 flex-shrink-0', isActive ? 'text-purple-light' : ''].join(' ')} aria-hidden="true" />
                  {!isIcon && <span className="font-medium text-sm">{item.name}</span>}
                  {/* Tooltip for icon sidebar */}
                  {isIcon && (
                    <div className="absolute left-14 bg-bg-elevated border border-border text-text-primary text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-card">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User section */}
      {!isIcon && (
        <div className="border-t p-4 flex-shrink-0" style={{ borderColor: '#2E2A45' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-700 text-sm"
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              }}
            >
              {getInitials(user?.name, user?.email)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost w-full text-sm text-text-muted hover:text-danger justify-start gap-2 rounded-xl px-3 py-2 min-h-[36px]"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}

      {/* Icon sidebar bottom - logout icon */}
      {isIcon && (
        <div className="pb-4 flex justify-center flex-shrink-0">
          <button
            onClick={handleLogout}
            title="Sign out"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-text-muted hover:text-danger hover:bg-bg-elevated transition-all"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </aside>
  )
}
