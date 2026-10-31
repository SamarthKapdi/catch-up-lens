import { describe, it, expect } from 'vitest';
import { processCatchUpRequest } from '../catchupHandler';
import { BallEvent } from '../../engine/types';
import { countWords } from '../../engine/fallbackSummarizer';

describe('CatchUp Server Handler & Fallback Engine', () => {
  const sampleEvents: BallEvent[] = [
    {
      ballId: 'b-1',
      ballNumber: 1,
      overIndex: 0,
      ballInOver: 1,
      runsScored: 0,
      isWicket: false,
      wicketType: null,
      isBoundary: false,
      isFour: false,
      isSix: false,
      isDroppedCatch: false,
      strikerName: 'Dexter Drake',
      nonStrikerName: 'Ronin Vance',
      bowlerName: 'Rex Mercer',
      commentary: 'Beaten! Extra bounce outside off-stump.',
      winProbBatting: 52,
      scoreAfterBall: { runs: 0, wickets: 0 },
    },
    {
      ballId: 'b-2',
      ballNumber: 2,
      overIndex: 0,
      ballInOver: 2,
      runsScored: 4,
      isWicket: false,
      wicketType: null,
      isBoundary: true,
      isFour: true,
      isSix: false,
      isDroppedCatch: false,
      strikerName: 'Dexter Drake',
      nonStrikerName: 'Ronin Vance',
      bowlerName: 'Rex Mercer',
      commentary: 'CRACK! Smashed through the covers for FOUR!',
      winProbBatting: 56,
      scoreAfterBall: { runs: 4, wickets: 0 },
    },
    {
      ballId: 'b-3',
      ballNumber: 3,
      overIndex: 0,
      ballInOver: 3,
      runsScored: 0,
      isWicket: true,
      wicketType: 'bowled',
      dismissedPlayer: 'Dexter Drake',
      isBoundary: false,
      isFour: false,
      isSix: false,
      isDroppedCatch: false,
      strikerName: 'Dexter Drake',
      nonStrikerName: 'Ronin Vance',
      bowlerName: 'Rex Mercer',
      commentary: 'TIMBER! Off-stump knocked out of the ground!',
      winProbBatting: 42,
      scoreAfterBall: { runs: 4, wickets: 1 },
    },
  ];

  it('generates a valid instant fallback summary when no API key is provided', async () => {
    const summary = await processCatchUpRequest(
      {
        missedEvents: sampleEvents,
        winProbBefore: 52,
        winProbAfter: 42,
        target: 184,
        currentRuns: 4,
        currentWickets: 1,
        ballsBowled: 3,
        strikerName: 'Ronin Vance',
        bowlerName: 'Rex Mercer',
        tone: 'simple',
      },
      '' // No API key
    );

    expect(summary.source).toBe('instant');
    expect(summary.headline).toBeTruthy();
    expect(summary.happened).toBeTruthy();
    expect(summary.whyItMatters).toBeTruthy();
    expect(summary.watchNext).toBeTruthy();
    expect(summary.missedBallsCount).toBe(3);
    expect(summary.missedRuns).toBe(4);
    expect(summary.missedWickets).toBe(1);
    expect(countWords(summary.happened)).toBeLessThanOrEqual(45);
  });

  it('supports Cricket Nerd and Hinglish tones gracefully', async () => {
    const nerdSummary = await processCatchUpRequest(
      {
        missedEvents: sampleEvents,
        winProbBefore: 52,
        winProbAfter: 42,
        target: 184,
        currentRuns: 4,
        currentWickets: 1,
        ballsBowled: 3,
        strikerName: 'Ronin Vance',
        bowlerName: 'Rex Mercer',
        tone: 'nerd',
      },
      ''
    );
    expect(nerdSummary.tone).toBe('nerd');
    expect(countWords(nerdSummary.happened)).toBeLessThanOrEqual(45);

    const hinglishSummary = await processCatchUpRequest(
      {
        missedEvents: sampleEvents,
        winProbBefore: 52,
        winProbAfter: 42,
        target: 184,
        currentRuns: 4,
        currentWickets: 1,
        ballsBowled: 3,
        strikerName: 'Ronin Vance',
        bowlerName: 'Rex Mercer',
        tone: 'hinglish',
      },
      ''
    );
    expect(hinglishSummary.tone).toBe('hinglish');
    expect(countWords(hinglishSummary.happened)).toBeLessThanOrEqual(45);
  });
});
