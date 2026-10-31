import {
  MatchState,
  BallEvent,
  PlayerState,
  BowlerState,
  WicketType,
} from './types';
import { SOLAR_FLARES, CYBER_STRIKERS, getInitialBattingLineup, getInitialBowlingLineup } from './teams';
import { calculateWinProbability, calculateMomentum } from './winProbability';
import { RNG } from './prng';

export function createInitialMatch(): MatchState {
  const battingLineup = getInitialBattingLineup();
  const bowlingLineup = getInitialBowlingLineup();

  const striker = { ...battingLineup[0] };
  const nonStriker = { ...battingLineup[1] };
  const bowler = { ...bowlingLineup[0] };

  const target = 184; // Typical challenging T20 target (9.2 RRR)
  const initialWinProb = calculateWinProbability(target, 0, 0, 0);

  return {
    teamBatting: SOLAR_FLARES,
    teamBowling: CYBER_STRIKERS,
    target,
    totalBalls: 120,
    runs: 0,
    wickets: 0,
    ballsBowled: 0,
    isMatchOver: false,
    result: null,
    striker,
    nonStriker,
    bowler,
    battingLineup,
    bowlingLineup,
    currentPartnership: { runs: 0, balls: 0 },
    history: [],
    overSummaries: [],
    highlights: [],
    winProbability: initialWinProb,
    momentum: 'neutral',
    recentMomentumFactor: 0,
  };
}

const COMMENTARY_TEMPLATES = {
  dot: [
    "{bowler} hits a hard good length, {striker} defends solidly toward mid-on.",
    "Beaten! Extra bounce outside off-stump, {striker} plays and misses.",
    "Full and straight from {bowler}, squeezed back to the bowler. Dot ball.",
    "Slower ball deceived {striker}, pushed gently into the covers for no run."
  ],
  single: [
    "{striker} glides it softly to backward point and scampers across for a quick single.",
    "Driven down to long-on by {striker}, easy single taken to rotate strike.",
    "Nudged into the vacant mid-wicket pocket, brisk running between the wickets.",
    "Tucked off the hips toward fine leg, batsman safely completes the single."
  ],
  double: [
    "Punched into the deep cover gap! Excellent running, they hustle back for two.",
    "Clipped wide of long-on, energetic sprint by {striker} turns one into two.",
    "{striker} pulls toward deep square leg, sweeper cleans up as they take a brace."
  ],
  four: [
    "CRACK! Smashed through the covers! What a glorious boundary from {striker}!",
    "Up and over mid-off! One bounce and into the advertising ropes for FOUR!",
    "Delicate touch! Upper-cut over backward point, races away to the boundary fence!",
    "Full toss punished ruthlessly! Drilled past mid-wicket for four runs!"
  ],
  six: [
    "MAXIMUM! {striker} launches into the grandstand! 92 meters of pure power!",
    "BANG! Picked up off the pads and dispatched over deep square leg for SIX!",
    "Dancing down the track, clean strike right out of the screws! Six runs into the crowd!",
    "Stand and deliver! Over long-on, clears the boundary ropes with ease! Massive SIX!"
  ],
  droppedCatch: [
    "DROPPED! In the air... and spilled at mid-off! Huge reprieve for {striker}!",
    "Edge and put down! Keeper leaped but couldn't hold on, batsman survives!",
    "Chance gone begging! Deep cover sprinted in, got both hands to it, but shelled it!"
  ],
  wicketCaught: [
    "OUT! Sliced high in the air... fielder settles underneath and takes a calm catch! {striker} departs!",
    "GONE! Slog-sweep directly to deep mid-wicket! Safe pair of hands, massive breakthrough!"
  ],
  wicketBowled: [
    "TIMBER! Absolute jaffa from {bowler}! Off-stump knocked out of the ground! Clean bowled!",
    "BOWLED HIM! Through the gate! Deceived by the slower yorker, stumps shattered!"
  ],
  wicketLBW: [
    "LOUD APPEAL... GIVEN! Struck right in front of middle! Plumb as they come! {striker} walks!",
    "TRAPPED! Full and nipping in, misses the flick, umpire's finger goes straight up! LBW!"
  ],
  wicketRunOut: [
    "DIRECT HIT! Total mix-up between the wickets, fielder hits the base of stumps! Run out!",
    "OUT! Hesitation in the middle, keeper whips off the bails in a flash!"
  ]
};

