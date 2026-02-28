import { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, Trophy, Minus } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  // ── Completed state ──────────────────────────────────────────────────────────
  if (match.completed) {
    return (
      <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
        <Lock className="w-3.5 h-3.5 text-white/25 shrink-0" />
        <span className="text-xs font-[Orbitron] uppercase tracking-wider">
          {match.is_draw ? (
            <span className="text-white/40">Draw</span>
          ) : (
            <span className="text-neon-cyan/90">
              {match.winner?.name || "TBD"} wins
            </span>
          )}
        </span>
      </div>
    );
  }

  // ── Disabled (previous round pending) ───────────────────────────────────────
  if (disabled) {
    return (
      <div className="mt-2 text-xs text-white/20 italic px-1">
        Complete previous round first…
      </div>
    );
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!selected) return toast.error("Select a result first");
    setLoading(true);

    let error;
    if (tournament.type === "league") {
      const isDraw = selected === "draw";
      const winnerId = isDraw ? null : selected;
      ({ error } = await submitLeagueMatchResult({
        matchId: match.id,
        player1Id: match.player1_id,
        player2Id: match.player2_id,
        winnerId,
        isDraw,
        tournamentId: tournament.id,
        winPoints: tournament.win_points,
        drawPoints: tournament.draw_points,
        lossPoints: tournament.loss_points,
      }));
    } else {
      ({ error } = await submitKnockoutMatchResult({
        matchId: match.id,
        winnerId: selected,
        tournamentId: tournament.id,
        roundNumber: match.round_number,
        totalPlayers,
      }));
    }

    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to save result");
    } else {
      toast.success("Result saved!");
      onComplete?.();
    }
  }

  const options = [
    {
      value: match.player1_id,
      label: match.player1?.name || "Player 1",
      icon: <Trophy className="w-3 h-3" />,
    },
    {
      value: match.player2_id,
      label: match.player2?.name || "Player 2",
      icon: <Trophy className="w-3 h-3" />,
    },
  ];
  if (tournament.type === "league" && tournament.allow_draw) {
    options.push({
      value: "draw",
      label: "Draw",
      icon: <Minus className="w-3 h-3" />,
    });
  }

  return (
    <div className="mt-3 space-y-2">
      {/* Winner select label */}
      <span className="text-[9px] font-[Orbitron] uppercase tracking-widest text-white/30">
        Select Winner
      </span>

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          const isDraw = opt.value === "draw";
          return (
            <button
              key={opt.value}
              onClick={() => setSelected(isSelected ? null : opt.value)}
              disabled={loading}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold
                border transition-all duration-200
                ${
                  isSelected
                    ? isDraw
                      ? "bg-white/10 border-white/40 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                      : "bg-neon-purple/20 border-neon-purple/70 text-neon-purple shadow-[0_0_14px_rgba(184,69,245,0.25)]"
                    : "bg-white/[0.03] border-white/[0.08] text-white/45 hover:bg-white/[0.07] hover:text-white/75 hover:border-white/20"
                }
              `}
            >
              {isSelected && !isDraw && <Trophy className="w-3 h-3" />}
              {isSelected && isDraw && <Minus className="w-3 h-3" />}
              <span>{opt.label}</span>
            </button>
          );
        })}

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: -4 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
            >
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-[Orbitron]
                  uppercase tracking-wider border transition-all duration-200
                  bg-neon-cyan/15 border-neon-cyan/50 text-neon-cyan
                  hover:bg-neon-cyan/25 hover:border-neon-cyan
                  hover:shadow-[0_0_16px_rgba(6,214,245,0.3)]
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="w-3 h-3" />
                {loading ? "Saving…" : "Confirm"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
