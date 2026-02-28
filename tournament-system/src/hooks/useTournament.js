import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function useTournaments() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchTournaments() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message || 'Failed to load tournaments')
      toast.error(error.message || 'Failed to load tournaments')
    } else {
      setTournaments(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTournaments()
  }, [])

  return { tournaments, loading, error, refetch: fetchTournaments }
}

export function useTournament(id) {
  const [tournament, setTournament] = useState(null)
  const [matches, setMatches] = useState([])
  const [standings, setStandings] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchTournament() {
    if (!id) return
    setLoading(true)
    setError(null)

    const [tResult, mResult, sResult] = await Promise.all([
      supabase.from('tournaments').select('*').eq('id', id).single(),
      supabase
        .from('matches')
        .select(`
          *,
          player1:players!matches_player1_id_fkey(id, name),
          player2:players!matches_player2_id_fkey(id, name),
          winner:players!matches_winner_id_fkey(id, name)
        `)
        .eq('tournament_id', id)
        .order('round_number')
        .order('created_at'),
      supabase
        .from('standings')
        .select(`*, player:players(id, name)`)
        .eq('tournament_id', id)
        .order('points', { ascending: false })
        .order('wins', { ascending: false }),
    ])

    if (tResult.error) {
      setError(tResult.error.message || 'Tournament not found')
      toast.error(tResult.error.message || 'Tournament not found')
    }
    if (mResult.error) setError(mResult.error.message || 'Failed to load matches')
    if (sResult.error) setError(sResult.error.message || 'Failed to load standings')
    setTournament(tResult.data)
    setMatches(mResult.data || [])
    setStandings(sResult.data || [])

    // Extract unique players
    const playerMap = new Map()
    ;(mResult.data || []).forEach((m) => {
      if (m.player1) playerMap.set(m.player1.id, m.player1)
      if (m.player2) playerMap.set(m.player2.id, m.player2)
    })
    setPlayers([...playerMap.values()])

    setLoading(false)
  }

  useEffect(() => {
    fetchTournament()
  }, [id])

  return { tournament, matches, standings, players, loading, error, refetch: fetchTournament }
}

export function usePlayers() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchPlayers() {
    setError(null)
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name')

    if (error) {
      setError(error.message || 'Failed to load players')
    } else {
      setPlayers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPlayers()
  }, [])

  return { players, loading, error, refetch: fetchPlayers }
}
