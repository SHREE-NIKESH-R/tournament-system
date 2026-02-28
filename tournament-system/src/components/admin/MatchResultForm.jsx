import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { submitLeagueMatchResult, submitKnockoutMatchResult } from '@/lib/tournamentService'

export default function MatchResultForm({
  match,
  tournament,
  totalPlayers,
  onComplete,
  disabled,
}) {
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  if (match.completed) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/30 py-1">
        <Lock className="w-3 h-3" />
        <span>
          {match.is_draw
            ? 'Draw'
            : `${match.winner?.name || 'TBD'} wins`}
        </span>
      </div>
    )
  }

  if (disabled) {
    return (
      <div className="text-xs text-white/20 italic">Previous rounds pending…</div>
    )
  }

  async function handleSubmit() {
    if (!selected) return toast.error('Select a result first')
    setLoading(true)

    let error
    if (tournament.type === 'league') {
      const isDraw = selected === 'draw'
      const winnerId = isDraw ? null : selected
      ;({ error } = await submitLeagueMatchResult({
        matchId: match.id,
        player1Id: match.player1_id,
        player2Id: match.player2_id,
        winnerId,
        isDraw,
        tournamentId: tournament.id,
        winPoints: tournament.win_points,
        drawPoints: tournament.draw_points,
        lossPoints: tournament.loss_points,
      }))
    } else {
      ;({ error } = await submitKnockoutMatchResult({
        matchId: match.id,
        winnerId: selected,
        tournamentId: tournament.id,
        roundNumber: match.round_number,
        totalPlayers,
      }))
    }

    setLoading(false)

    if (error) {
      toast.error(error.message || 'Failed to save result')
    } else {
      toast.success('Result saved!')
      onComplete?.()
    }
  }

  const options = [
    { value: match.player1_id, label: match.player1?.name || 'Player 1' },
    { value: match.player2_id, label: match.player2?.name || 'Player 2' },
  ]

  if (tournament.type === 'league' && tournament.allow_draw) {
    options.push({ value: 'draw', label: 'Draw' })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setSelected(opt.value)}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
            ${
              selected === opt.value
                ? 'bg-neon-purple/20 border-neon-purple/60 text-neon-purple'
                : 'bg-white/3 border-white/10 text-white/50 hover:bg-white/6 hover:text-white/80'
            }`}
        >
          {opt.label}
        </button>
      ))}

      {selected && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Button
            size="sm"
            variant="cyan"
            onClick={handleSubmit}
            disabled={loading}
          >
            <Check className="w-3 h-3" />
            {loading ? 'Saving…' : 'Confirm'}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
