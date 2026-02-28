import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trophy,
  Swords,
  Settings,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useTournaments } from "@/hooks/useTournament";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import CreateTournamentModal from "@/components/admin/CreateTournamentModal";
import { TournamentCardSkeleton } from "@/components/ui/Skeleton";
import PageTransition from "@/components/shared/PageTransition";
import { getStatusConfig, getTypeConfig, formatDate } from "@/utils/tournament";

export default function AdminDashboard() {
  const { tournaments, loading } = useTournaments();
  const [createType, setCreateType] = useState(null);

  const live = tournaments.filter((t) => t.status === "live");
  const finished = tournaments.filter((t) => t.status === "finished");

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-[Orbitron] font-black text-2xl text-white mb-1 uppercase tracking-wide">
            Dashboard
          </h1>
          <p className="text-white/40 text-sm">Manage your tournaments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="purple"
            size="sm"
            onClick={() => setCreateType("league")}
          >
            <Trophy className="w-4 h-4" />
            New League
          </Button>
          <Button
            variant="cyan"
            size="sm"
            onClick={() => setCreateType("knockout")}
          >
            <Swords className="w-4 h-4" />
            New Knockout
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
            <div className="text-xs text-white/40 font-[Orbitron] uppercase tracking-widest mt-1">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tournaments list */}
      <div>
        <h2 className="font-[Orbitron] text-xs uppercase tracking-widest text-white/40 mb-4">
          All Tournaments
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <TournamentCardSkeleton key={i} />
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="glass-card rounded-xl py-16 flex flex-col items-center justify-center text-white/30 gap-4">
            <Trophy className="w-10 h-10 opacity-30" />
            <p className="text-sm font-[Orbitron] uppercase tracking-widest">
              No tournaments yet
            </p>
            <div className="flex gap-2">
              <Button
                variant="purple"
                size="sm"
                onClick={() => setCreateType("league")}
              >
                Create League
              </Button>
              <Button
                variant="cyan"
                size="sm"
                onClick={() => setCreateType("knockout")}
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
                  className="glass-card rounded-xl p-4 flex items-center gap-4"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0
                      ${t.type === "knockout" ? "bg-neon-cyan/10 border border-neon-cyan/20" : "bg-neon-purple/10 border border-neon-purple/20"}`}
                  >
                    {t.type === "knockout" ? (
                      <Swords className="w-4 h-4 text-neon-cyan" />
                    ) : (
                      <Trophy className="w-4 h-4 text-neon-purple" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white/90 text-sm truncate">
                        {t.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={typeConfig.className}>
                        {typeConfig.label}
                      </Badge>
                      <span className="text-xs text-white/30">
                        {formatDate(t.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className={statusConfig.className}>
                      {statusConfig.label}
                    </Badge>
                    <Link to={`/admin/tournament/${t.id}`}>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-3.5 h-3.5" />
                        Manage
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

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
