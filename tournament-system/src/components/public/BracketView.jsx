import { motion } from "framer-motion";
import { Trophy, Swords, Crown } from "lucide-react";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Layout Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const CARD_W = 200;
const CARD_H = 90;
const FOOTER_H = 22;
const TOTAL_CARD_H = CARD_H + FOOTER_H;
const COL_GAP = 56;
const MIN_ROW_GAP = 24; // slightly increased for better spacing
const LABEL_OFFSET = 28; // unified top offset for labels + svg + cards

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Layout Engine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function computeLayout(rounds) {
  const roundNums = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  if (!roundNums.length) return { positions: {}, totalHeight: 0 };

  const firstRoundCount = rounds[roundNums[0]].length;
  const baseSpan = TOTAL_CARD_H + MIN_ROW_GAP;
  const totalHeight = firstRoundCount * baseSpan - MIN_ROW_GAP;

  const positions = {};

  roundNums.forEach((roundNum, rIdx) => {
    const matchesInRound = rounds[roundNum];
    const count = matchesInRound.length;
    const span = (totalHeight + MIN_ROW_GAP) / count;

    matchesInRound.forEach((match, mIdx) => {
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Player Slot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function PlayerSlot({ name, isWinner, isLoser, completed }) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2.5 transition-all
        ${
          isWinner && completed
            ? "bg-gradient-to-r from-cyan-500/20 to-transparent border-l-[3px] border-cyan-400"
            : "border-l-[3px] border-transparent"
        }`}
      style={{ height: CARD_H / 2 }}
    >
      <span
        className={`text-sm font-semibold truncate
          ${
            isWinner && completed
              ? "text-cyan-300"
              : isLoser && completed
                ? "text-white/30"
                : "text-white/85"
          }`}
        style={{ maxWidth: CARD_W - 48 }}
      >
        {name ?? <span className="text-white/20 italic text-xs">TBD</span>}
      </span>

      {isWinner && completed && (
        <Trophy className="w-3.5 h-3.5 text-cyan-400" />
      )}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Match Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function MatchCard({ match, isFinal }) {
  const p1Wins = match.completed && match.winner_id === match.player1_id;
  const p2Wins = match.completed && match.winner_id === match.player2_id;
  const isDraw = match.completed && match.is_draw;

  return (
    <div
      className={`absolute rounded-xl overflow-hidden transition-all
        ${
          isFinal && match.completed
            ? "border border-yellow-400/50 shadow-[0_0_28px_rgba(250,204,21,0.2)]"
            : match.completed
              ? "border border-cyan-500/25"
              : "border border-white/10"
        }
        bg-[rgba(8,5,22,0.92)] backdrop-blur-sm`}
      style={{ width: CARD_W }}
    >
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

      <div
        className="px-3 flex items-center border-t border-white/[0.04]"
        style={{ height: FOOTER_H }}
      >
        {match.completed ? (
          <span className="text-[10px] tracking-wider text-cyan-400/80">
            {isDraw ? "âš¡ Draw" : `âœ“ ${match.winner?.name ?? "TBD"} wins`}
          </span>
        ) : (
          <span className="text-[10px] text-white/18">Pending</span>
        )}
      </div>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Champion Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function ChampionBanner({ name, x, y }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 180, damping: 14 }}
      className="absolute flex flex-col items-center gap-2"
      style={{ left: x, top: y - 20 }}
    >
      <span className="text-[9px] uppercase tracking-[0.35em] text-yellow-400/60">
        Champion
      </span>

      <div
        className="rounded-2xl px-5 py-4 flex flex-col items-center gap-2
        bg-gradient-to-b from-yellow-400/15 to-yellow-400/3
        border border-yellow-400/45"
      >
        <Crown className="w-5 h-5 text-yellow-400" />
        <span className="font-bold text-sm text-white text-center">{name}</span>
      </div>
    </motion.div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export default function BracketView({ matches, loading }) {
  if (loading) return null;
  if (!matches.length) return null;

  const rounds = {};
  matches.forEach((m) => {
    if (!rounds[m.round_number]) rounds[m.round_number] = [];
    rounds[m.round_number].push(m);
  });

  const { positions, totalHeight, roundNums } = computeLayout(rounds);

  const totalRounds = roundNums.length;
  const lastRound = roundNums[totalRounds - 1];
  const finalMatch =
    rounds[lastRound]?.length === 1 ? rounds[lastRound][0] : null;
  const champion =
    finalMatch?.completed && finalMatch.winner ? finalMatch.winner : null;

  const canvasWidth =
    totalRounds * (CARD_W + COL_GAP) - COL_GAP + (champion ? 180 : 0);

  const canvasHeight = Math.max(totalHeight, 200);

  /* â”€â”€â”€â”€â”€ Connector Lines â”€â”€â”€â”€â”€ */

  const connectorPaths = [];

  for (let r = 0; r < roundNums.length - 1; r++) {
    const cur = rounds[roundNums[r]];
    const next = rounds[roundNums[r + 1]];

    for (let i = 0; i < next.length; i++) {
      const child1 = cur[i * 2];
      const child2 = cur[i * 2 + 1];
      const parent = next[i];

      if (!child1 || !child2) continue;

      const p1 = positions[child1.id];
      const p2 = positions[child2.id];
      const pN = positions[parent.id];

      if (!p1 || !p2 || !pN) continue;

      const x1 = p1.x + CARD_W;
      const xMid = x1 + COL_GAP / 2;

      connectorPaths.push(
        <g key={`${r}-${i}`}>
          <line
            x1={x1}
            y1={p1.centerY + LABEL_OFFSET}
            x2={xMid}
            y2={p1.centerY + LABEL_OFFSET}
            stroke="rgba(139,92,246,0.3)"
            strokeWidth="1.5"
          />
          <line
            x1={x1}
            y1={p2.centerY + LABEL_OFFSET}
            x2={xMid}
            y2={p2.centerY + LABEL_OFFSET}
            stroke="rgba(139,92,246,0.3)"
            strokeWidth="1.5"
          />
          <line
            x1={xMid}
            y1={p1.centerY + LABEL_OFFSET}
            x2={xMid}
            y2={p2.centerY + LABEL_OFFSET}
            stroke="rgba(139,92,246,0.2)"
            strokeWidth="1"
          />
          <line
            x1={xMid}
            y1={pN.centerY + LABEL_OFFSET}
            x2={pN.x}
            y2={pN.centerY + LABEL_OFFSET}
            stroke="rgba(139,92,246,0.4)"
            strokeWidth="1.5"
          />
        </g>,
      );
    }
  }

  /* â”€â”€â”€â”€â”€ Render â”€â”€â”€â”€â”€ */

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-cyan-400" /> Bracket
        </CardTitle>
      </CardHeader>

      <div className="overflow-x-visible pb-6 pt-2">
        <div
          className="relative"
          style={{
            width: canvasWidth,
            height: canvasHeight + LABEL_OFFSET,
          }}
        >
          <svg
            className="absolute inset-0 pointer-events-none"
            width={canvasWidth}
            height={canvasHeight + LABEL_OFFSET}
          >
            {connectorPaths}
          </svg>

          {roundNums.map((roundNum, rIdx) =>
            rounds[roundNum].map((match) => {
              const pos = positions[match.id];
              if (!pos) return null;

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y + LABEL_OFFSET,
                  }}
                >
                  <MatchCard match={match} isFinal={rIdx === totalRounds - 1} />
                </motion.div>
              );
            }),
          )}

          {champion && finalMatch && (
            <ChampionBanner
              name={champion.name}
              x={positions[finalMatch.id].x + CARD_W + 40}
              y={positions[finalMatch.id].centerY + LABEL_OFFSET}
            />
          )}
        </div>
      </div>
    </Card>
  );
}

