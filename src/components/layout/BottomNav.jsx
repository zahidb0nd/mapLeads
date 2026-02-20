import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Search, History, Bookmark, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'History', href: '/history', icon: History },
  { name: 'Saved', href: '/saved-searches', icon: Bookmark },
  { name: 'Profile', href: '/profile', icon: User },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs transition-colors',
                  isActive
                    ? 'text-primary-500'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
