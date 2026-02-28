import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

/* =========================
   useTournaments Hook
========================= */

export function useTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[useTournaments] Supabase error:", error);
        setError(error.message || "Failed to load tournaments");
        toast.error(`Failed to load tournaments: ${error.message}`);
        setTournaments([]);
      } else {
        setTournaments(data || []);
      }
    } catch (err) {
      const message = err?.message || "Network request failed";
      console.error("[useTournaments] unexpected error:", err);
      setError(message);
      toast.error(`Failed to load tournaments: ${message}`);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return { tournaments, loading, error, refetch: fetchTournaments };
}

/* =========================
   useTournament Hook
========================= */

export function useTournament(id) {
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTournament = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const [tResult, mResult, sResult] = await Promise.all([
        supabase.from("tournaments").select("*").eq("id", id).single(),

        supabase
          .from("matches")
          .select(
            `
            *,
            player1:players!matches_player1_id_fkey(id, name),
            player2:players!matches_player2_id_fkey(id, name),
            winner:players!matches_winner_id_fkey(id, name)
          `,
          )
          .eq("tournament_id", id)
          .order("round_number", { ascending: true })
          .order("created_at", { ascending: true }),

        supabase
          .from("standings")
          .select(
            `
            *,
            player:players(id, name)
          `,
          )
          .eq("tournament_id", id)
          .order("points", { ascending: false })
          .order("wins", { ascending: false }),
      ]);

      if (tResult.error) {
        console.error("[useTournament] tournament error:", tResult.error);
        setError(tResult.error.message || "Tournament not found");
        toast.error(`Tournament error: ${tResult.error.message}`);
      }

      if (mResult.error) {
        console.error("[useTournament] matches error:", mResult.error);
        toast.error(`Matches error: ${mResult.error.message}`);
      }

      if (sResult.error) {
        console.error("[useTournament] standings error:", sResult.error);
        toast.error(`Standings error: ${sResult.error.message}`);
      }

      setTournament(tResult.data || null);
      setMatches(mResult.data || []);
      setStandings(sResult.data || []);

      const playerMap = new Map();
      (mResult.data || []).forEach((match) => {
        if (match.player1) playerMap.set(match.player1.id, match.player1);
        if (match.player2) playerMap.set(match.player2.id, match.player2);
      });
      setPlayers(Array.from(playerMap.values()));
    } catch (err) {
      const message = err?.message || "Network request failed";
      console.error("[useTournament] unexpected error:", err);
      setError(message);
      toast.error(`Tournament error: ${message}`);
      setTournament(null);
      setMatches([]);
      setStandings([]);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  return {
    tournament,
    matches,
    standings,
    players,
    loading,
    error,
    refetch: fetchTournament,
  };
}

/* =========================
   usePlayers Hook
========================= */

export function usePlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("[usePlayers] error:", error);
        setError(error.message || "Failed to load players");
        toast.error(`Failed to load players: ${error.message}`);
        setPlayers([]);
      } else {
        setPlayers(data || []);
      }
    } catch (err) {
      const message = err?.message || "Network request failed";
      console.error("[usePlayers] unexpected error:", err);
      setError(message);
      toast.error(`Failed to load players: ${message}`);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return { players, loading, error, refetch: fetchPlayers };
}
