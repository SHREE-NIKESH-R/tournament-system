import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useTournament } from '@/hooks/useTournament'
import Leaderboard from '@/components/public/Leaderboard'
import BracketView from '@/components/public/BracketView'
import PageTransition from '@/components/shared/PageTransition'
import Badge from '@/components/ui/Badge'
import { getStatusConfig, getTypeConfig, formatDate } from '@/utils/tournament'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'

function RoundGroup({ roundName, matches }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-[Orbitron] uppercase tracking-widest text-neon-purple/60 mb-3">
        {roundName}
      </h4>
      {matches.map((match) => (
        <div
          key={match.id}
          className="glass rounded-lg px-4 py-3 grid grid-cols-[1fr_auto_1fr] gap-4 items-center"
        >
          <span
            className={`text-sm font-semibold truncate ${
              match.winner_id === match.player1_id && match.completed
                ? 'text-neon-cyan'
                : 'text-white/70'
            }`}
          >
            {match.player1?.name || 'TBD'}
          </span>
          <span className="text-xs text-white/25 font-[Orbitron]">
            {match.completed ? (match.is_draw ? 'DRAW' : 'VS') : 'VS'}
          </span>
          <span
            className={`text-sm font-semibold truncate text-right ${
              match.winner_id === match.player2_id && match.completed
                ? 'text-neon-cyan'
                : 'text-white/70'
            }`}
          >
            {match.player2?.name || 'TBD'}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function TournamentPage() {
  const { id } = useParams()
  const { tournament, matches, standings, loading } = useTournament(id)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="text-center py-20 text-white/30">
        <p className="font-[Orbitron] uppercase tracking-widest">Tournament not found</p>
        <Link to="/" className="text-neon-purple text-sm mt-4 inline-block hover:underline">
          ← Back to home
        </Link>
      </div>
    )
  }

  const statusConfig = getStatusConfig(tournament.status)
  const typeConfig = getTypeConfig(tournament.type)

  // Group matches by round
  const roundMap = {}
  matches.forEach((m) => {
    const key = m.round_name || `Round ${m.round_number}`
    if (!roundMap[key]) roundMap[key] = []
    roundMap[key].push(m)
  })

  return (
    <PageTransition>
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Tournaments
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
          <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
          <span className="text-white/30 text-xs">{formatDate(tournament.created_at)}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-[Orbitron] font-black text-white mb-1">
          {tournament.name}
        </h1>
        {tournament.type === 'league' && (
          <p className="text-white/40 text-sm">
            Win: {tournament.win_points}pts
            {tournament.allow_draw && ` · Draw: ${tournament.draw_points}pts`}
            {` · Loss: ${tournament.loss_points}pts`}
          </p>
        )}
      </motion.div>

      {/* Content */}
      {tournament.type === 'league' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <Leaderboard standings={standings} loading={loading} />
          </div>

          {/* Rounds */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Rounds</CardTitle>
              </CardHeader>
              <div className="space-y-6">
                {Object.entries(roundMap).map(([roundName, roundMatches]) => (
                  <RoundGroup key={roundName} roundName={roundName} matches={roundMatches} />
                ))}
                {matches.length === 0 && (
                  <p className="text-white/30 text-sm text-center py-4">No matches yet</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <BracketView matches={matches} loading={loading} />
      )}
    </PageTransition>
  )
}
