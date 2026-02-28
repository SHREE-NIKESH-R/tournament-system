import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Clock, Trophy, Crown } from "lucide-react";
import { useTournament } from '@/hooks/useTournament'
import MatchResultForm from '@/components/admin/MatchResultForm'
import Leaderboard from '@/components/public/Leaderboard'
import BracketView from '@/components/public/BracketView'
import PageTransition from '@/components/shared/PageTransition'
import Badge from '@/components/ui/Badge'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import { getStatusConfig, getTypeConfig, formatDate } from '@/utils/tournament'

// ─── MatchAdminRow ─────────────────────────────────────────────────────────────
function MatchAdminRow({ match, tournament, totalPlayers, onComplete, isBlocked }) {
  const p1Wins = match.completed && match.winner_id === match.player1_id
  const p2Wins = match.completed && match.winner_id === match.player2_id
  const isDraw = match.completed && match.is_draw

  return (
    <div
      className={`
        rounded-xl border transition-all duration-200 overflow-hidden
        ${
          match.completed
            ? "border-white/[0.06] bg-white/[0.02]"
            : isBlocked
              ? "border-white/[0.04] opacity-50"
              : "border-neon-purple/15 bg-neon-purple/[0.03] hover:border-neon-purple/25"
        }
      `}
    >
      {/* Top: player vs player */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
        {/* Player 1 */}
        <div
          className={`
            px-4 py-3 flex items-center gap-2 transition-colors
            ${p1Wins ? "bg-neon-cyan/10" : ""}
          `}
        >
          <div className="flex-1 min-w-0">
            <span
              className={`block text-sm font-semibold truncate transition-colors
                ${p1Wins ? "text-neon-cyan" : isDraw ? "text-white/60" : "text-white/85"}`}
            >
              {match.player1?.name || "TBD"}
            </span>
            {p1Wins && (
              <span className="text-[9px] font-[Orbitron] uppercase tracking-widest text-neon-cyan/70 flex items-center gap-1 mt-0.5">
                <Trophy className="w-2.5 h-2.5" /> Winner
              </span>
            )}
          </div>
          {p1Wins && (
            <Trophy className="w-4 h-4 text-neon-cyan shrink-0 drop-shadow-[0_0_8px_rgba(6,214,245,0.7)]" />
          )}
        </div>

        {/* VS / result center */}
        <div className="flex items-center justify-center px-2">
          {match.completed ? (
            <div className="flex flex-col items-center gap-0.5">
              {isDraw ? (
                <span className="text-[9px] font-[Orbitron] uppercase tracking-widest text-white/40 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                  Draw
                </span>
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              )}
            </div>
          ) : (
            <span className="text-[10px] font-[Orbitron] text-white/20 tracking-widest">
              VS
            </span>
          )}
        </div>

        {/* Player 2 */}
        <div
          className={`
            px-4 py-3 flex items-center gap-2 justify-end transition-colors
            ${p2Wins ? "bg-neon-cyan/10" : ""}
          `}
        >
          {p2Wins && (
            <Trophy className="w-4 h-4 text-neon-cyan shrink-0 drop-shadow-[0_0_8px_rgba(6,214,245,0.7)]" />
          )}
          <div className="flex-1 min-w-0 text-right">
            <span
              className={`block text-sm font-semibold truncate transition-colors
                ${p2Wins ? "text-neon-cyan" : isDraw ? "text-white/60" : "text-white/85"}`}
            >
              {match.player2?.name || "TBD"}
            </span>
            {p2Wins && (
              <span className="text-[9px] font-[Orbitron] uppercase tracking-widest text-neon-cyan/70 flex items-center gap-1 justify-end mt-0.5">
                <Trophy className="w-2.5 h-2.5" /> Winner
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: result form or locked state */}
      {tournament.status !== "finished" && (
        <div className="px-4 pb-3 border-t border-white/[0.04]">
          <MatchResultForm
            match={match}
            tournament={tournament}
            totalPlayers={totalPlayers}
            onComplete={onComplete}
            disabled={isBlocked}
          />
        </div>
      )}

      {/* Finished tournament — just show result */}
      {tournament.status === "finished" && match.completed && (
        <div className="px-4 py-2 border-t border-white/[0.04] flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400/60 shrink-0" />
          <span className="text-xs text-white/30 font-[Orbitron] tracking-wider">
            {isDraw ? "Draw" : `${match.winner?.name} wins`}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
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
  const typeConfig = getTypeConfig(tournament.type);

  // Group matches by round
  const roundMap = {};
  matches.forEach((m) => {
    if (!roundMap[m.round_number]) roundMap[m.round_number] = [];
    roundMap[m.round_number].push(m);
  });
  const roundNumbers = Object.keys(roundMap)
    .map(Number)
    .sort((a, b) => a - b);

  // For knockout: only the first round with incomplete matches is "active"
  const firstIncompleteRound = roundNumbers.find((r) =>
    roundMap[r].some((m) => !m.completed),
  );

  // Total knockout players = first round * 2
  const totalKnockoutPlayers = (roundMap[1]?.length ?? 0) * 2 || 2;

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
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
          <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
          <span className="text-white/30 text-xs">
            {formatDate(tournament.created_at)}
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-[Orbitron] font-black text-white mb-1">
          {tournament.name}
        </h1>
        {tournament.type === "league" && (
          <p className="text-white/40 text-sm">
            Win:{" "}
            <span className="text-neon-cyan">{tournament.win_points}pts</span>
            {tournament.allow_draw && (
              <>
                {" "}
                · Draw:{" "}
                <span className="text-neon-cyan">
                  {tournament.draw_points}pts
                </span>
              </>
            )}{" "}
            · Loss:{" "}
            <span className="text-white/30">{tournament.loss_points}pts</span>
          </p>
        )}
      </div>

      {/* Finished banner */}
      {tournament.status === "finished" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-3 rounded-xl bg-green-500/8 border border-green-500/20 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <p className="text-sm text-green-300 font-[Rajdhani]">
            Tournament concluded — all results are final.
          </p>
        </motion.div>
      )}

      {/* ── LEAGUE layout ── */}
      {tournament.type === "league" ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <Leaderboard standings={standings} loading={loading} />
          </div>

          <div className="lg:col-span-3 space-y-5">
            {roundNumbers.map((roundNum) => {
              const roundMatches = roundMap[roundNum];
              const roundName =
                roundMatches[0]?.round_name || `Round ${roundNum}`;
              const done = roundMatches.filter((m) => m.completed).length;
              const allDone = done === roundMatches.length;

              return (
                <Card key={roundNum}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {allDone ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-neon-purple animate-pulse" />
                      )}
                      {roundName}
                    </CardTitle>
                    <span className="text-xs text-white/30 tabular-nums">
                      {done}/{roundMatches.length}
                    </span>
                  </CardHeader>

                  {/* Progress bar */}
                  <div className="h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(done / roundMatches.length) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="space-y-3">
                    {roundMatches.map((match) => (
                      <MatchAdminRow
                        key={match.id}
                        match={match}
                        tournament={tournament}
                        totalPlayers={players.length}
                        onComplete={refetch}
                        isBlocked={false}
                      />
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── KNOCKOUT layout ── */
        <div className="space-y-6">
          <BracketView matches={matches} loading={loading} />

          {roundNumbers.map((roundNum) => {
            const roundMatches = roundMap[roundNum];
            const roundName =
              roundMatches[0]?.round_name || `Round ${roundNum}`;
            const done = roundMatches.filter((m) => m.completed).length;
            const allDone = done === roundMatches.length;
            const isActive = roundNum === firstIncompleteRound;
            const isBlocked = !isActive && !allDone;

            return (
              <Card key={roundNum}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {allDone ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : isActive ? (
                      <Clock className="w-4 h-4 text-neon-purple animate-pulse" />
                    ) : (
                      <Clock className="w-4 h-4 text-white/15" />
                    )}
                    {roundName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isActive && !allDone && (
                      <Badge className="bg-neon-purple/20 text-neon-purple border border-neon-purple/30 text-[9px]">
                        Active
                      </Badge>
                    )}
                    <span className="text-xs text-white/30 tabular-nums">
                      {done}/{roundMatches.length}
                    </span>
                  </div>
                </CardHeader>

                {/* Progress bar */}
                <div className="h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(done / roundMatches.length) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="space-y-3">
                  {roundMatches.map((match) => (
                    <MatchAdminRow
                      key={match.id}
                      match={match}
                      tournament={tournament}
                      totalPlayers={totalKnockoutPlayers}
                      onComplete={refetch}
                      isBlocked={isBlocked && !match.completed}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
