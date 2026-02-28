import { useState } from "react";
import { Link, useLocation, Outlet, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Trophy,
  LogOut,
  Home,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
];

function SidebarContent({ location, onNavClick, handleSignOut }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-white/5 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center">
          <Trophy className="w-3.5 h-3.5 text-neon-purple" />
        </div>
        <span className="font-[Orbitron] font-bold text-xs tracking-widest uppercase text-white/90">
          NammaLeague
        </span>
      </div>

      {/* Admin label */}
      <div className="px-5 py-3 border-b border-white/5 shrink-0">
        <span className="text-xs font-[Orbitron] uppercase tracking-widest text-neon-purple/60">
          Admin Panel
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                ${
                  isActive
                    ? "bg-neon-purple/15 text-neon-purple border border-neon-purple/20"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-[Orbitron] text-xs uppercase tracking-wider">
                {label}
              </span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-1 border-t border-white/5 shrink-0">
        <Link
          to="/"
          onClick={onNavClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40
            hover:bg-white/5 hover:text-white/70 transition-all"
        >
          <Home className="w-4 h-4 shrink-0" />
          <span className="font-[Orbitron] text-xs uppercase tracking-wider">
            Public View
          </span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/60
            hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="font-[Orbitron] text-xs uppercase tracking-wider">
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  async function handleSignOut() {
    const { error } = await signOut();
    if (!error) toast.success("Signed out");
  }

  return (
    <div className="min-h-screen grid-bg">
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden sticky top-0 z-40 h-14 glass border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5 text-neon-purple" />
          </div>
          <span className="font-[Orbitron] font-bold text-xs tracking-widest uppercase text-white/90">
            NammaLeague
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center
            hover:bg-white/10 transition-colors"
        >
          <Menu className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 glass border-r border-white/5 lg:hidden"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-3.5 right-3 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
              <SidebarContent
                location={location}
                onNavClick={() => setMobileOpen(false)}
                handleSignOut={handleSignOut}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop layout ── */}
      <div className="flex">
        {/* Desktop sidebar — hidden on mobile */}
        <aside className="hidden lg:flex w-60 shrink-0 flex-col glass border-r border-white/5 sticky top-0 h-screen">
          <SidebarContent
            location={location}
            onNavClick={() => {}}
            handleSignOut={handleSignOut}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 py-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
