import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Search, Clock, Bookmark, User } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard',     icon: LayoutDashboard },
  { name: 'Search',    href: '/search',         icon: Search },
  { name: 'History',   href: '/history',        icon: Clock },
  { name: 'Saved',     href: '/saved-searches', icon: Bookmark },
  { name: 'Profile',   href: '/profile',        icon: User },
]

export default function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: '#13111C',
        borderTop: '1px solid #2E2A45',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                  isActive ? 'text-purple' : 'text-text-muted',
                ].join(' ')
              }
              aria-label={item.name}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={[
                      'flex items-center justify-center rounded-full w-8 h-8 transition-all',
                      isActive ? 'bg-purple-subtle animate-bounceIcon' : '',
                    ].join(' ')}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-medium">{item.name}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
