import { Sun, Moon, LogOut, User, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import useStore from '@/stores/useStore'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toast'

export default function Header() {
  const { user, theme, setTheme } = useStore()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { success } = useToast()

  const handleLogout = async () => {
    try {
      await logout()
      success('Logged out', 'See you next time!')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-card border-b border-border">
      {/* Logo — visible on mobile (sidebar hidden) */}
      <div className="flex items-center space-x-2 md:hidden">
        <MapPin className="h-6 w-6 text-primary-500" />
        <span className="text-lg font-bold text-primary-500">MapLeads</span>
      </div>
      <div className="hidden md:block" />

      <div className="flex items-center space-x-2">
        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* User info — hidden on mobile (profile in bottom nav) */}
        <button
          onClick={() => navigate('/profile')}
          className="hidden md:flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium leading-tight">{user?.name || user?.email}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </button>

        {/* Logout */}
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

