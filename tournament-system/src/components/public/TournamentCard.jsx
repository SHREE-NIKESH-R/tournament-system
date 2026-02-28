import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Swords, Calendar, ArrowRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { getStatusConfig, getTypeConfig, formatDate } from '@/utils/tournament'

export default function TournamentCard({ tournament, index = 0 }) {
  const statusConfig = getStatusConfig(tournament.status)
  const typeConfig = getTypeConfig(tournament.type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <Link to={`/tournament/${tournament.id}`}>
        <div className="glass-card rounded-xl p-5 group cursor-pointer transition-all duration-300 hover:border-neon-purple/40">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center shrink-0">
                {tournament.type === 'knockout' ? (
                  <Swords className="w-4 h-4 text-neon-purple" />
                ) : (
                  <Trophy className="w-4 h-4 text-neon-purple" />
                )}
              </div>
              <h3 className="font-[Orbitron] font-bold text-white/90 text-sm leading-tight group-hover:text-white transition-colors">
                {tournament.name}
              </h3>
            </div>
            <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
            <div className="flex items-center gap-1 text-white/30 text-xs">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(tournament.created_at)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            {tournament.type === 'league' && (
              <div className="text-xs text-white/40">
                Win: <span className="text-neon-cyan">{tournament.win_points}pts</span>
                {tournament.allow_draw && (
                  <>
                    {' '}
                    · Draw: <span className="text-neon-cyan">{tournament.draw_points}pts</span>
                  </>
                )}
              </div>
            )}
            {tournament.type === 'knockout' && (
              <div className="text-xs text-white/40">Single Elimination</div>
            )}
            <div className="flex items-center gap-1 text-neon-purple/60 text-xs group-hover:text-neon-purple transition-colors ml-auto">
              <span>View</span>
              <ArrowRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
