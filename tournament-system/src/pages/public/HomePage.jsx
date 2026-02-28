import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Search, AlertCircle, RefreshCw } from "lucide-react";
import { useTournaments } from '@/hooks/useTournament'
import TournamentCard from '@/components/public/TournamentCard'
import { TournamentCardSkeleton } from '@/components/ui/Skeleton'
import PageTransition from "@/components/shared/PageTransition";

export default function HomePage() {
  const { tournaments, loading, error, refetch } = useTournaments()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState("all");

  const filtered = tournaments.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    if (filter === 'all') return matchesSearch
    if (filter === 'live') return matchesSearch && t.status === 'live'
    if (filter === 'finished') return matchesSearch && t.status === 'finished'
    if (filter === 'league') return matchesSearch && t.type === 'league'
    if (filter === 'knockout') return matchesSearch && t.type === 'knockout'
    return matchesSearch
  })

  const filters = [
    { value: "all", label: "All" },
    { value: "live", label: "Live" },
    { value: "finished", label: "Finished" },
    { value: "league", label: "League" },
    { value: "knockout", label: "Knockout" },
  ];

  return (
    <PageTransition>
      {/* Hero */}
      <div className="text-center mb-10 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-neon-purple/10 border border-neon-purple/20 text-neon-purple/80
            text-xs font-[Orbitron] uppercase tracking-widest mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse" />
          Tournament Management
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-[Orbitron] font-black text-white mb-4 leading-tight"
        >
          <span className="neon-text-purple">NammaLeague</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-white/40 max-w-md mx-auto text-sm sm:text-base px-4"
        >
          Track your Chess and Clash Royale tournaments — League tables and
          knockout brackets in one place.
        </motion.p>
      </div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-3 mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10
              text-white/90 placeholder:text-white/25 text-sm focus:outline-none
              focus:border-neon-purple/40 transition-all font-[Rajdhani]"
            placeholder="Search tournaments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter chips — scrollable on mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-2 rounded-lg text-xs font-[Orbitron] uppercase tracking-wider
                transition-all whitespace-nowrap shrink-0
                ${
                  filter === f.value
                    ? "bg-neon-purple/20 border border-neon-purple/40 text-neon-purple"
                    : "bg-white/3 border border-white/8 text-white/40 hover:bg-white/6 hover:text-white/70"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Error state ── */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-4 rounded-xl bg-red-500/8 border border-red-500/25 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-300 font-semibold mb-1">
              Could not load tournaments
            </p>
            <p className="text-xs text-red-400/70 font-mono break-all">
              {error}
            </p>
            <p className="text-xs text-white/40 mt-2">
              This is usually a Supabase RLS policy issue. Run the SQL fix below
              in your Supabase SQL Editor.
            </p>
          </div>
          <button
            onClick={refetch}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </motion.div>
      )}

      {/* ── Loading skeletons ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <TournamentCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Tournament grid ── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t, i) => (
            <TournamentCard key={t.id} tournament={t} index={i} />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-white/30"
        >
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-[Orbitron] uppercase tracking-widest">
            {tournaments.length === 0
              ? "No tournaments yet"
              : "No tournaments match your filter"}
          </p>
        </motion.div>
      )}
    </PageTransition>
  );
}
