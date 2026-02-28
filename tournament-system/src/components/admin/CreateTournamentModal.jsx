import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Trophy, Swords, Users } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { createLeagueTournament, createKnockoutTournament } from '@/lib/tournamentService'
import { useNavigate } from 'react-router-dom'

export default function CreateTournamentModal({ type, onClose }) {
  const navigate = useNavigate()
  const isLeague = type === 'league'

  const [name, setName] = useState('')
  const [allowDraw, setAllowDraw] = useState(false)
  const [winPoints, setWinPoints] = useState(3)
  const [drawPoints, setDrawPoints] = useState(1)
  const [lossPoints, setLossPoints] = useState(0)
  const [playerNames, setPlayerNames] = useState(['', ''])
  const [loading, setLoading] = useState(false)

  function addPlayer() {
    setPlayerNames((p) => [...p, ''])
  }

  function removePlayer(index) {
    setPlayerNames((p) => p.filter((_, i) => i !== index))
  }

  function updatePlayer(index, value) {
    setPlayerNames((p) => p.map((n, i) => (i === index ? value : n)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validNames = playerNames.filter((n) => n.trim())

    if (!name.trim()) return toast.error('Tournament name required')
    if (validNames.length < 2) return toast.error('Need at least 2 players')

    if (!isLeague) {
      // Knockout needs power of 2
      const n = validNames.length
      if (n < 2) return toast.error('Need at least 2 players')
    }

    setLoading(true)

    let result
    if (isLeague) {
      result = await createLeagueTournament({
        name: name.trim(),
        allowDraw,
        winPoints: Number(winPoints),
        drawPoints: Number(drawPoints),
        lossPoints: Number(lossPoints),
        playerNames: validNames,
      })
    } else {
      result = await createKnockoutTournament({
        name: name.trim(),
        playerNames: validNames,
      })
    }

    setLoading(false)

    if (result.error) {
      toast.error(result.error.message || 'Failed to create tournament')
    } else {
      toast.success('Tournament created!')
      onClose()
      navigate(`/admin/tournament/${result.data.id}`)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="glass-card rounded-2xl w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto scrollbar-neon"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center
                ${isLeague ? 'bg-neon-purple/15 border border-neon-purple/25' : 'bg-neon-cyan/15 border border-neon-cyan/25'}`}
            >
              {isLeague ? (
                <Trophy className="w-5 h-5 text-neon-purple" />
              ) : (
                <Swords className="w-5 h-5 text-neon-cyan" />
              )}
            </div>
            <div>
              <h2 className="font-[Orbitron] font-bold text-white text-sm uppercase tracking-widest">
                New {isLeague ? 'League' : 'Knockout'}
              </h2>
              <p className="text-xs text-white/40 mt-0.5">
                {isLeague ? 'Round Robin Format' : 'Single Elimination'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tournament Name */}
          <Input
            label="Tournament Name"
            placeholder="e.g. Chess Championship 2024"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* League-only settings */}
          {isLeague && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAllowDraw(!allowDraw)}
                  className={`w-10 h-5 rounded-full transition-all relative
                    ${allowDraw ? 'bg-neon-purple/60' : 'bg-white/10'}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                      ${allowDraw ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
                <span className="text-sm text-white/60">Allow Draws</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Win Points"
                  type="number"
                  min="0"
                  value={winPoints}
                  onChange={(e) => setWinPoints(e.target.value)}
                />
                <Input
                  label="Draw Points"
                  type="number"
                  min="0"
                  value={drawPoints}
                  onChange={(e) => setDrawPoints(e.target.value)}
                  disabled={!allowDraw}
                />
                <Input
                  label="Loss Points"
                  type="number"
                  min="0"
                  value={lossPoints}
                  onChange={(e) => setLossPoints(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Players */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-[Orbitron] uppercase tracking-widest text-white/50 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Players ({playerNames.filter((n) => n.trim()).length})
              </label>
              {!isLeague && (
                <span className="text-xs text-white/30">
                  Bracket will auto-shuffle
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-neon pr-1">
              <AnimatePresence>
                {playerNames.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex gap-2"
                  >
                    <input
                      className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10
                        text-white/90 placeholder:text-white/25 focus:outline-none
                        focus:border-neon-purple/50 transition-all font-[Rajdhani]"
                      placeholder={`Player ${i + 1}`}
                      value={n}
                      onChange={(e) => updatePlayer(i, e.target.value)}
                    />
                    {playerNames.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(i)}
                        className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20
                          flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={addPlayer}
              className="w-full py-2 rounded-lg border border-dashed border-white/15 text-white/30
                hover:border-neon-purple/30 hover:text-neon-purple/60 transition-all text-sm
                flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Player
            </button>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isLeague ? 'purple' : 'cyan'}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating…' : 'Create Tournament'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
