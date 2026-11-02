import { describe, it, expect, vi, afterEach } from 'vitest';
import { processCatchUpRequest, CatchUpRequestBody } from '../catchupHandler';
import { BallEvent } from '../../engine/types';
import { countWords } from '../../engine/fallbackSummarizer';

describe('CatchUp Server Handler & Groq Fallback Engine', () => {
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

  const defaultBody: CatchUpRequestBody = {
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
  };

  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('generates a valid instant fallback summary when no API key is provided', async () => {
    const summary = await processCatchUpRequest(defaultBody, '');

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

  it('successfully calls Groq and parses JSON response on success path', async () => {
    const mockGroqResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              headline: 'Mercer Strikes: Drake Bowled After Boundary!',
              happened: 'Drake smashed a crisp four before Mercer shattered his off-stump with a vicious delivery.',
              whyItMatters: 'Win probability swung 10% in Cyber Strikers favor.',
              watchNext: 'Ronin Vance faces Mercer with pressure mounting.',
            }),
          },
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGroqResponse,
    });

    const summary = await processCatchUpRequest(defaultBody, 'mock-groq-key');

    expect(summary.source).toBe('groq');
    expect(summary.headline).toBe('Mercer Strikes: Drake Bowled After Boundary!');
    expect(summary.happened).toContain('Drake smashed a crisp four');
    expect(countWords(summary.happened)).toBeLessThanOrEqual(45);
    expect(summary.whyItMatters).toBe('Win probability swung 10% in Cyber Strikers favor.');
    expect(summary.watchNext).toBe('Ronin Vance faces Mercer with pressure mounting.');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-groq-key',
        }),
      })
    );
  });

  it('strips markdown code fences from Groq responses gracefully', async () => {
    const mockContent = '```json\n{"headline":"Code Fence Headline","happened":"Missed events happened.","whyItMatters":"Swung win equity.","watchNext":"Next over battle."}\n```';
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: mockContent } }],
      }),
    });

    const summary = await processCatchUpRequest(defaultBody, 'mock-groq-key');
    expect(summary.source).toBe('groq');
    expect(summary.headline).toBe('Code Fence Headline');
  });

  it('falls back to instant deterministic engine on timeout', async () => {
    globalThis.fetch = vi.fn().mockImplementation(() => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    });

    const summary = await processCatchUpRequest(defaultBody, 'mock-groq-key');

    expect(summary.source).toBe('instant');
    expect(summary.headline).toBeTruthy();
    expect(summary.happened).toBeTruthy();
    expect(countWords(summary.happened)).toBeLessThanOrEqual(45);
  });

  it('falls back to instant deterministic engine on HTTP 429 rate limit', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({ error: { message: 'Rate limit reached' } }),
    });

    const summary = await processCatchUpRequest(defaultBody, 'mock-groq-key');

    expect(summary.source).toBe('instant');
    expect(summary.headline).toBeTruthy();
    expect(summary.happened).toBeTruthy();
    expect(countWords(summary.happened)).toBeLessThanOrEqual(45);
  });

  it('falls back to instant deterministic engine on invalid JSON response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: 'Sorry, I am an AI and cannot answer this.' } }],
      }),
    });

    const summary = await processCatchUpRequest(defaultBody, 'mock-groq-key');

    expect(summary.source).toBe('instant');
    expect(summary.headline).toBeTruthy();
    expect(summary.happened).toBeTruthy();
  });

  it('supports Cricket Nerd and Hinglish tones gracefully', async () => {
    const nerdSummary = await processCatchUpRequest(
      { ...defaultBody, tone: 'nerd' },
      ''
    );
    expect(nerdSummary.tone).toBe('nerd');
    expect(countWords(nerdSummary.happened)).toBeLessThanOrEqual(45);

    const hinglishSummary = await processCatchUpRequest(
      { ...defaultBody, tone: 'hinglish' },
      ''
    );
    expect(hinglishSummary.tone).toBe('hinglish');
    expect(countWords(hinglishSummary.happened)).toBeLessThanOrEqual(45);
  });
});
