import { motion } from 'framer-motion'
import { Trophy, Swords } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'

function MatchBox({ match, isWinner }) {
  return (
    <div
      className={`border rounded-lg overflow-hidden min-w-[160px] transition-all
        ${isWinner ? 'border-neon-cyan/30 shadow-[0_0_12px_rgba(6,214,245,0.15)]' : 'border-white/10'}`}
    >
      <PlayerRow
        name={match.player1?.name}
        isWinner={match.winner_id === match.player1_id}
        completed={match.completed}
      />
      <div className="h-px bg-white/5" />
      <PlayerRow
        name={match.player2?.name}
        isWinner={match.winner_id === match.player2_id}
        completed={match.completed}
      />
    </div>
  )
}

function PlayerRow({ name, isWinner, completed }) {
  return (
    <div
      className={`px-3 py-2 flex items-center justify-between gap-2 text-xs
        ${isWinner && completed ? 'bg-neon-cyan/10 text-neon-cyan font-bold' : 'text-white/60'}`}
    >
      <span className="truncate max-w-[120px]">{name || 'TBD'}</span>
      {isWinner && completed && <Trophy className="w-3 h-3 shrink-0" />}
    </div>
  )
}

function Connector() {
  return (
    <div className="flex items-center">
      <div className="w-8 h-px bg-white/15" />
      <div className="w-px h-full bg-white/15" />
    </div>
  )
}

export default function BracketView({ matches, loading }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bracket</CardTitle>
        </CardHeader>
        <div className="h-48 flex items-center justify-center text-white/30 text-sm">
          Loading bracket…
        </div>
      </Card>
    )
  }

  // Group matches by round
  const rounds = {}
  matches.forEach((m) => {
    if (!rounds[m.round_number]) rounds[m.round_number] = []
    rounds[m.round_number].push(m)
  })

  const roundNumbers = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-neon-cyan" />
          Bracket
        </CardTitle>
      </CardHeader>

      <div className="overflow-x-auto scrollbar-neon pb-4">
        <div className="flex items-start gap-0 min-w-max">
          {roundNumbers.map((roundNum, roundIdx) => {
            const roundMatches = rounds[roundNum]
            const roundName = roundMatches[0]?.round_name || `Round ${roundNum}`
            const isLastRound = roundIdx === roundNumbers.length - 1

            return (
              <div key={roundNum} className="flex items-stretch gap-0">
                {/* Round column */}
                <div className="flex flex-col">
                  {/* Round label */}
                  <div className="text-center mb-4 px-4">
                    <span
                      className={`text-xs font-[Orbitron] uppercase tracking-widest
                        ${isLastRound ? 'text-neon-cyan' : 'text-white/40'}`}
                    >
                      {roundName}
                    </span>
                  </div>

                  {/* Matches in this round */}
                  <div
                    className="flex flex-col justify-around gap-4"
                    style={{ flex: 1 }}
                  >
                    {roundMatches.map((match, i) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 + roundIdx * 0.1 }}
                        className="flex items-center"
                      >
                        <MatchBox match={match} isWinner={isLastRound && match.completed} />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Connector lines between rounds */}
                {roundIdx < roundNumbers.length - 1 && (
                  <div className="flex flex-col justify-around py-10 px-0">
                    {roundMatches.map((_, i) => (
                      <div key={i} className="flex items-center self-center h-12">
                        <div className="w-6 h-px bg-white/15" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Winner display */}
          {roundNumbers.length > 0 && (() => {
            const lastRound = rounds[roundNumbers[roundNumbers.length - 1]]
            const finalMatch = lastRound?.[0]
            if (!finalMatch?.completed) return null
            return (
              <div className="flex flex-col items-center justify-center pl-6 gap-2">
                <div className="text-neon-cyan text-xs font-[Orbitron] uppercase tracking-widest mb-2">
                  Champion
                </div>
                <div className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 border-neon-cyan/40">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <span className="text-sm font-bold text-white">
                    {finalMatch.winner?.name || 'TBD'}
                  </span>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {matches.length === 0 && (
        <div className="text-center py-8 text-white/30 text-sm">No bracket data yet</div>
      )}
    </Card>
  )
}
