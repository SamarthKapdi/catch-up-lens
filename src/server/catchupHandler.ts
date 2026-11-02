import { generateDeterministicSummary, trimToMaxWords } from '../engine/fallbackSummarizer.js';
import { BallEvent, CatchUpSummary, SummaryTone } from '../engine/types.js';

export interface CatchUpRequestBody {
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

export async function processCatchUpRequest(
  body: CatchUpRequestBody,
  envKey?: string,
  envModel?: string
): Promise<CatchUpSummary> {
  const apiKey = envKey !== undefined ? envKey : process.env.GROQ_API_KEY;
  const modelName = envModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  // If no API key is set, immediately return deterministic fallback
  if (!apiKey || apiKey.trim() === '') {
    return generateDeterministicSummary(body);
  }

  // 6-second timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const ballsMissed = body.missedEvents.length;
    const runsMissed = body.missedEvents.reduce((acc, b) => acc + b.runsScored, 0);
    const wicketsMissed = body.missedEvents
      .filter((b) => b.isWicket)
      .map((b) => `${b.dismissedPlayer || b.strikerName} (${b.wicketType || 'out'} b ${b.bowlerName})`);
    const boundaries = body.missedEvents
      .filter((b) => b.isBoundary)
      .map((b) => `${b.isSix ? '6' : '4'} by ${b.strikerName} (over ${b.overIndex}.${b.ballInOver})`);

    const systemPrompt = `You are Catch-Up Lens, an expert live cricket assistant for Dream11 second-screen experience.
A fan just returned to the match after missing ${ballsMissed} balls.
Provide a clear, engaging catch-up summary based STRICTLY on the facts provided by the user.

CRITICAL RULES:
1. Rely ONLY on the provided match facts. Never invent players, events, runs, wickets, or scores.
2. Return a valid JSON object with exactly these four keys:
   - "headline": punchy 1-line headline (under 12 words)
   - "happened": what happened in plain language (STRICTLY AT MOST 45 WORDS)
   - "whyItMatters": how the win chances changed from ${body.winProbBefore}% to ${body.winProbAfter}% and what the current match equation is
   - "watchNext": one key battle or tactical matchup to watch in the immediate next over
3. Strictly follow the requested tone:
   - "simple": Plain, clear everyday language for casual fans.
   - "nerd": Tactical cricket analysis referencing win equity, RRR, run rates, and phase leverage.
   - "hinglish": Passionate Indian cricket fan Hinglish banter (e.g. 'Double Jhatka!', 'chauke-chhakke', 'match fas gaya').
4. Output raw JSON only. Do not wrap in markdown or backticks.`;

    const userPayload = JSON.stringify(
      {
        target: body.target,
        currentScore: `${body.currentRuns}/${body.currentWickets} in ${Math.floor(body.ballsBowled / 6)}.${body.ballsBowled % 6} overs (${120 - body.ballsBowled} balls remaining)`,
        currentStriker: body.strikerName,
        currentBowler: body.bowlerName,
        winProbabilityBefore: `${body.winProbBefore}%`,
        winProbabilityNow: `${body.winProbAfter}%`,
        deliveriesMissed: ballsMissed,
        runsScoredInMissedPeriod: runsMissed,
        wicketsLostInMissedPeriod: wicketsMissed.length > 0 ? wicketsMissed : 'None',
        boundariesInMissedPeriod: boundaries.length > 0 ? boundaries : 'None',
        requestedTone: body.tone,
      },
      null,
      2
    );

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPayload },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 400,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Groq API returned HTTP error ${response.status}. Using fallback.`);
      return generateDeterministicSummary(body);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.warn('Groq API response missing content. Using fallback.');
      return generateDeterministicSummary(body);
    }

    // Sanitize response: strip potential code fences
    const cleaned = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (
      typeof parsed.headline === 'string' &&
      typeof parsed.happened === 'string' &&
      typeof parsed.whyItMatters === 'string' &&
      typeof parsed.watchNext === 'string'
    ) {
      return {
        headline: parsed.headline.trim(),
        happened: trimToMaxWords(parsed.happened.trim(), 45),
        whyItMatters: parsed.whyItMatters.trim(),
        watchNext: parsed.watchNext.trim(),
        source: 'groq',
        tone: body.tone,
        missedBallsCount: ballsMissed,
        missedRuns: runsMissed,
        missedWickets: body.missedEvents.filter((b) => b.isWicket).length,
        winProbBefore: body.winProbBefore,
        winProbAfter: body.winProbAfter,
        keyEvents: body.missedEvents.filter((b) => b.isWicket || b.isBoundary || b.isDroppedCatch),
      };
    }

    console.warn('Groq API JSON missing expected schema fields. Using fallback.');
    return generateDeterministicSummary(body);
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Catch-Up Groq API call failed or timed out, using deterministic fallback.', err);
    return generateDeterministicSummary(body);
  }
}
