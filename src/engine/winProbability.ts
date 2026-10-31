/**
 * Win Probability model for a T20 second-innings chase.
 * Calculates batting team win probability based on:
 * - Runs needed
 * - Balls remaining
 * - Wickets in hand
 * - Current vs Required Run Rate
 */

export function calculateWinProbability(
  target: number,
  currentRuns: number,
  ballsBowled: number,
  wicketsLost: number
): number {
  const runsNeeded = target - currentRuns;
  const ballsRemaining = Math.max(0, 120 - ballsBowled);
  const wicketsInHand = Math.max(0, 10 - wicketsLost);

  // Match finished edge-cases
  if (runsNeeded <= 0) return 100;
  if (wicketsInHand <= 0) return 0;
  if (ballsRemaining <= 0) return 0;

  // Single ball remaining cases
  if (ballsRemaining === 1) {
    if (runsNeeded > 6) return 0;
    if (runsNeeded === 6) return wicketsInHand > 0 ? 15 : 0;
    if (runsNeeded === 4) return 35;
    if (runsNeeded <= 2) return 80;
    return 50;
  }

  // Required Run Rate (per over)
  const rrr = (runsNeeded / ballsRemaining) * 6;

  // Wicket factor: each wicket in hand above 3 provides resilience
  // Top order (7-10 wickets) can sustain 11+ RRR; lower order (1-3 wickets) collapses at 9+ RRR
  const parRRR = 7.8 + (wicketsInHand - 5) * 0.85;

  // Logistic / Sigmoid curve
  // exponent = (parRRR - rrr) * sensitivity
  // sensitivity increases as balls remaining decrease (pressure amplifies late in the game)
  const progressRatio = ballsBowled / 120; // 0 to 1
  const pressureMultiplier = 0.35 + progressRatio * 0.55;

  const differential = (parRRR - rrr) * pressureMultiplier;

  // Sigmoid formula: 1 / (1 + exp(-k * diff))
  let rawProb = 100 / (1 + Math.exp(-differential));

  // Extreme tail damping
  if (runsNeeded > ballsRemaining * 4) {
    rawProb = Math.min(rawProb, 5);
  }
  if (runsNeeded > ballsRemaining * 6) {
    return 0;
  }

  // Bound between 1 and 99 during active play
  const bounded = Math.max(1, Math.min(99, Math.round(rawProb * 10) / 10));
  return bounded;
}

/**
 * Computes momentum direction and intensity based on the last 12 balls
 * Returns: 'batting-surge' | 'bowling-surge' | 'neutral'
 */
export function calculateMomentum(
  winProbHistory: number[],
  lastEventsCount: number = 6
): { momentum: 'batting-surge' | 'bowling-surge' | 'neutral'; shift: number } {
  if (winProbHistory.length < 2) {
    return { momentum: 'neutral', shift: 0 };
  }

  const current = winProbHistory[winProbHistory.length - 1];
  const lookbackIndex = Math.max(0, winProbHistory.length - 1 - lastEventsCount);
  const previous = winProbHistory[lookbackIndex];
  const shift = current - previous;

  if (shift >= 6) {
    return { momentum: 'batting-surge', shift };
  } else if (shift <= -6) {
    return { momentum: 'bowling-surge', shift };
  }
  return { momentum: 'neutral', shift };
}
