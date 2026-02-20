import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar: hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      {/* Bottom nav: visible on mobile only */}
      <BottomNav />
    </div>
  )
}
