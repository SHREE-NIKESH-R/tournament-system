import { motion } from 'framer-motion'
import { Trophy, Swords, Crown } from "lucide-react";
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'

// ─── Layout constants ─────────────────────────────────────────────────────────
const CARD_W = 200; // match card width
const CARD_H = 90; // match card height (without footer — footer is extra)
const FOOTER_H = 22; // "X wins" footer height
const TOTAL_CARD_H = CARD_H + FOOTER_H; // full rendered height
const COL_GAP = 56; // horizontal gap between columns (connector region)
const MIN_ROW_GAP = 16; // minimum vertical gap between sibling cards in same round

/**
 * Core layout engine.
 *
 * For a bracket with R rounds and N = 2^R players:
 * - Round 1 has N/2 matches.
 * - Round r has N / 2^r matches.
 * - Each match in round r "owns" a vertical span of:
 *     span(r) = (TOTAL_CARD_H + MIN_ROW_GAP) * 2^(r-1) - MIN_ROW_GAP
 *   (two children + the gap between them, recursively)
 *
 * The center Y of match i in round r is:
 *     span(r) * i + span(r)/2
 *
 * This guarantees perfect vertical centering at every level.
 */
function computeLayout(rounds) {
  const roundNums = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);
  if (!roundNums.length) return { positions: {}, totalHeight: 0 };

  const firstRoundCount = rounds[roundNums[0]].length;
  // base unit: space one first-round match occupies
  const baseSpan = TOTAL_CARD_H + MIN_ROW_GAP;

  // total canvas height driven by first round
  const totalHeight = firstRoundCount * baseSpan - MIN_ROW_GAP;

  const positions = {}; // matchId → { x, y (top-left of card) }

  roundNums.forEach((roundNum, rIdx) => {
    const matchesInRound = rounds[roundNum];
    const count = matchesInRound.length;
    // how many first-round slots each match in this round spans
    const span = (totalHeight + MIN_ROW_GAP) / count;

    matchesInRound.forEach((match, mIdx) => {
      // center Y of this match
      const centerY = span * mIdx + span / 2;
      positions[match.id] = {
        x: rIdx * (CARD_W + COL_GAP),
        y: centerY - TOTAL_CARD_H / 2,
        centerY,
      };
    });
  });

  return { positions, totalHeight, roundNums };
}

// ─── PlayerSlot ───────────────────────────────────────────────────────────────
function PlayerSlot({ name, isWinner, isLoser, completed }) {
  return (
    <div
      className={`
        flex items-center justify-between gap-2 px-3 py-2.5 transition-all duration-200
        ${
          isWinner && completed
            ? "bg-gradient-to-r from-cyan-500/20 to-transparent border-l-[3px] border-cyan-400"
            : "border-l-[3px] border-transparent"
        }
      `}
      style={{ height: CARD_H / 2 }}
    >
      <span
        className={`text-sm font-semibold truncate transition-colors leading-tight
          ${
            isWinner && completed
              ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
              : isLoser && completed
                ? "text-white/30"
                : "text-white/85"
          }`}
        style={{ maxWidth: CARD_W - 48 }}
      >
        {name ?? (
          <span className="text-white/20 italic font-normal text-xs">TBD</span>
        )}
      </span>
      {isWinner && completed && (
        <Trophy className="w-3.5 h-3.5 text-cyan-400 shrink-0 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
      )}
    </div>
  );
}

