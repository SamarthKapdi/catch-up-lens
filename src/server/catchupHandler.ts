import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateDeterministicSummary, trimToMaxWords } from '../engine/fallbackSummarizer';
import { BallEvent, CatchUpSummary, SummaryTone } from '../engine/types';

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
  const apiKey = envKey || process.env.GEMINI_API_KEY;
  const modelName = envModel || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // If no API key is set, immediately return deterministic fallback
  if (!apiKey || apiKey.trim() === '') {
    return generateDeterministicSummary(body);
  }

  // 6-second timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    const ballsMissed = body.missedEvents.length;
    const runsMissed = body.missedEvents.reduce((acc, b) => acc + b.runsScored, 0);
    const wicketsMissed = body.missedEvents
      .filter((b) => b.isWicket)
      .map((b) => `${b.dismissedPlayer || b.strikerName} (${b.wicketType || 'out'} b ${b.bowlerName})`);
    const boundaries = body.missedEvents
      .filter((b) => b.isBoundary)
      .map((b) => `${b.isSix ? '6' : '4'} by ${b.strikerName} (over ${b.overIndex}.${b.ballInOver})`);

    const prompt = `You are Catch-Up Lens, an expert live cricket assistant for Dream11.
A fan just returned to the match after missing ${ballsMissed} balls.
Provide a clear, engaging catch-up summary based STRICTLY on the facts provided below.
DO NOT invent any players, events, scores, or facts. Use only what is given.

MATCH DATA:
- Batting team chasing target: ${body.target}
- Current score: ${body.currentRuns}/${body.currentWickets} in ${Math.floor(body.ballsBowled / 6)}.${body.ballsBowled % 6} overs (${120 - body.ballsBowled} balls remaining)
- Current striker: ${body.strikerName}
- Current bowler: ${body.bowlerName}
- Win Probability before fan stepped away: ${body.winProbBefore}%
- Win Probability now: ${body.winProbAfter}%
- Deliveries missed: ${ballsMissed} balls
- Runs scored in missed period: ${runsMissed}
- Wickets lost in missed period: ${wicketsMissed.length > 0 ? wicketsMissed.join(', ') : 'None'}
- Key boundaries: ${boundaries.length > 0 ? boundaries.join(', ') : 'None'}
- Requested tone: ${body.tone} (Options: simple = plain everyday English, nerd = tactical cricket metrics and equity, hinglish = passionate cricket fan Hinglish banter)

REQUIREMENTS:
1. Output MUST be valid JSON with keys:
   "headline": punchy 1-line headline (under 12 words)
   "happened": what happened in plain language (STRICTLY AT MOST 45 WORDS)
   "whyItMatters": how the win chances swung from ${body.winProbBefore}% to ${body.winProbAfter}% and what the match equation is now
   "watchNext": one specific battle to watch in the immediate next over
2. Do not include markdown code fences or backticks. Return raw JSON only.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    clearTimeout(timeoutId);

    const responseText = result.response.text();
    // Clean potential code fences
    const cleaned = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (parsed.headline && parsed.happened && parsed.whyItMatters && parsed.watchNext) {
      return {
        headline: parsed.headline.trim(),
        happened: trimToMaxWords(parsed.happened.trim(), 45),
        whyItMatters: parsed.whyItMatters.trim(),
        watchNext: parsed.watchNext.trim(),
        source: 'ai',
        tone: body.tone,
        missedBallsCount: ballsMissed,
        missedRuns: runsMissed,
        missedWickets: body.missedEvents.filter((b) => b.isWicket).length,
        winProbBefore: body.winProbBefore,
        winProbAfter: body.winProbAfter,
        keyEvents: body.missedEvents.filter((b) => b.isWicket || b.isBoundary || b.isDroppedCatch),
      };
    }

    // If json fields missing, fall back safely
    return generateDeterministicSummary(body);
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Catch-Up Gemini API call bypassed or timed out, using deterministic fallback.', err);
    return generateDeterministicSummary(body);
  }
}
