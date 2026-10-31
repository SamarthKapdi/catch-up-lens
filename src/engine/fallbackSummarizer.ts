import { BallEvent, CatchUpSummary, SummaryTone } from './types';

interface SummarizerInput {
  missedEvents: BallEvent[];
  winProbBefore: number;
  winProbAfter: number;
  target: number;
  currentRuns: number;
  currentWickets: number;
  ballsBowled: number;
  strikerName: string;
  bowlerName: string;
  tone: SummaryTone;
}

/**
 * Word count helper to ensure hard cap of <= 45 words on "happened".
 */
export function countWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export function trimToMaxWords(str: string, maxWords: number = 45): string {
  const words = str.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return str;
  return words.slice(0, maxWords).join(' ') + '...';
}

export function generateDeterministicSummary(input: SummarizerInput): CatchUpSummary {
  const {
    missedEvents,
    winProbBefore,
    winProbAfter,
    target,
    currentRuns,
    currentWickets: _currentWickets,
    ballsBowled,
    strikerName,
    bowlerName,
    tone,
  } = input;

  const ballsMissed = missedEvents.length;
  const runsMissed = missedEvents.reduce((acc, b) => acc + b.runsScored, 0);
  const wicketsMissed = missedEvents.filter((b) => b.isWicket);
  const sixesMissed = missedEvents.filter((b) => b.isSix).length;
  const foursMissed = missedEvents.filter((b) => b.isFour).length;
  const boundariesMissed = sixesMissed + foursMissed;
  const droppedCatchesMissed = missedEvents.filter((b) => b.isDroppedCatch).length;

  const runsNeeded = Math.max(0, target - currentRuns);
  const ballsRemaining = Math.max(0, 120 - ballsBowled);
  const probDiff = winProbAfter - winProbBefore;
  const probDiffRound = Math.abs(Math.round(probDiff));

  let headline = '';
  let happened = '';
  let whyItMatters = '';
  let watchNext = '';

  // Tone generation
  if (tone === 'hinglish') {
    // Hinglish Tone
    if (wicketsMissed.length > 0) {
      const outNames = wicketsMissed.map((w) => w.dismissedPlayer || 'batter').join(', ');
      headline = wicketsMissed.length >= 2
        ? `Double Jhatka! ${outNames} pavillion laute!`
        : `Bada Wicket! ${outNames} out ho gaye!`;
      happened = `Aapke gayab hote hi ${wicketsMissed.length} wicket gire (${runsMissed} runs / ${ballsMissed} balls). ${outNames} out hue jabki ${boundariesMissed} boundaries lagi.`;
    } else if (boundariesMissed >= 2) {
      headline = `Chauke-Chhakke ki Barsaat! ${runsMissed} runs aagaye!`;
      happened = `In ${ballsMissed} balls me Flares ne ${runsMissed} runs koot dale, jisme ${foursMissed} chauke aur ${sixesMissed} chhakke shamil the bina koi wicket khoye.`;
    } else {
      headline = `Tight Bowling! Strikers ne kassi match ki pakad.`;
      happened = `Sirf ${runsMissed} runs aaye ${ballsMissed} balls me. Koi wicket nahi gira par dot balls se pressure badh gaya.`;
    }

    if (probDiff > 3) {
      whyItMatters = `Chase aasaan hui: Win probability ${winProbBefore}% se chhalang lagakar ${winProbAfter}% ho gayi (${probDiffRound}% ka fayda).`;
    } else if (probDiff < -3) {
      whyItMatters = `Dharamsankat! Jeetne ke chances ${winProbBefore}% se gir kar ${winProbAfter}% par aa gaye (${probDiffRound}% ka jhatka).`;
    } else {
      whyItMatters = `Match abhi bhi 50-50 balance par hai, win chance ${winProbAfter}% bana hua hai.`;
    }

    watchNext = ballsRemaining <= 18
      ? `Aakhri overs ka drama! Chahiye ${runsNeeded} runs ${ballsRemaining} balls me — ${strikerName} strike par hai!`
      : `Agla over: ${bowlerName} ki bowling vs ${strikerName}. Yorker aayega ya boundary?`;

  } else if (tone === 'nerd') {
    // Cricket Nerd Tone
    if (wicketsMissed.length > 0) {
      headline = `Win Equity Shift: ${wicketsMissed.length} Dismissal${wicketsMissed.length > 1 ? 's' : ''} Alters Leverage`;
      happened = `Phase yielded ${runsMissed} runs off ${ballsMissed} deliveries at ${(runsMissed / Math.max(1, ballsMissed / 6)).toFixed(1)} RPO. Lost ${wicketsMissed.length} wicket(s), spiking the RRR.`;
    } else if (boundariesMissed >= 2) {
      headline = `Batting Surge: +${runsMissed} Runs off ${ballsMissed} Deliveries`;
      happened = `Clean ball striking produced ${boundariesMissed} boundaries (${sixesMissed}x6, ${foursMissed}x4) across ${ballsMissed} balls, driving positive win delta without losing equity.`;
    } else {
      headline = `Stifling Over: Slower Ball Sequencing Stalls Chase`;
      happened = `Bowling discipline kept scoring to ${runsMissed} runs across ${ballsMissed} balls with a high dot-ball percentage, raising the required equation.`;
    }

    const rrrVal = ballsRemaining > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(2) : '0';
    whyItMatters = `Win probability moved ${probDiff >= 0 ? '+' : ''}${probDiffRound}% (now ${winProbAfter}%). Equation recalibrated to ${runsNeeded} off ${ballsRemaining}b (RRR: ${rrrVal}).`;
    watchNext = `Matchup to track: ${bowlerName}'s length control against ${strikerName} (high boundary percentage zone).`;

  } else {
    // Simple Tone (Default)
    if (wicketsMissed.length > 0) {
      const outNames = wicketsMissed.map((w) => w.dismissedPlayer || 'batter').join(' & ');
      headline = wicketsMissed.length >= 2
        ? `Double Blow: ${outNames} Fall in Quick Succession!`
        : `Breakthrough: ${outNames} Out as Strikers Strike!`;
      happened = `While you stepped away, the batting side scored ${runsMissed} runs from ${ballsMissed} balls but lost ${wicketsMissed.length} big wicket${wicketsMissed.length > 1 ? 's' : ''} to shift momentum.`;
    } else if (boundariesMissed >= 2) {
      headline = `Boundary Blitz: ${runsMissed} Runs Smashed off ${ballsMissed} Balls!`;
      happened = `Pure fireworks! Batters launched ${boundariesMissed} boundaries (${sixesMissed} sixes, ${foursMissed} fours) to plunder ${runsMissed} runs without losing any wickets.`;
    } else {
      headline = `Tight Squeeze: Bowlers Build Dot-Ball Pressure`;
      happened = `Quiet stretch: only ${runsMissed} runs scored across ${ballsMissed} balls as disciplined bowling kept the batters contained.`;
    }

    if (probDiff > 3) {
      whyItMatters = `Solar Flares surged ahead: Win chances climbed from ${winProbBefore}% to ${winProbAfter}%.`;
    } else if (probDiff < -3) {
      whyItMatters = `Cyber Strikers took control: Chasing chances dropped from ${winProbBefore}% down to ${winProbAfter}%.`;
    } else {
      whyItMatters = `Tension stays high: Win chance sits steady at ${winProbAfter}%.`;
    }

    if (droppedCatchesMissed > 0) {
      whyItMatters += ` (Plus a dropped catch kept a key batter alive!)`;
    }

    watchNext = ballsRemaining <= 24
      ? `Pressure cooker finish! ${runsNeeded} needed from ${ballsRemaining} balls with ${strikerName} on strike.`
      : `${bowlerName} returns to bowl next over with ${strikerName} looking to attack.`;
  }

  // Ensure hard rule: at most 45 words in happened
  happened = trimToMaxWords(happened, 45);

  return {
    headline,
    happened,
    whyItMatters,
    watchNext,
    source: 'instant',
    tone,
    missedBallsCount: ballsMissed,
    missedRuns: runsMissed,
    missedWickets: wicketsMissed.length,
    winProbBefore,
    winProbAfter,
    keyEvents: missedEvents.filter((b) => b.isWicket || b.isBoundary || b.isDroppedCatch),
  };
}