// ─── MatchCard ────────────────────────────────────────────────────────────────
function MatchCard({ match, isFinal, style }) {
  const p1Wins = match.completed && match.winner_id === match.player1_id;
  const p2Wins = match.completed && match.winner_id === match.player2_id;
  const isDraw = match.completed && match.is_draw;

  return (
    <div
      className={`
        absolute rounded-xl overflow-hidden transition-all duration-300
        ${
          isFinal && match.completed
            ? "border border-yellow-400/50 shadow-[0_0_28px_rgba(250,204,21,0.2)]"
            : match.completed
              ? "border border-cyan-500/25 shadow-[0_0_12px_rgba(34,211,238,0.08)]"
              : "border border-white/10 hover:border-purple-500/35"
        }
        bg-[rgba(8,5,22,0.92)] backdrop-blur-sm
      `}
      style={{ width: CARD_W, ...style }}
    >
      {/* Grand Final badge */}
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
      <div
        className="px-3 flex items-center border-t border-white/[0.04]"
        style={{ height: FOOTER_H }}
      >
        {match.completed ? (
          <span className="text-[10px] font-[Orbitron] tracking-wider text-cyan-400/80 truncate">
            {isDraw ? "⚡ Draw" : `✓ ${match.winner?.name ?? "TBD"} wins`}
          </span>
        ) : match.player1 && match.player2 ? (
          <span className="text-[10px] font-[Orbitron] tracking-wider text-white/18">
            Pending
          </span>
        ) : (
          <span className="text-[10px] font-[Orbitron] tracking-wider text-white/12">
            Waiting…
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Champion Banner ──────────────────────────────────────────────────────────
function ChampionBanner({ name, y }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.15 }}
      className="absolute flex flex-col items-center gap-2"
      style={{ top: y - 20 }}
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
          flex items-center justify-center shadow-[0_0_18px_rgba(250,204,21,0.5)]"
        >
          <Crown className="w-5 h-5 text-yellow-400" />
        </div>
        <span
          className="font-[Orbitron] font-black text-sm text-white text-center"
          style={{ maxWidth: 130 }}
        >
          {name}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BracketView({ matches, loading }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-cyan-400" /> Bracket
          </CardTitle>
        </CardHeader>
        <div className="h-40 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  if (!matches.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-cyan-400" /> Bracket
          </CardTitle>
        </CardHeader>
        <div className="text-center py-8 text-white/30 text-sm">
          No bracket data yet
        </div>
      </Card>
    );
  }

  // Group by round
  const rounds = {};
  matches.forEach((m) => {
    if (!rounds[m.round_number]) rounds[m.round_number] = [];
    rounds[m.round_number].push(m);
  });

  const { positions, totalHeight, roundNums } = computeLayout(rounds);
  if (!roundNums) return null;

  const totalRounds = roundNums.length;
  const lastRoundNum = roundNums[totalRounds - 1];
  const finalMatch =
    rounds[lastRoundNum]?.length === 1 ? rounds[lastRoundNum][0] : null;
  const champion =
    finalMatch?.completed && finalMatch.winner ? finalMatch.winner : null;

  // Canvas dimensions
  const canvasWidth =
    totalRounds * (CARD_W + COL_GAP) - COL_GAP + (champion ? 160 + 24 : 0); // extra space for champion
  const canvasHeight = Math.max(totalHeight, 200);

  // Build SVG connector paths between consecutive rounds
  const connectorPaths = [];
  for (let rIdx = 0; rIdx < roundNums.length - 1; rIdx++) {
    const curRoundNum = roundNums[rIdx];
    const nextRoundNum = roundNums[rIdx + 1];
    const curMatches = rounds[curRoundNum];
    const nextMatches = rounds[nextRoundNum];

    // Each pair of current matches feeds into one next match
    for (let ni = 0; ni < nextMatches.length; ni++) {
      const nextMatch = nextMatches[ni];
      const child1 = curMatches[ni * 2];
      const child2 = curMatches[ni * 2 + 1];

      if (!child1 || !child2) continue;

      const p1 = positions[child1.id];
      const p2 = positions[child2.id];
      const pN = positions[nextMatch.id];

      if (!p1 || !p2 || !pN) continue;

      // Right edge of current round cards
      const x1 = p1.x + CARD_W;
      const y1 = p1.centerY;
      const x2 = p2.x + CARD_W;
      const y2 = p2.centerY;
      // Left edge of next round card
      const xN = pN.x;
      const yN = pN.centerY;
      // Midpoint X for the elbow
      const xMid = x1 + COL_GAP / 2;

      connectorPaths.push(
        <g key={`c-${rIdx}-${ni}`}>
          {/* Stub from child1 → elbow */}
          <line
            x1={x1}
            y1={y1}
            x2={xMid}
            y2={y1}
            stroke="rgba(139,92,246,0.3)"
            strokeWidth="1.5"
          />
          {/* Stub from child2 → elbow */}
          <line
            x1={x2}
            y1={y2}
            x2={xMid}
            y2={y2}
            stroke="rgba(139,92,246,0.3)"
            strokeWidth="1.5"
          />
          {/* Vertical bracket joining the two stubs */}
          <line
            x1={xMid}
            y1={y1}
            x2={xMid}
            y2={y2}
            stroke="rgba(139,92,246,0.2)"
            strokeWidth="1"
          />
          {/* Output line from bracket midpoint → next match */}
          <line
            x1={xMid}
            y1={yN}
            x2={xN}
            y2={yN}
            stroke="rgba(139,92,246,0.4)"
            strokeWidth="1.5"
          />
        </g>,
      );
    }
  }

  // Champion connector line from final match
  let championX = 0;
  let championY = 0;
  if (champion && finalMatch) {
    const pos = positions[finalMatch.id];
    if (pos) {
      const xStart = pos.x + CARD_W;
      championX = xStart + 24; // after the line
      championY = pos.centerY;
      connectorPaths.push(
        <line
          key="champ-line"
          x1={xStart}
          y1={pos.centerY}
          x2={xStart + 24}
          y2={pos.centerY}
          stroke="rgba(250,204,21,0.4)"
          strokeWidth="1.5"
        />,
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-cyan-400" /> Bracket
        </CardTitle>
        <span className="text-xs text-white/30 font-[Rajdhani]">
          {totalRounds} round{totalRounds !== 1 ? "s" : ""} · {matches.length}{" "}
          matches
        </span>
      </CardHeader>

      <div className="overflow-x-auto scrollbar-neon pb-6 pt-2">
        <div
          className="relative"
          style={{ width: canvasWidth, height: canvasHeight + 40 }}
        >
          {/* Round labels */}
          {roundNums.map((roundNum, rIdx) => {
            const roundMatches = rounds[roundNum];
            const roundName =
              roundMatches[0]?.round_name || `Round ${roundNum}`;
            const isFinal = rIdx === totalRounds - 1;
            const x = rIdx * (CARD_W + COL_GAP);

            return (
              <div
                key={`label-${roundNum}`}
                className="absolute text-center"
                style={{ left: x, top: 0, width: CARD_W }}
              >
                <span
                  className={`text-[10px] font-[Orbitron] uppercase tracking-[0.22em]
                    ${isFinal ? "text-yellow-400/80" : "text-white/30"}`}
                >
                  {roundName}
                </span>
              </div>
            );
          })}

          {/* SVG connector lines — rendered behind cards */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={canvasWidth}
            height={canvasHeight + 40}
            style={{ top: 20 }} // offset for labels
          >
            {connectorPaths}
          </svg>

          {/* Match cards */}
          {roundNums.map((roundNum, rIdx) => {
            const roundMatches = rounds[roundNum];
            const isFinal = rIdx === totalRounds - 1;

            return roundMatches.map((match, mIdx) => {
              const pos = positions[match.id];
              if (!pos) return null;

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: mIdx * 0.06 + rIdx * 0.08,
                    duration: 0.28,
                  }}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y + 20 /* label offset */,
                  }}
                >
                  <MatchCard match={match} isFinal={isFinal} style={{}} />
                </motion.div>
              );
            });
          })}

          {/* Champion banner */}
          {champion && (
            <div style={{ position: "absolute", left: championX, top: 20 }}>
              <ChampionBanner name={champion.name} y={championY} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}