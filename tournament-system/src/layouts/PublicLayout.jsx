import { Link, useLocation } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, LogIn, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function PublicLayout() {
  const { user, isAdmin } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen grid-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-neon-purple" />
            </div>
            <span className="font-[Orbitron] font-bold text-sm tracking-widest uppercase text-white/90">
              TourneyOS
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-[Orbitron] uppercase tracking-wider
                  bg-neon-purple/10 border border-neon-purple/20 text-neon-purple/80
                  hover:bg-neon-purple/20 hover:text-neon-purple transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
            {!user && (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-[Orbitron] uppercase tracking-wider
                  bg-white/5 border border-white/10 text-white/60
                  hover:bg-white/8 hover:text-white/80 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
