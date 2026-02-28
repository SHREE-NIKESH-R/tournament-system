import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Trophy } from "lucide-react";
import { useTournament } from '@/hooks/useTournament'
import Leaderboard from '@/components/public/Leaderboard'
import BracketView from '@/components/public/BracketView'
import PageTransition from '@/components/shared/PageTransition'
import Badge from '@/components/ui/Badge'
import { getStatusConfig, getTypeConfig, formatDate } from '@/utils/tournament'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'

// â”€â”€â”€ Single match row for league rounds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MatchRow({ match, index }) {
  const p1Wins = match.completed && match.winner_id === match.player1_id;
  const p2Wins = match.completed && match.winner_id === match.player2_id;
  const isDraw = match.completed && match.is_draw;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`
        rounded-xl border overflow-hidden transition-all
        ${
          match.completed
            ? "border-white/[0.07] bg-white/[0.02]"
            : "border-white/[0.05] bg-transparent"
        }
      `}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
        {/* P1 */}
        <div
          className={`flex items-center gap-2 px-4 py-2.5 ${p1Wins ? "bg-neon-cyan/8" : ""}`}
        >
          <span
            className={`text-sm font-semibold truncate transition-colors
              ${p1Wins ? "text-neon-cyan" : isDraw ? "text-white/55" : "text-white/80"}`}
          >
            {match.player1?.name || "TBD"}
          </span>
          {p1Wins && <Trophy className="w-3.5 h-3.5 text-neon-cyan shrink-0" />}
        </div>

        {/* Centre */}
        <div className="flex items-center justify-center px-3 py-2.5 border-x border-white/[0.04]">
          {match.completed ? (
            <span
              className={`text-[10px] font-[Orbitron] uppercase tracking-widest
              ${isDraw ? "text-white/35" : "text-neon-cyan/50"}`}
            >
              {isDraw ? "Draw" : "Win"}
            </span>
          ) : (
            <span className="text-[10px] font-[Orbitron] text-white/18">
              vs
            </span>
          )}
        </div>

        {/* P2 */}
        <div
          className={`flex items-center justify-end gap-2 px-4 py-2.5 ${p2Wins ? "bg-neon-cyan/8" : ""}`}
        >
          {p2Wins && <Trophy className="w-3.5 h-3.5 text-neon-cyan shrink-0" />}
          <span
            className={`text-sm font-semibold truncate text-right transition-colors
              ${p2Wins ? "text-neon-cyan" : isDraw ? "text-white/55" : "text-white/80"}`}
          >
            {match.player2?.name || "TBD"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function RoundGroup({ roundName, matches }) {
  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-[Orbitron] uppercase tracking-[0.25em] text-neon-purple/55 mb-2.5">
        {roundName}
      </h4>
      <div className="space-y-1.5">
        {matches.map((match, i) => (
          <MatchRow key={match.id} match={match} index={i} />
        ))}
      </div>
    </div>
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          â† Back to home
        </Link>
      </div>
    )
  }

  const statusConfig = getStatusConfig(tournament.status)
  const typeConfig = getTypeConfig(tournament.type);

  // Group league matches by round
  const roundMap = {};
  matches.forEach((m) => {
    const key = m.round_name || `Round ${m.round_number}`;
    if (!roundMap[key]) roundMap[key] = [];
    roundMap[key].push(m);
  });

  return (
    <PageTransition>
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
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
          <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
          <span className="text-white/30 text-xs">
            {formatDate(tournament.created_at)}
          </span>
        </div>
        <h1 className="text-3xl font-[Orbitron] font-black text-white mb-1">
          {tournament.name}
        </h1>
        {tournament.type === "league" && (
          <p className="text-white/35 text-sm">
            Win:{" "}
            <span className="text-neon-cyan">{tournament.win_points}pts</span>
            {tournament.allow_draw && (
              <>
                {" "}
                Â· Draw:{" "}
                <span className="text-neon-cyan">
                  {tournament.draw_points}pts
                </span>
              </>
            )}{" "}
            Â· Loss:{" "}
            <span className="text-white/25">{tournament.loss_points}pts</span>
          </p>
        )}
      </motion.div>

      {/* Content */}
      {tournament.type === "league" ? (
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2">
            <Leaderboard standings={standings} loading={loading} />
          </div>
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Rounds</CardTitle>
                <span className="text-xs text-white/30">
                  {matches.filter((m) => m.completed).length}/{matches.length}{" "}
                  completed
                </span>
              </CardHeader>
              <div className="space-y-6">
                {Object.entries(roundMap).map(([roundName, roundMatches]) => (
                  <RoundGroup
                    key={roundName}
                    roundName={roundName}
                    matches={roundMatches}
                  />
                ))}
                {matches.length === 0 && (
                  <p className="text-white/30 text-sm text-center py-4">
                    No matches yet
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <BracketView matches={matches} loading={loading} />
      )}
    </PageTransition>
  );
}

