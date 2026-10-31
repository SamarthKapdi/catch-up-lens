import { describe, it, expect } from 'vitest';
import { calculateWinProbability } from '../winProbability';
import { createRNG } from '../prng';
import { createInitialMatch, simulateNextBall, fastForwardToTenseFinish } from '../matchSimulator';
import { generateDeterministicSummary, countWords } from '../fallbackSummarizer';

describe('Win Probability Calculator', () => {
  it('returns 100 when target is reached', () => {
    expect(calculateWinProbability(180, 180, 90, 3)).toBe(100);
    expect(calculateWinProbability(180, 185, 95, 4)).toBe(100);
  });

  it('returns 0 when 10 wickets are down and target is not reached', () => {
    expect(calculateWinProbability(180, 140, 90, 10)).toBe(0);
  });

  it('returns 0 when 120 balls are bowled and target is not reached', () => {
    expect(calculateWinProbability(180, 175, 120, 4)).toBe(0);
  });

  it('bounds probability between 1% and 99% during active chase', () => {
    const prob1 = calculateWinProbability(180, 50, 40, 2);
    expect(prob1).toBeGreaterThanOrEqual(1);
    expect(prob1).toBeLessThanOrEqual(99);

    const prob2 = calculateWinProbability(180, 160, 110, 2);
    expect(prob2).toBeGreaterThanOrEqual(1);
    expect(prob2).toBeLessThanOrEqual(99);
  });

  it('drops win probability when consecutive wickets fall', () => {
    const probWithFewWickets = calculateWinProbability(180, 100, 70, 2);
    const probWithManyWickets = calculateWinProbability(180, 100, 70, 6);
    expect(probWithFewWickets).toBeGreaterThan(probWithManyWickets);
  });
});

describe('Seeded Deterministic Simulation', () => {
  it('produces identical ball-by-ball sequence with identical seed', () => {
    const seed = 12345;
    const rng1 = createRNG(seed);
    const rng2 = createRNG(seed);

    let state1 = createInitialMatch();
    let state2 = createInitialMatch();

    for (let i = 0; i < 20; i++) {
      state1 = simulateNextBall(state1, rng1);
      state2 = simulateNextBall(state2, rng2);
    }

    expect(state1.runs).toEqual(state2.runs);
    expect(state1.wickets).toEqual(state2.wickets);
    expect(state1.history.length).toEqual(state2.history.length);
    expect(state1.history[10].runsScored).toEqual(state2.history[10].runsScored);
    expect(state1.history[10].strikerName).toEqual(state2.history[10].strikerName);
    expect(state1.winProbability).toEqual(state2.winProbability);
  });

  it('fastForwardToTenseFinish advances deep into the match', () => {
    const rng = createRNG(42);
    const state = createInitialMatch();
    const tenseState = fastForwardToTenseFinish(state, rng);

    expect(tenseState.ballsBowled).toBeGreaterThanOrEqual(90);
    expect(tenseState.runs).toBeGreaterThan(50);
  });
});

describe('Deterministic Fallback Summarizer', () => {
  it('enforces word limit on happened field <= 45 words', () => {
    const rng = createRNG(999);
    let state = createInitialMatch();
    for (let i = 0; i < 18; i++) {
      state = simulateNextBall(state, rng);
    }

    const tones: Array<'simple' | 'nerd' | 'hinglish'> = ['simple', 'nerd', 'hinglish'];

    tones.forEach((tone) => {
      const summary = generateDeterministicSummary({
        missedEvents: state.history,
        winProbBefore: 50,
        winProbAfter: state.winProbability,
        target: state.target,
        currentRuns: state.runs,
        currentWickets: state.wickets,
        ballsBowled: state.ballsBowled,
        strikerName: state.striker.name,
        bowlerName: state.bowler.name,
        tone,
      });

      expect(summary.headline).toBeTruthy();
      expect(summary.happened).toBeTruthy();
      expect(summary.whyItMatters).toBeTruthy();
      expect(summary.watchNext).toBeTruthy();
      expect(countWords(summary.happened)).toBeLessThanOrEqual(45);
    });
  });

  it('reflects actual wickets and boundaries that occurred', () => {
    const rng = createRNG(777);
    let state = createInitialMatch();
    for (let i = 0; i < 24; i++) {
      state = simulateNextBall(state, rng);
    }

    const summary = generateDeterministicSummary({
      missedEvents: state.history,
      winProbBefore: 45,
      winProbAfter: state.winProbability,
      target: state.target,
      currentRuns: state.runs,
      currentWickets: state.wickets,
      ballsBowled: state.ballsBowled,
      strikerName: state.striker.name,
      bowlerName: state.bowler.name,
      tone: 'simple',
    });

    const expectedRuns = state.history.reduce((a, b) => a + b.runsScored, 0);
    const expectedWickets = state.history.filter((b) => b.isWicket).length;

    expect(summary.missedRuns).toEqual(expectedRuns);
    expect(summary.missedWickets).toEqual(expectedWickets);
  });
});
