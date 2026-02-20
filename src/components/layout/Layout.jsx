import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Full sidebar: desktop only (>1024px) */}
      <div className="hidden lg:block">
        <Sidebar variant="full" />
      </div>
      {/* Icon sidebar: tablet only (768px–1024px) */}
      <div className="hidden md:block lg:hidden">
        <Sidebar variant="icon" />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Top bar: tablet + desktop */}
        <div className="hidden md:block">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav: mobile only */}
      <BottomNav />
    </div>
  )
}
