import { motion } from 'framer-motion'
import { Trophy, Swords, Crown } from "lucide-react";
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'

// ─── Layout constants ─────────────────────────────────────────────────────────
const MATCH_HEIGHT = 88    // px — total rendered height of one match card (without result label, added via padding)
const MATCH_GAP    = 28    // px — vertical gap between sibling match cards
const ROUND_WIDTH  = 210   // px — width of each match card
const CONN_W       = 48    // px — width of SVG connector region

// ─── PlayerSlot ───────────────────────────────────────────────────────────────
function PlayerSlot({ name, isWinner, isLoser, completed }) {
  return (
    <div
      className={`
        flex items-center justify-between gap-2 px-3 py-2.5 transition-all duration-300
        ${
          isWinner && completed
            ? "bg-gradient-to-r from-neon-cyan/25 to-transparent border-l-[3px] border-neon-cyan"
            : isLoser && completed
              ? "opacity-35 border-l-[3px] border-transparent"
              : "border-l-[3px] border-transparent"
        }
      `}
    >
      <span
        className={`text-sm font-semibold truncate max-w-[140px] transition-colors
          ${isWinner && completed ? "text-neon-cyan drop-shadow-[0_0_8px_rgba(6,214,245,0.6)]" : "text-white/85"}`}
      >
        {name ?? (
          <span className="text-white/20 italic font-normal text-xs">TBD</span>
        )}
      </span>
      {isWinner && completed && (
        <Trophy className="w-3.5 h-3.5 text-neon-cyan shrink-0 drop-shadow-[0_0_6px_rgba(6,214,245,0.8)]" />
      )}
    </div>
  );
}

// ─── MatchCard ────────────────────────────────────────────────────────────────
function MatchCard({ match, isFinal }) {
  const p1Wins = match.completed && match.winner_id === match.player1_id
  const p2Wins = match.completed && match.winner_id === match.player2_id

  return (
    <div
      className={`
        rounded-xl overflow-hidden transition-all duration-300
        ${
          isFinal && match.completed
            ? "border border-yellow-400/50 shadow-[0_0_28px_rgba(250,204,21,0.18)]"
            : match.completed
              ? "border border-neon-cyan/25 shadow-[0_0_14px_rgba(6,214,245,0.1)]"
              : "border border-white/10 hover:border-neon-purple/35"
        }
        bg-[rgba(8,6,22,0.9)] backdrop-blur-sm
      `}
      style={{ width: ROUND_WIDTH }}
    >
      {/* Final badge */}
      {isFinal && (
        <div className="bg-yellow-400/10 border-b border-yellow-400/15 px-3 py-1 flex items-center gap-1.5">
          <Crown className="w-3 h-3 text-yellow-400" />
          <span className="text-[9px] font-[Orbitron] uppercase tracking-[0.25em] text-yellow-400">
            Grand Final
          </span>
        </div>
      )}

      <PlayerSlot
        name={match.player1?.name}
        isWinner={p1Wins}
        isLoser={p2Wins}
        completed={match.completed}
      />
      <div className="mx-3 h-px bg-white/[0.05]" />
      <PlayerSlot
        name={match.player2?.name}
        isWinner={p2Wins}
        isLoser={p1Wins}
        completed={match.completed}
      />

      {/* Result footer */}
      <div className="px-3 py-1.5 min-h-[22px]">
        {match.completed ? (
          <span className="text-[10px] font-[Orbitron] tracking-wider text-neon-cyan/80">
            {match.is_draw
              ? "⚡ Draw"
              : `✓ ${match.winner?.name ?? "TBD"} wins`}
          </span>
        ) : match.player1 && match.player2 ? (
          <span className="text-[10px] font-[Orbitron] tracking-wider text-white/20">
            Pending
          </span>
        ) : (
          <span className="text-[10px] font-[Orbitron] tracking-wider text-white/15">
            Waiting…
          </span>
        )}
      </div>
    </div>
  );
}

// ─── SVG Connectors ───────────────────────────────────────────────────────────
// Draws bracket elbow lines pairing adjacent matches to the next round match.
// matchCount = number of matches in the LEFT/current round column.
function RoundConnectors({ matchCount, topOffset }) {
  const slotH = MATCH_HEIGHT + MATCH_GAP; // vertical space per match slot

  // The connectors span the full height of all matchCount matches
  const totalH = matchCount * slotH - MATCH_GAP;
  const paths = [];

  for (let i = 0; i < matchCount; i += 2) {
    const y1 = i * slotH + MATCH_HEIGHT / 2; // center of top match
    const y2 = (i + 1) * slotH + MATCH_HEIGHT / 2; // center of bottom match
    const midY = (y1 + y2) / 2;

    paths.push(
      <g key={i}>
        {/* Stub right from top match */}
        <line
          x1={0}
          y1={y1}
          x2={CONN_W / 2}
          y2={y1}
          stroke="rgba(184,69,245,0.22)"
          strokeWidth="1.5"
        />
        {/* Stub right from bottom match */}
        <line
          x1={0}
          y1={y2}
          x2={CONN_W / 2}
          y2={y2}
          stroke="rgba(184,69,245,0.22)"
          strokeWidth="1.5"
        />
        {/* Vertical bracket */}
        <line
          x1={CONN_W / 2}
          y1={y1}
          x2={CONN_W / 2}
          y2={y2}
          stroke="rgba(184,69,245,0.20)"
          strokeWidth="1"
        />
        {/* Output line to next round */}
        <line
          x1={CONN_W / 2}
          y1={midY}
          x2={CONN_W}
          y2={midY}
          stroke="rgba(184,69,245,0.35)"
          strokeWidth="1.5"
        />
      </g>,
    );
  }

  return (
    <svg
      width={CONN_W}
      height={totalH}
      style={{ overflow: "visible", display: "block", flexShrink: 0 }}
    >
      {paths}
    </svg>
  );
}

