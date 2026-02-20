import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Search, History, Bookmark, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Search',
    href: '/search',
    icon: Search
  },
  {
    name: 'History',
    href: '/history',
    icon: History
  },
  {
    name: 'Saved Searches',
    href: '/saved-searches',
    icon: Bookmark
  }
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-card border-r border-border">
      <div className="flex items-center justify-center h-16 px-6 border-b border-border">
        <MapPin className="h-8 w-8 text-primary-500" />
        <span className="ml-2 text-xl font-bold text-primary-500">MapLeads</span>
      </div>
      
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary-500 text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-border">
        <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
          <p className="text-sm font-medium text-primary-500">Need Help?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Check our documentation or contact support
          </p>
        </div>
      </div>
    </aside>
  )
}
