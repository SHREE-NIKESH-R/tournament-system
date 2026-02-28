import { motion } from 'framer-motion'
import {
  Crown,
  Medal,
  TrendingUp,
  Star,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

// ─── Podium row for top 3 ─────────────────────────────────────────────────────
function PodiumCard({ standing, rank }) {
  const configs = {
    1: {
      bg: 'bg-gradient-to-br from-yellow-400/20 via-yellow-400/8 to-transparent',
      border: 'border-yellow-400/50',
      shadow: 'shadow-[0_0_28px_rgba(250,204,21,0.18)]',
      icon: <Crown className="w-5 h-5 text-yellow-400" />,
      labelColor: 'text-yellow-400',
      ptsColor: 'text-yellow-300',
      badge: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
      size: 'py-5',
    },
    2: {
      bg: 'bg-gradient-to-br from-slate-300/12 via-slate-300/5 to-transparent',
      border: 'border-slate-400/35',
      shadow: 'shadow-[0_0_16px_rgba(148,163,184,0.1)]',
      icon: <Medal className="w-4 h-4 text-slate-300" />,
      labelColor: 'text-slate-300',
      ptsColor: 'text-slate-200',
      badge: 'bg-slate-400/15 text-slate-300 border-slate-400/25',
      size: 'py-4',
    },
    3: {
      bg: 'bg-gradient-to-br from-amber-600/15 via-amber-600/5 to-transparent',
      border: 'border-amber-600/35',
      shadow: '',
      icon: <Medal className="w-4 h-4 text-amber-500" />,
      labelColor: 'text-amber-500',
      ptsColor: 'text-amber-400',
      badge: 'bg-amber-600/15 text-amber-400 border-amber-600/25',
      size: 'py-4',
    },
  }
  const c = configs[rank]

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (rank - 1) * 0.08 }}
      className={`rounded-xl border ${c.bg} ${c.border} ${c.shadow} ${c.size} px-4 flex items-center gap-4 relative overflow-hidden`}
    >
      {/* Rank number watermark */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 font-[Orbitron] font-black text-5xl opacity-[0.06] select-none pointer-events-none text-white">
        {rank}
      </div>

      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${c.badge}`}>
        {c.icon}
      </div>

      {/* Name + stats */}
      <div className="flex-1 min-w-0">
        <div className={`font-[Orbitron] font-bold text-sm ${c.labelColor} truncate leading-tight`}>
          {standing.player?.name || 'Unknown'}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-white/35">
            <span className="text-green-400">{standing.wins}W</span>
            {standing.draws > 0 && <span className="text-white/50"> {standing.draws}D</span>}
            <span className="text-red-400/70"> {standing.losses}L</span>
          </span>
          <span className="text-xs text-white/25">{standing.played} played</span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <div className={`font-[Orbitron] font-black text-xl ${c.ptsColor}`}>
          {standing.points}
        </div>
        <div className="text-[9px] text-white/30 font-[Orbitron] uppercase tracking-widest">pts</div>
      </div>
    </motion.div>
  )
}

// ─── Regular table row ─────────────────────────────────────────────────────────
function TableRow({ standing, rank, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="grid gap-x-3 px-3 py-2.5 rounded-lg items-center hover:bg-white/[0.03] transition-colors group"
      style={{ gridTemplateColumns: 'auto 1fr auto auto auto auto' }}
    >
      {/* Rank */}
      <span className="w-6 text-center text-xs font-[Orbitron] text-white/25">{rank}</span>

      {/* Name */}
      <span className="text-sm font-semibold text-white/80 truncate group-hover:text-white/90 transition-colors">
        {standing.player?.name || 'Unknown'}
      </span>

      {/* Played */}
      <span className="text-xs text-white/35 w-7 text-center">{standing.played}</span>

      {/* W */}
      <span className="text-xs text-green-400/80 w-7 text-center">{standing.wins}</span>

      {/* L */}
      <span className="text-xs text-red-400/60 w-7 text-center">{standing.losses}</span>

      {/* PTS */}
      <span className="text-sm font-bold text-neon-cyan w-10 text-right">{standing.points}</span>
    </motion.div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Leaderboard({ standings, loading }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neon-cyan" /> Standings
          </CardTitle>
        </CardHeader>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const top3 = standings.slice(0, 3);
  const rest = standings.slice(3);
  const hasDraws = standings.some((s) => s.draws > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-neon-cyan" /> Standings
        </CardTitle>
        <span className="text-xs text-white/30 font-[Rajdhani]">
          {standings.length} players
        </span>
      </CardHeader>

      {standings.length === 0 ? (
        <div className="text-center py-10 text-white/25 text-sm">
          No standings yet
        </div>
      ) : (
        <div className="space-y-5">
          {/* Podium — top 3 */}
          {top3.length > 0 && (
            <div className="space-y-2">
              {top3.map((s, i) => (
                <PodiumCard key={s.id} standing={s} rank={i + 1} />
              ))}
            </div>
          )}

          {/* Divider + table for 4th+ */}
          {rest.length > 0 && (
            <>
              {top3.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[9px] font-[Orbitron] uppercase tracking-widest text-white/20">
                    Rest
                  </span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
              )}

              {/* Table header */}
              <div
                className="grid gap-x-3 px-3 pb-1 border-b border-white/[0.06]"
                style={{ gridTemplateColumns: "auto 1fr auto auto auto auto" }}
              >
                <span className="w-6 text-center text-[9px] font-[Orbitron] uppercase tracking-widest text-white/25">
                  #
                </span>
                <span className="text-[9px] font-[Orbitron] uppercase tracking-widest text-white/25">
                  Player
                </span>
                <span className="w-7 text-center text-[9px] font-[Orbitron] uppercase tracking-widest text-white/25">
                  P
                </span>
                <span className="w-7 text-center text-[9px] font-[Orbitron] uppercase tracking-widest text-green-400/50">
                  W
                </span>
                <span className="w-7 text-center text-[9px] font-[Orbitron] uppercase tracking-widest text-red-400/50">
                  L
                </span>
                <span className="w-10 text-right text-[9px] font-[Orbitron] uppercase tracking-widest text-neon-cyan/60">
                  Pts
                </span>
              </div>

              <div className="space-y-0.5">
                {rest.map((s, i) => (
                  <TableRow
                    key={s.id}
                    standing={s}
                    rank={top3.length + i + 1}
                    index={i}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
