import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Swords, Settings } from "lucide-react";
import { useTournaments } from '@/hooks/useTournament'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import CreateTournamentModal from '@/components/admin/CreateTournamentModal'
import { TournamentCardSkeleton } from '@/components/ui/Skeleton'
import PageTransition from '@/components/shared/PageTransition'
import { getStatusConfig, getTypeConfig, formatDate } from '@/utils/tournament'

export default function AdminDashboard() {
  const { tournaments, loading, error, refetch } = useTournaments()
  const [createType, setCreateType] = useState(null);

  const live = tournaments.filter((t) => t.status === "live");
  const finished = tournaments.filter((t) => t.status === 'finished')

  return (
    <PageTransition>
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="font-[Orbitron] font-black text-xl sm:text-2xl text-white mb-1 uppercase tracking-wide">
          Dashboard
        </h1>
        <p className="text-white/40 text-sm">Manage your tournaments</p>
      </div>

      {/* ── Create buttons ── */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:flex sm:gap-3 sm:w-auto">
        <Button
          variant="purple"
          size="sm"
          onClick={() => setCreateType("league")}
          className="w-full sm:w-auto"
        >
          <Trophy className="w-4 h-4" />
          <span className="hidden xs:inline">New </span>League
        </Button>
        <Button
          variant="cyan"
          size="sm"
          onClick={() => setCreateType("knockout")}
          className="w-full sm:w-auto"
        >
          <Swords className="w-4 h-4" />
          <span className="hidden xs:inline">New </span>Knockout
        </Button>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total", value: tournaments.length, color: "text-white/80" },
          { label: "Live", value: live.length, color: "text-green-400" },
          { label: "Finished", value: finished.length, color: "text-white/40" },
          {
            label: "League",
            value: tournaments.filter((t) => t.type === "league").length,
            color: "text-neon-purple",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card rounded-xl p-4"
          >
            <div
              className={`text-2xl font-[Orbitron] font-black ${stat.color}`}
            >
              {stat.value}
            </div>
            <div className="text-[10px] text-white/40 font-[Orbitron] uppercase tracking-widest mt-1">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Tournaments list ── */}
      <div>
        <h2 className="font-[Orbitron] text-[10px] uppercase tracking-widest text-white/40 mb-4">
          All Tournaments
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <TournamentCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="glass-card rounded-xl py-12 px-4 text-center">
            <p className="text-sm text-red-300/90 mb-2">Could not load tournaments</p>
            <p className="text-xs text-white/45 mb-4 break-all">{error}</p>
            <Button variant="ghost" size="sm" onClick={refetch}>
              Retry
            </Button>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="glass-card rounded-xl py-16 flex flex-col items-center justify-center text-white/30 gap-4">
            <Trophy className="w-10 h-10 opacity-30" />
            <p className="text-sm font-[Orbitron] uppercase tracking-widest text-center px-4">
              No tournaments yet
            </p>
            <div className="flex flex-col sm:flex-row gap-2 px-4 w-full sm:w-auto">
              <Button
                variant="purple"
                size="sm"
                onClick={() => setCreateType("league")}
                className="w-full sm:w-auto"
              >
                Create League
              </Button>
              <Button
                variant="cyan"
                size="sm"
                onClick={() => setCreateType("knockout")}
                className="w-full sm:w-auto"
              >
                Create Knockout
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((t, i) => {
              const statusConfig = getStatusConfig(t.status);
              const typeConfig = getTypeConfig(t.type);

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card rounded-xl p-3 sm:p-4"
                >
                  {/* Row: icon + info + actions */}
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                      ${
                        t.type === "knockout"
                          ? "bg-neon-cyan/10 border border-neon-cyan/20"
                          : "bg-neon-purple/10 border border-neon-purple/20"
                      }`}
                    >
                      {t.type === "knockout" ? (
                        <Swords className="w-4 h-4 text-neon-cyan" />
                      ) : (
                        <Trophy className="w-4 h-4 text-neon-purple" />
                      )}
                    </div>

                    {/* Name + badges */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white/90 text-sm leading-snug truncate mb-1.5">
                        {t.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge className={typeConfig.className}>
                          {typeConfig.label}
                        </Badge>
                        <Badge className={statusConfig.className}>
                          {statusConfig.label}
                        </Badge>
                        <span className="text-[10px] text-white/25 hidden sm:inline">
                          {formatDate(t.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Manage button */}
                    <div className="shrink-0">
                      <Link to={`/admin/tournament/${t.id}`}>
                        {/* Full label on sm+, icon-only on xs */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hidden sm:flex"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Manage
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex sm:hidden px-2"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Date line — mobile only */}
                  <p className="text-[10px] text-white/25 mt-2 ml-12 sm:hidden">
                    {formatDate(t.created_at)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {createType && (
          <CreateTournamentModal
            type={createType}
            onClose={() => setCreateType(null)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
