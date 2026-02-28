import { Link, useLocation, Outlet, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  LogOut,
  Home,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  async function handleSignOut() {
    const { error } = await signOut();
    if (!error) toast.success("Signed out");
  }

  return (
    <div className="min-h-screen flex grid-bg">
      <aside className="w-60 shrink-0 flex flex-col glass border-r border-white/5 sticky top-0 h-screen">
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-white/5">
          <div className="w-7 h-7 rounded-lg bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5 text-neon-purple" />
          </div>
          <span className="font-[Orbitron] font-bold text-xs tracking-widest uppercase text-white/90">
            NammaLeague
          </span>
        </div>
        <div className="px-5 py-3 border-b border-white/5">
          <span className="text-xs font-[Orbitron] uppercase tracking-widest text-neon-purple/60">
            Admin Panel
          </span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label, exact }) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                  ${isActive ? "bg-neon-purple/15 text-neon-purple border border-neon-purple/20" : "text-white/50 hover:bg-white/5 hover:text-white/80"}`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-[Orbitron] text-xs uppercase tracking-wider">
                  {label}
                </span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 space-y-1 border-t border-white/5">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:bg-white/5 hover:text-white/70 transition-all"
          >
            <Home className="w-4 h-4" />
            <span className="font-[Orbitron] text-xs uppercase tracking-wider">
              Public View
            </span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-[Orbitron] text-xs uppercase tracking-wider">
              Sign Out
            </span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
