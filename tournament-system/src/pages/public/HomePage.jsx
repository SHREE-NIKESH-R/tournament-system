import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Search, Filter } from 'lucide-react'
import { useTournaments } from '@/hooks/useTournament'
import TournamentCard from '@/components/public/TournamentCard'
import { TournamentCardSkeleton } from '@/components/ui/Skeleton'
import PageTransition from '@/components/shared/PageTransition'

export default function HomePage() {
  const { tournaments, loading } = useTournaments()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | live | finished | league | knockout

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
    { value: 'all', label: 'All' },
    { value: 'live', label: 'Live' },
    { value: 'finished', label: 'Finished' },
    { value: 'league', label: 'League' },
    { value: 'knockout', label: 'Knockout' },
  ]

  return (
    <PageTransition>
      {/* Hero */}
      <div className="text-center mb-12 pt-4">
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
          className="text-4xl md:text-5xl font-[Orbitron] font-black text-white mb-4 leading-tight"
        >
          <span className="neon-text-purple">TOURNEY</span>
          <span className="text-white/90">OS</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-white/40 max-w-md mx-auto text-base"
        >
          Track your Chess and Clash Royale tournaments — League tables and knockout brackets in one place.
        </motion.p>
      </div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 mb-8"
      >
        <div className="relative flex-1">
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

        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-2 rounded-lg text-xs font-[Orbitron] uppercase tracking-wider transition-all
                ${
                  filter === f.value
                    ? 'bg-neon-purple/20 border border-neon-purple/40 text-neon-purple'
                    : 'bg-white/3 border border-white/8 text-white/40 hover:bg-white/6 hover:text-white/70'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <TournamentCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t, i) => (
            <TournamentCard key={t.id} tournament={t} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-white/30"
        >
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-[Orbitron] uppercase tracking-widest">No tournaments found</p>
        </motion.div>
      )}
    </PageTransition>
  )
}