// ─── ChampionBanner ───────────────────────────────────────────────────────────
function ChampionBanner({ name }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.2 }}
      className="flex flex-col items-center justify-center gap-2"
      style={{ paddingLeft: 16 }}
    >
      <span className="text-[9px] font-[Orbitron] uppercase tracking-[0.35em] text-yellow-400/60">
        Champion
      </span>
      <div
        className="rounded-2xl px-5 py-4 flex flex-col items-center gap-2
          bg-gradient-to-b from-yellow-400/15 to-yellow-400/3
          border border-yellow-400/45
          shadow-[0_0_36px_rgba(250,204,21,0.22)]"
      >
        <div
          className="w-11 h-11 rounded-full bg-yellow-400/20 border-2 border-yellow-400/50
            flex items-center justify-center
            shadow-[0_0_18px_rgba(250,204,21,0.45)]"
        >
          <Crown className="w-5 h-5 text-yellow-400" />
        </div>
        <span className="font-[Orbitron] font-black text-sm text-white text-center max-w-[130px] leading-tight">
          {name}
        </span>
      </div>
    </motion.div>
  );
}

// ─── BracketView (main) ───────────────────────────────────────────────────────
export default function BracketView({ matches, loading }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-neon-cyan" /> Bracket
          </CardTitle>
        </CardHeader>
        <div className="h-40 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  if (!matches.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-neon-cyan" /> Bracket
          </CardTitle>
        </CardHeader>
        <div className="text-center py-8 text-white/30 text-sm">
          No bracket data yet
        </div>
      </Card>
    );
  }

  // Group by round_number
  const rounds = {};
  matches.forEach((m) => {
    if (!rounds[m.round_number]) rounds[m.round_number] = [];
    rounds[m.round_number].push(m);
  });
  const roundNums = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);
  const totalRounds = roundNums.length;

  // Champion: only when the single final-round match is completed
  const lastRoundNum = roundNums[totalRounds - 1];
  const lastRoundMatches = rounds[lastRoundNum];
  const finalMatch =
    lastRoundMatches?.length === 1 ? lastRoundMatches[0] : null;
  const champion =
    finalMatch?.completed && finalMatch.winner ? finalMatch.winner : null;

  const slotH = MATCH_HEIGHT + MATCH_GAP; // vertical pitch per match in a round

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-neon-cyan" /> Bracket
        </CardTitle>
        <span className="text-xs text-white/30 font-[Rajdhani]">
          {totalRounds} round{totalRounds !== 1 ? "s" : ""} · {matches.length}{" "}
          matches
        </span>
      </CardHeader>

      <div className="overflow-x-auto scrollbar-neon pb-6 pt-3">
        {/* min-w-max prevents the flex from collapsing */}
        <div className="flex items-start" style={{ width: "max-content" }}>
          {roundNums.map((roundNum, rIdx) => {
            const roundMatches = rounds[roundNum];
            const count = roundMatches.length;
            const isFinal = rIdx === totalRounds - 1;

            // Vertical offset to center this round's matches within their
            // "inherited" vertical space from the previous round.
            // Round 0 → offset 0. Each subsequent halving adds half a slot of centering.
            let topPad = 0;
            if (rIdx > 0) {
              // previous round had count*2 matches, so each "pair slot" spans 2 * slotH
              // our first match centers at slot 0.5 of prev → shift by half a slot
              topPad = slotH / 2;
              // accumulate for each round
              for (let r = 1; r < rIdx; r++) {
                topPad += slotH * Math.pow(2, r - 1);
              }
            }

            const roundName =
              roundMatches[0]?.round_name || `Round ${roundNum}`;

            return (
              <div
                key={roundNum}
                className="flex items-start"
                style={{ gap: 0 }}
              >
                {/* ── Round column ── */}
                <div style={{ paddingTop: topPad }}>
                  {/* Label row */}
                  <div
                    className="text-center mb-3"
                    style={{ width: ROUND_WIDTH }}
                  >
                    <span
                      className={`text-[10px] font-[Orbitron] uppercase tracking-[0.22em]
                        ${isFinal ? "text-yellow-400/80" : "text-white/35"}`}
                    >
                      {roundName}
                    </span>
                  </div>

                  {/* Match cards */}
                  {roundMatches.map((match, mIdx) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: mIdx * 0.07 + rIdx * 0.1,
                        duration: 0.28,
                      }}
                      style={{ marginBottom: mIdx < count - 1 ? MATCH_GAP : 0 }}
                    >
                      <MatchCard match={match} isFinal={isFinal} />
                    </motion.div>
                  ))}
                </div>

                {/* ── SVG connectors to next round ── */}
                {rIdx < totalRounds - 1 && count >= 2 && (
                  <div style={{ paddingTop: topPad + 22 /* label height */ }}>
                    <RoundConnectors matchCount={count} />
                  </div>
                )}

                {/* Single horizontal line from final → champion */}
                {isFinal && champion && (
                  <div
                    style={{
                      paddingTop: topPad + 22,
                      height: MATCH_HEIGHT + 24, // account for result footer
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className="bg-yellow-400/30"
                      style={{ width: 24, height: 1 }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Champion banner — only after final match is done */}
          {champion && <ChampionBanner name={champion.name} />}
        </div>
      </div>
    </Card>
  );
}