function getRandomTemplate(list: string[], rng: RNG): string {
  const index = Math.floor(rng() * list.length);
  return list[index];
}

export function simulateNextBall(currentState: MatchState, rng: RNG): MatchState {
  if (currentState.isMatchOver) {
    return currentState;
  }

  const {
    target,
    ballsBowled,
    runs,
    wickets,
    striker,
    nonStriker,
    bowler,
    battingLineup,
    bowlingLineup,
    history,
    overSummaries,
    highlights,
    currentPartnership,
  } = currentState;

  const currentBallNumber = ballsBowled + 1;
  const overIndex = Math.floor(ballsBowled / 6);
  const ballInOver = (ballsBowled % 6) + 1;

  // Determine game phase
  const isDeathOvers = overIndex >= 15;
  const isPowerplay = overIndex < 6;

  // Probability distribution for outcomes
  // Adjusts dynamically based on death overs or required run rate
  const runsNeeded = target - runs;
  const ballsLeft = 120 - ballsBowled;
  const rrr = ballsLeft > 0 ? (runsNeeded / ballsLeft) * 6 : 9;

  let wicketProb = isDeathOvers ? 0.08 : 0.05;
  let sixProb = isDeathOvers || rrr > 10 ? 0.11 : isPowerplay ? 0.07 : 0.05;
  let fourProb = isPowerplay ? 0.16 : 0.12;
  let droppedCatchProb = 0.02;

  const roll = rng();

  let runsScored = 0;
  let isWicket = false;
  let wicketType: WicketType | null = null;
  let isBoundary = false;
  let isFour = false;
  let isSix = false;
  let isDroppedCatch = false;
  let rawCommentary = '';

  if (roll < wicketProb) {
    // WICKET
    isWicket = true;
    const wRoll = rng();
    if (wRoll < 0.5) {
      wicketType = 'caught';
      rawCommentary = getRandomTemplate(COMMENTARY_TEMPLATES.wicketCaught, rng);
    } else if (wRoll < 0.75) {
      wicketType = 'bowled';
      rawCommentary = getRandomTemplate(COMMENTARY_TEMPLATES.wicketBowled, rng);
    } else if (wRoll < 0.9) {
      wicketType = 'lbw';
      rawCommentary = getRandomTemplate(COMMENTARY_TEMPLATES.wicketLBW, rng);
    } else {
      wicketType = 'run out';
      rawCommentary = getRandomTemplate(COMMENTARY_TEMPLATES.wicketRunOut, rng);
    }
  } else if (roll < wicketProb + droppedCatchProb) {
    // DROPPED CATCH
    isDroppedCatch = true;
    runsScored = rng() < 0.6 ? 1 : 2;
    rawCommentary = getRandomTemplate(COMMENTARY_TEMPLATES.droppedCatch, rng);
  } else if (roll < wicketProb + droppedCatchProb + sixProb) {
    // SIX
    runsScored = 6;
    isBoundary = true;
    isSix = true;
    rawCommentary = getRandomTemplate(COMMENTARY_TEMPLATES.six, rng);
  } else if (roll < wicketProb + droppedCatchProb + sixProb + fourProb) {
    // FOUR
    runsScored = 4;
    isBoundary = true;
    isFour = true;
    rawCommentary = getRandomTemplate(COMMENTARY_TEMPLATES.four, rng);
  } else {
    // DOT OR RUNS
    const runRoll = rng();
    if (runRoll < 0.36) {
      runsScored = 0;
      rawCommentary = getRandomTemplate(COMMENTARY_TEMPLATES.dot, rng);
    } else if (runRoll < 0.82) {
      runsScored = 1;
      rawCommentary = getRandomTemplate(COMMENTARY_TEMPLATES.single, rng);
    } else {
      runsScored = 2;
      rawCommentary = getRandomTemplate(COMMENTARY_TEMPLATES.double, rng);
    }
  }

  const newRuns = runs + runsScored;
  const newWickets = isWicket ? wickets + 1 : wickets;
  const newBallsBowled = currentBallNumber;

  // Format commentary
  const commentary = rawCommentary
    .replace('{striker}', striker.name)
    .replace('{bowler}', bowler.name);

  // Update striker state
  let nextStriker: PlayerState = {
    ...striker,
    runs: striker.runs + runsScored,
    balls: striker.balls + 1,
    fours: isFour ? striker.fours + 1 : striker.fours,
    sixes: isSix ? striker.sixes + 1 : striker.sixes,
    isOut: isWicket,
    dismissal: isWicket ? `${wicketType || 'out'} b ${bowler.name}` : striker.dismissal,
  };

  let nextNonStriker: PlayerState = { ...nonStriker };

  // Check milestones
  let milestone: string | undefined = undefined;
  if (!striker.isOut && nextStriker.runs >= 50 && striker.runs < 50) {
    milestone = `${nextStriker.name} brings up a sparkling FIFTY! (50 off ${nextStriker.balls} balls)`;
  } else if (newRuns >= 100 && runs < 100) {
    milestone = `Team 100 up for ${currentState.teamBatting.name}!`;
  } else if (newRuns >= 150 && runs < 150) {
    milestone = `150 on the board! Chase heating up!`;
  }

  // Update partnership
  const nextPartnership = isWicket
    ? { runs: 0, balls: 0 }
    : { runs: currentPartnership.runs + runsScored, balls: currentPartnership.balls + 1 };

  // Update bowler
  const nextBowler: BowlerState = {
    ...bowler,
    ballsThisOver: bowler.ballsThisOver + 1,
    runsConceded: bowler.runsConceded + runsScored,
    wickets: isWicket ? bowler.wickets + 1 : bowler.wickets,
    overs: Math.floor((bowler.overs * 6 + bowler.ballsThisOver + 1) / 6),
    economy: Math.round(((bowler.runsConceded + runsScored) / Math.max(1, (bowler.ballsThisOver + 1) / 6)) * 10) / 10,
  };

  // Win probability calculation
  const newWinProb = calculateWinProbability(target, newRuns, newBallsBowled, newWickets);

  const ballEvent: BallEvent = {
    ballId: `b-${currentBallNumber}`,
    ballNumber: currentBallNumber,
    overIndex,
    ballInOver,
    runsScored,
    isWicket,
    wicketType,
    dismissedPlayer: isWicket ? striker.name : undefined,
    isBoundary,
    isFour,
    isSix,
    isDroppedCatch,
    strikerName: nextStriker.name,
    nonStrikerName: nextNonStriker.name,
    bowlerName: nextBowler.name,
    commentary,
    winProbBatting: newWinProb,
    milestone,
    scoreAfterBall: { runs: newRuns, wickets: newWickets },
  };

  // Highlights tracking
  const nextHighlights = [...highlights];
  const overStr = `${overIndex}.${ballInOver}`;
  if (isWicket) {
    nextHighlights.unshift({
      id: `h-wkt-${currentBallNumber}`,
      type: 'wicket',
      title: `WICKET! ${nextStriker.name} departs`,
      description: commentary,
      ballNumber: currentBallNumber,
      overString: overStr,
      badgeText: 'WICKET',
    });
  } else if (isSix) {
    nextHighlights.unshift({
      id: `h-six-${currentBallNumber}`,
      type: 'six',
      title: `HUGE SIX by ${nextStriker.name}`,
      description: commentary,
      ballNumber: currentBallNumber,
      overString: overStr,
      badgeText: '6 RUNS',
    });
  } else if (isFour) {
    nextHighlights.unshift({
      id: `h-four-${currentBallNumber}`,
      type: 'four',
      title: `CRISP FOUR by ${nextStriker.name}`,
      description: commentary,
      ballNumber: currentBallNumber,
      overString: overStr,
      badgeText: '4 RUNS',
    });
  } else if (isDroppedCatch) {
    nextHighlights.unshift({
      id: `h-drop-${currentBallNumber}`,
      type: 'dropped_catch',
      title: `DROPPED CATCH! Big reprieve`,
      description: commentary,
      ballNumber: currentBallNumber,
      overString: overStr,
      badgeText: 'CHANCE',
    });
  }

  // Handle wicket dismissal -> next batter comes in
  let updatedBattingLineup = battingLineup.map((p) => (p.id === nextStriker.id ? nextStriker : p));
  if (isWicket && newWickets < 10) {
    const nextBatterIndex = updatedBattingLineup.findIndex((p) => !p.isOut && p.id !== nextNonStriker.id && p.id !== nextStriker.id);
    if (nextBatterIndex !== -1) {
      nextStriker = { ...updatedBattingLineup[nextBatterIndex] };
    }
  }

  // Handle strike rotation on odd runs (if not end of over)
  if (runsScored % 2 !== 0 && ballInOver !== 6 && !isWicket) {
    const temp = nextStriker;
    nextStriker = nextNonStriker;
    nextNonStriker = temp;
  }

  // Check end of over (6 balls)
  const nextHistory = [...history, ballEvent];
  let nextOverSummaries = [...overSummaries];
  let updatedBowler = nextBowler;

  if (ballInOver === 6) {
    // Over finished
    const overBalls = nextHistory.slice(-6);
    const runsInOver = overBalls.reduce((acc, b) => acc + b.runsScored, 0);
    const wicketsInOver = overBalls.filter((b) => b.isWicket).length;

    nextOverSummaries.push({
      overNumber: overIndex + 1,
      bowlerName: nextBowler.name,
      runsConceded: runsInOver,
      wicketsTaken: wicketsInOver,
      balls: overBalls,
      scoreAtEnd: `${newRuns}/${newWickets}`,
    });

    // Rotate strike at end of over
    const temp = nextStriker;
    nextStriker = nextNonStriker;
    nextNonStriker = temp;

    // Rotate bowler (cycle through bowling lineup, pick different bowler)
    const bowlerIndex = bowlingLineup.findIndex((b) => b.id === bowler.id);
    const nextBowlerIndex = (bowlerIndex + 1) % bowlingLineup.length;
    updatedBowler = { ...bowlingLineup[nextBowlerIndex], ballsThisOver: 0 };
  }

  // Check match end conditions
  let isMatchOver = false;
  let result: string | null = null;

  if (newRuns >= target) {
    isMatchOver = true;
    const wicketsRemaining = 10 - newWickets;
    result = `${currentState.teamBatting.name} won by ${wicketsRemaining} wicket${wicketsRemaining === 1 ? '' : 's'}!`;
  } else if (newWickets >= 10) {
    isMatchOver = true;
    const margin = target - 1 - newRuns;
    result = `${currentState.teamBowling.name} won by ${margin} run${margin === 1 ? '' : 's'}!`;
  } else if (newBallsBowled >= 120) {
    isMatchOver = true;
    const margin = target - 1 - newRuns;
    if (margin === 0) {
      result = 'Match TIED! What a thrilling finish!';
    } else {
      result = `${currentState.teamBowling.name} won by ${margin} run${margin === 1 ? '' : 's'}!`;
    }
  }

  // Compute momentum
  const recentWinProbs = nextHistory.map((h) => h.winProbBatting);
  const { momentum, shift } = calculateMomentum(recentWinProbs);

  return {
    ...currentState,
    runs: newRuns,
    wickets: newWickets,
    ballsBowled: newBallsBowled,
    isMatchOver,
    result,
    striker: nextStriker,
    nonStriker: nextNonStriker,
    bowler: updatedBowler,
    battingLineup: updatedBattingLineup,
    bowlingLineup,
    currentPartnership: nextPartnership,
    history: nextHistory,
    overSummaries: nextOverSummaries,
    highlights: nextHighlights,
    winProbability: newWinProb,
    momentum,
    recentMomentumFactor: Math.max(-1, Math.min(1, shift / 15)),
  };
}

/**
 * Fast-forward helper for "Demo Mode":
 * Jumps straight to the 18th over (106 balls), creating a dramatic tense finish
 * with 22 runs needed off 14 balls, 6 wickets down. Perfect for fast judging!
 */
export function fastForwardToTenseFinish(_baseState: MatchState, rng: RNG): MatchState {
  let state = createInitialMatch();
  // Simulate up to 106 balls (17.4 overs)
  const targetBalls = 106;
  for (let i = 0; i < targetBalls; i++) {
    state = simulateNextBall(state, rng);
    if (state.isMatchOver) {
      // Re-seed if ended too early
      break;
    }
  }
  return state;
}
