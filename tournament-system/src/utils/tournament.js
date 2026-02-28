/**
 * Generate a round-robin schedule for the given players.
 * Uses the "circle method" algorithm.
 * Returns an array of rounds, each round is an array of { player1_id, player2_id }
 */
export function generateRoundRobin(playerIds) {
  const players = [...playerIds]
  const rounds = []

  // If odd number of players, add a BYE
  if (players.length % 2 !== 0) {
    players.push(null) // null = BYE
  }

  const n = players.length
  const numRounds = n - 1
  const half = n / 2

  // Fix last element, rotate the rest
  const fixed = players[n - 1]
  const rotating = players.slice(0, n - 1)

  for (let round = 0; round < numRounds; round++) {
    const roundMatches = []

    // Create pairs
    const current = [fixed, ...rotating]

    for (let i = 0; i < half; i++) {
      const p1 = current[i]
      const p2 = current[n - 1 - i]

      // Skip BYE matches
      if (p1 !== null && p2 !== null) {
        roundMatches.push({
          player1_id: p1,
          player2_id: p2,
          round_number: round + 1,
          round_name: `Round ${round + 1}`,
        })
      }
    }

    rounds.push(roundMatches)

    // Rotate: move last of rotating to front
    rotating.unshift(rotating.pop())
  }

  return rounds
}

/**
 * Generate knockout bracket from shuffled player list.
 * Returns first round matches. Subsequent rounds are generated as winners advance.
 */
export function generateKnockoutFirstRound(playerIds) {
  const players = shuffle([...playerIds])
  const matches = []

  for (let i = 0; i < players.length; i += 2) {
    matches.push({
      player1_id: players[i],
      player2_id: players[i + 1] || null,
      round_number: 1,
      round_name: getRoundName(players.length, 1),
    })
  }

  return matches
}

/**
 * Get round name based on total players and current round number
 */
export function getRoundName(totalPlayers, roundNumber) {
  const totalRounds = Math.ceil(Math.log2(totalPlayers))
  const roundsRemaining = totalRounds - roundNumber + 1

  if (roundsRemaining === 1) return 'Final'
  if (roundsRemaining === 2) return 'Semifinal'
  if (roundsRemaining === 3) return 'Quarterfinal'

  const playersInRound = totalPlayers / Math.pow(2, roundNumber - 1)
  return `Round of ${playersInRound}`
}

/**
 * Given completed matches from current knockout round, generate next round
 */
export function generateNextKnockoutRound(currentMatches, totalPlayers) {
  const winners = currentMatches.map((m) => m.winner_id).filter(Boolean)
  const nextRoundNumber = currentMatches[0].round_number + 1
  const matches = []

  for (let i = 0; i < winners.length; i += 2) {
    matches.push({
      player1_id: winners[i],
      player2_id: winners[i + 1] || null,
      round_number: nextRoundNumber,
      round_name: getRoundName(totalPlayers, nextRoundNumber),
    })
  }

  return matches
}

/**
 * Fisher-Yates shuffle
 */
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * Check if a number is power of 2
 */
export function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0
}

/**
 * Get next power of 2 >= n
 */
export function nextPowerOfTwo(n) {
  let power = 1
  while (power < n) power *= 2
  return power
}

/**
 * Format date nicely
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get status badge config
 */
export function getStatusConfig(status) {
  switch (status) {
    case 'live':
      return {
        label: 'LIVE',
        className: 'bg-green-500/20 text-green-400 border border-green-500/30',
      }
    case 'finished':
      return {
        label: 'FINISHED',
        className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
      }
    case 'upcoming':
      return {
        label: 'UPCOMING',
        className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      }
    default:
      return { label: status.toUpperCase(), className: 'bg-gray-500/20 text-gray-400' }
  }
}

/**
 * Get type badge config
 */
export function getTypeConfig(type) {
  switch (type) {
    case 'league':
      return {
        label: 'LEAGUE',
        className: 'bg-neon-purple/20 text-purple-300 border border-purple-500/30',
      }
    case 'knockout':
      return {
        label: 'KNOCKOUT',
        className: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      }
    default:
      return { label: type.toUpperCase(), className: '' }
  }
}
