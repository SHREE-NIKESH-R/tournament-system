import { motion } from 'framer-motion'
import { Crown, TrendingUp } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

export default function Leaderboard({ standings, loading }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Standings</CardTitle>
        </CardHeader>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-white/60'
    if (rank === 3) return 'text-amber-600/80'
    return 'text-white/30'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-neon-cyan" />
          Standings
        </CardTitle>
      </CardHeader>

      {/* Table header */}
      <div className="grid grid-cols-[auto_1fr_repeat(4,auto)] gap-x-4 px-3 py-2 mb-2">
        <span className="text-xs text-white/30 font-[Orbitron] uppercase tracking-widest w-6 text-center">#</span>
        <span className="text-xs text-white/30 font-[Orbitron] uppercase tracking-widest">Player</span>
        <span className="text-xs text-white/30 font-[Orbitron] uppercase tracking-widest text-center w-8">P</span>
        <span className="text-xs text-white/30 font-[Orbitron] uppercase tracking-widest text-center w-8">W</span>
        <span className="text-xs text-white/30 font-[Orbitron] uppercase tracking-widest text-center w-8">L</span>
        <span className="text-xs text-neon-cyan/60 font-[Orbitron] uppercase tracking-widest text-right w-10">PTS</span>
      </div>

      <div className="space-y-1.5">
        {standings.map((s, i) => {
          const rank = i + 1
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`grid grid-cols-[auto_1fr_repeat(4,auto)] gap-x-4 px-3 py-2.5 rounded-lg items-center transition-colors
                ${rank === 1 ? 'bg-yellow-400/5 border border-yellow-400/10' : 'hover:bg-white/3'}`}
            >
              <div className={`w-6 text-center text-sm font-bold ${getRankStyle(rank)}`}>
                {rank === 1 ? <Crown className="w-4 h-4 inline" /> : rank}
              </div>
              <span className="text-sm font-semibold text-white/85 truncate">
                {s.player?.name || 'Unknown'}
              </span>
              <span className="text-xs text-white/50 text-center w-8">{s.played}</span>
              <span className="text-xs text-green-400 text-center w-8">{s.wins}</span>
              <span className="text-xs text-red-400 text-center w-8">{s.losses}</span>
              <span className="text-sm font-bold text-neon-cyan text-right w-10">{s.points}</span>
            </motion.div>
          )
        })}

        {standings.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">No standings yet</div>
        )}
      </div>
    </Card>
  )
}
