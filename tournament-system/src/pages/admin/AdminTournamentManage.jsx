import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy, Swords, CheckCircle2, Clock } from 'lucide-react'
import { useTournament } from '@/hooks/useTournament'
import MatchResultForm from '@/components/admin/MatchResultForm'
import Leaderboard from '@/components/public/Leaderboard'
import BracketView from '@/components/public/BracketView'
import PageTransition from '@/components/shared/PageTransition'
import Badge from '@/components/ui/Badge'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import { getStatusConfig, getTypeConfig, formatDate } from '@/utils/tournament'

function MatchAdminRow({ match, tournament, totalPlayers, onComplete, roundCompleted }) {
  return (
    <div
      className={`glass rounded-xl p-4 transition-all
        ${match.completed ? 'opacity-60' : 'border-neon-purple/10'}`}
    >
      {/* Players header */}
      <div className="flex items-center justify-between mb-3">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center flex-1">
          <span
            className={`text-sm font-semibold truncate
              ${match.winner_id === match.player1_id && match.completed ? 'text-neon-cyan' : 'text-white/80'}`}
          >
            {match.player1?.name || 'TBD'}
          </span>
          <span className="text-xs text-white/20 font-[Orbitron]">VS</span>
          <span
            className={`text-sm font-semibold truncate text-right
              ${match.winner_id === match.player2_id && match.completed ? 'text-neon-cyan' : 'text-white/80'}`}
          >
            {match.player2?.name || 'TBD'}
          </span>
        </div>
        {match.completed && (
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 ml-3" />
        )}
      </div>

      {/* Result form */}
      {tournament.status !== 'finished' && (
        <MatchResultForm
          match={match}
          tournament={tournament}
          totalPlayers={totalPlayers}
          onComplete={onComplete}
          disabled={roundCompleted && !match.completed}
        />
      )}

      {match.completed && tournament.status === 'finished' && (
        <div className="text-xs text-white/25 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {match.is_draw ? 'Draw' : `${match.winner?.name} wins`}
        </div>
      )}
    </div>
  )
}

export default function AdminTournamentManage() {
  const { id } = useParams()
  const { tournament, matches, standings, players, loading, refetch } = useTournament(id)

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
      </div>
    )
  }

  const statusConfig = getStatusConfig(tournament.status)
  const typeConfig = getTypeConfig(tournament.type)

  // Group matches by round
  const roundMap = {}
  matches.forEach((m) => {
    if (!roundMap[m.round_number]) roundMap[m.round_number] = []
    roundMap[m.round_number].push(m)
  })
  const roundNumbers = Object.keys(roundMap).map(Number).sort((a, b) => a - b)

  // For knockout: find first incomplete round to enable
  const firstIncompleteRound = roundNumbers.find((r) =>
    roundMap[r].some((m) => !m.completed)
  )

  const totalKnockoutPlayers = tournament.type === 'knockout'
    ? Math.max(...matches.map((m) => {
        // rough estimate of original players from first round
        return roundMap[1]?.length * 2 || 2
      }))
    : 0

  return (
    <PageTransition>
      {/* Back */}
      <Link
        to="/admin"
        className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
            <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
            <span className="text-white/30 text-xs">{formatDate(tournament.created_at)}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-[Orbitron] font-black text-white">
            {tournament.name}
          </h1>
          {tournament.type === 'league' && (
            <p className="text-white/40 text-sm mt-1">
              Win: {tournament.win_points}pts
              {tournament.allow_draw && ` · Draw: ${tournament.draw_points}pts`}
              {` · Loss: ${tournament.loss_points}pts`}
            </p>
          )}
        </div>
      </div>

      {tournament.status === 'finished' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <p className="text-sm text-green-300">
            This tournament has concluded. All results are final.
          </p>
        </motion.div>
      )}

      {/* Layout */}
      {tournament.type === 'league' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Standings */}
          <div className="lg:col-span-2">
            <Leaderboard standings={standings} loading={loading} />
          </div>

          {/* Match management */}
          <div className="lg:col-span-3 space-y-6">
            {roundNumbers.map((roundNum) => {
              const roundMatches = roundMap[roundNum]
              const roundName = roundMatches[0]?.round_name || `Round ${roundNum}`
              const allDone = roundMatches.every((m) => m.completed)

              return (
                <Card key={roundNum}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {allDone ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-neon-purple" />
                      )}
                      {roundName}
                    </CardTitle>
                    <span className="text-xs text-white/30">
                      {roundMatches.filter((m) => m.completed).length}/{roundMatches.length} done
                    </span>
                  </CardHeader>
                  <div className="space-y-3">
                    {roundMatches.map((match) => (
                      <MatchAdminRow
                        key={match.id}
                        match={match}
                        tournament={tournament}
                        totalPlayers={players.length}
                        onComplete={refetch}
                        roundCompleted={false}
                      />
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bracket preview */}
          <BracketView matches={matches} loading={loading} />

          {/* Match management per round */}
          {roundNumbers.map((roundNum) => {
            const roundMatches = roundMap[roundNum]
            const roundName = roundMatches[0]?.round_name || `Round ${roundNum}`
            const allDone = roundMatches.every((m) => m.completed)
            const isActiveRound = roundNum === firstIncompleteRound

            return (
              <Card key={roundNum}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {allDone ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : isActiveRound ? (
                      <Clock className="w-4 h-4 text-neon-purple animate-pulse" />
                    ) : (
                      <Clock className="w-4 h-4 text-white/20" />
                    )}
                    {roundName}
                  </CardTitle>
                  {isActiveRound && !allDone && (
                    <Badge className="bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                      Active
                    </Badge>
                  )}
                </CardHeader>
                <div className="space-y-3">
                  {roundMatches.map((match) => (
                    <MatchAdminRow
                      key={match.id}
                      match={match}
                      tournament={tournament}
                      totalPlayers={roundMap[1]?.length * 2 || 2}
                      onComplete={refetch}
                      roundCompleted={!isActiveRound && !allDone}
                    />
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </PageTransition>
  )
}
