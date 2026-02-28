import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export function useTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchTournaments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load tournaments");
    } else {
      setTournaments(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchTournaments();
  }, []);
  return { tournaments, loading, refetch: fetchTournaments };
}

export function useTournament(id) {
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchTournament() {
    if (!id) return;
    setLoading(true);

    const [tResult, mResult, sResult] = await Promise.all([
      supabase.from("tournaments").select("*").eq("id", id).single(),
      supabase
        .from("matches")
        .select(
          `*, player1:players!matches_player1_id_fkey(id, name), player2:players!matches_player2_id_fkey(id, name), winner:players!matches_winner_id_fkey(id, name)`,
        )
        .eq("tournament_id", id)
        .order("round_number")
        .order("created_at"),
      supabase
        .from("standings")
        .select(`*, player:players(id, name)`)
        .eq("tournament_id", id)
        .order("points", { ascending: false })
        .order("wins", { ascending: false }),
    ]);

    if (tResult.error) toast.error("Tournament not found");
    setTournament(tResult.data);
    setMatches(mResult.data || []);
    setStandings(sResult.data || []);

    const playerMap = new Map();
    (mResult.data || []).forEach((m) => {
      if (m.player1) playerMap.set(m.player1.id, m.player1);
      if (m.player2) playerMap.set(m.player2.id, m.player2);
    });
    setPlayers([...playerMap.values()]);
    setLoading(false);
  }

  useEffect(() => {
    fetchTournament();
  }, [id]);
  return {
    tournament,
    matches,
    standings,
    players,
    loading,
    refetch: fetchTournament,
  };
}

export function usePlayers() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("name");
    if (!error) setPlayers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchPlayers();
  }, []);
  return { players, loading, refetch: fetchPlayers };
}
