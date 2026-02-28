import { supabase } from '@/lib/supabase'
import {
  generateRoundRobin,
  generateKnockoutFirstRound,
  generateNextKnockoutRound,
  getRoundName,
} from '@/utils/tournament'

// ── Players ──────────────────────────────────────────────────────────────────

export async function createPlayer(name) {
  const { data, error } = await supabase.from('players').insert({ name }).select().single()
  return { data, error }
}

export async function getOrCreatePlayer(name) {
  const trimmed = name.trim()
  const { data: existing } = await supabase
    .from('players')
    .select('*')
    .ilike('name', trimmed)
    .single()

  if (existing) return { data: existing, error: null }
  return createPlayer(trimmed)
}

// ── Tournaments ───────────────────────────────────────────────────────────────

export async function createLeagueTournament({
  name,
  allowDraw,
  winPoints,
  drawPoints,
  lossPoints,
  playerNames,
}) {
  // 1. Create or get players
  const playerResults = await Promise.all(playerNames.map(getOrCreatePlayer))
  const players = playerResults.map((r) => r.data).filter(Boolean)

  if (players.length < 2) {
    return { error: { message: 'Need at least 2 players' } }
  }

  // 2. Create tournament
  const { data: tournament, error: tError } = await supabase
    .from('tournaments')
    .insert({
      name,
      type: 'league',
      allow_draw: allowDraw,
      win_points: winPoints,
      draw_points: drawPoints,
      loss_points: lossPoints,
      status: 'live',
    })
    .select()
    .single()

  if (tError) return { error: tError }

  // 3. Generate round-robin matches
  const rounds = generateRoundRobin(players.map((p) => p.id))
  const allMatches = rounds.flat().map((m) => ({
    ...m,
    tournament_id: tournament.id,
    completed: false,
  }))

  const { error: mError } = await supabase.from('matches').insert(allMatches)
  if (mError) return { error: mError }

  // 4. Create standings entries
  const standingsData = players.map((p) => ({
    tournament_id: tournament.id,
    player_id: p.id,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
  }))

  const { error: sError } = await supabase.from('standings').insert(standingsData)
  if (sError) return { error: sError }

  return { data: tournament, error: null }
}

export async function createKnockoutTournament({ name, playerNames }) {
  // 1. Create or get players
  const playerResults = await Promise.all(playerNames.map(getOrCreatePlayer))
  const players = playerResults.map((r) => r.data).filter(Boolean)

  if (players.length < 2) {
    return { error: { message: 'Need at least 2 players' } }
  }

  // 2. Create tournament
  const { data: tournament, error: tError } = await supabase
    .from('tournaments')
    .insert({
      name,
      type: 'knockout',
      allow_draw: false,
      win_points: 1,
      draw_points: 0,
      loss_points: 0,
      status: 'live',
    })
    .select()
    .single()

  if (tError) return { error: tError }

  // 3. Generate first round
  const firstRoundMatches = generateKnockoutFirstRound(players.map((p) => p.id))
  const matchesWithTournament = firstRoundMatches.map((m) => ({
    ...m,
    tournament_id: tournament.id,
    completed: false,
  }))

  const { error: mError } = await supabase.from('matches').insert(matchesWithTournament)
  if (mError) return { error: mError }

  return { data: tournament, error: null }
}

// ── Match Results ─────────────────────────────────────────────────────────────

export async function submitLeagueMatchResult({
  matchId,
  player1Id,
  player2Id,
  winnerId,
  isDraw,
  tournamentId,
  winPoints,
  drawPoints,
  lossPoints,
}) {
  // Update match
  const { error: mError } = await supabase
    .from('matches')
    .update({
      winner_id: winnerId,
      is_draw: isDraw,
      completed: true,
    })
    .eq('id', matchId)

  if (mError) return { error: mError }

  // Update standings for both players
  const updates = []

  if (isDraw) {
    updates.push(
      updateStanding(tournamentId, player1Id, { wins: 0, draws: 1, losses: 0, points: drawPoints }),
      updateStanding(tournamentId, player2Id, { wins: 0, draws: 1, losses: 0, points: drawPoints })
    )
  } else {
    const loserId = winnerId === player1Id ? player2Id : player1Id
    updates.push(
      updateStanding(tournamentId, winnerId, { wins: 1, draws: 0, losses: 0, points: winPoints }),
      updateStanding(tournamentId, loserId, { wins: 0, draws: 0, losses: 1, points: lossPoints })
    )
  }

  await Promise.all(updates)

  // Check if all matches are completed → auto-close
  await checkAndCloseTournament(tournamentId)

  return { error: null }
}

async function updateStanding(tournamentId, playerId, { wins, draws, losses, points }) {
  const { data: current } = await supabase
    .from('standings')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('player_id', playerId)
    .single()

  if (!current) return

  return supabase
    .from('standings')
    .update({
      played: current.played + 1,
      wins: current.wins + wins,
      draws: current.draws + draws,
      losses: current.losses + losses,
      points: current.points + points,
    })
    .eq('id', current.id)
}

export async function submitKnockoutMatchResult({
  matchId,
  winnerId,
  tournamentId,
  roundNumber,
  totalPlayers,
}) {
  // Update match
  const { error: mError } = await supabase
    .from('matches')
    .update({ winner_id: winnerId, completed: true })
    .eq('id', matchId)

  if (mError) return { error: mError }

  // Get all matches in this round
  const { data: roundMatches } = await supabase
    .from('matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('round_number', roundNumber)

  const allCompleted = roundMatches?.every((m) => m.completed || m.id === matchId)

  if (allCompleted && roundMatches) {
    // Patch current match winner for next-round generation
    const updatedMatches = roundMatches.map((m) =>
      m.id === matchId ? { ...m, winner_id: winnerId, completed: true } : m
    )

    const winners = updatedMatches.map((m) => m.winner_id).filter(Boolean)

    if (winners.length === 1) {
      // Tournament over
      await supabase
        .from('tournaments')
        .update({ status: 'finished' })
        .eq('id', tournamentId)
    } else {
      // Generate next round
      const nextMatches = generateNextKnockoutRound(updatedMatches, totalPlayers)
      const matchesWithTournament = nextMatches.map((m) => ({
        ...m,
        tournament_id: tournamentId,
        completed: false,
      }))

      await supabase.from('matches').insert(matchesWithTournament)
    }
  }

  return { error: null }
}

async function checkAndCloseTournament(tournamentId) {
  const { data: matches } = await supabase
    .from('matches')
    .select('completed')
    .eq('tournament_id', tournamentId)

  if (matches?.every((m) => m.completed)) {
    await supabase
      .from('tournaments')
      .update({ status: 'finished' })
      .eq('id', tournamentId)
  }
}
