import { create } from 'zustand';
import { CatchUpSummary, SummaryTone, BallEvent } from '../engine/types';
import { generateDeterministicSummary } from '../engine/fallbackSummarizer';
import { useMatchStore } from './useMatchStore';

export type TimeframeChip = 'away' | '2min' | '5overs' | 'start';

export interface CatchUpStore {
  isAway: boolean;
  awaySinceBallNumber: number | null;
  awaySinceTimestamp: number | null;
  showCatchUpCard: boolean;
  isLoadingSummary: boolean;
  summary: CatchUpSummary | null;
  selectedTone: SummaryTone;
  selectedTimeframe: TimeframeChip;

  // Actions
  setAway: (away: boolean) => void;
  openCatchUpSheet: () => void;
  closeCatchUpSheet: () => void;
  setSelectedTone: (tone: SummaryTone) => void;
  setSelectedTimeframe: (timeframe: TimeframeChip) => void;
  generateCatchUp: () => Promise<void>;
  simulateStepAway: () => void;
}

export const useCatchUpStore = create<CatchUpStore>((set, get) => ({
  isAway: false,
  awaySinceBallNumber: null,
  awaySinceTimestamp: null,
  showCatchUpCard: false,
  isLoadingSummary: false,
  summary: null,
  selectedTone: 'simple',
  selectedTimeframe: 'away',

  setAway: (away: boolean) => {
    const currentBalls = useMatchStore.getState().match.ballsBowled;
    if (away) {
      set({
        isAway: true,
        awaySinceBallNumber: currentBalls,
        awaySinceTimestamp: Date.now(),
      });
    } else {
      const wasAway = get().isAway;
      const missedBallsCount = currentBalls - (get().awaySinceBallNumber ?? currentBalls);
      set({ isAway: false });
      if (wasAway && missedBallsCount >= 1) {
        // Automatically slide up Catch-Up card on return!
        get().openCatchUpSheet();
      }
    }
  },

  openCatchUpSheet: () => {
    set({ showCatchUpCard: true });
    get().generateCatchUp();
  },

  closeCatchUpSheet: () => {
    set({
      showCatchUpCard: false,
      awaySinceBallNumber: useMatchStore.getState().match.ballsBowled,
      awaySinceTimestamp: Date.now(),
    });
  },

  setSelectedTone: (tone: SummaryTone) => {
    set({ selectedTone: tone });
    get().generateCatchUp();
  },

  setSelectedTimeframe: (timeframe: TimeframeChip) => {
    set({ selectedTimeframe: timeframe });
    get().generateCatchUp();
  },

  simulateStepAway: () => {
    const { match } = useMatchStore.getState();
    // Mark away from 12 balls ago (2 overs) or from start
    const simulatedStartBall = Math.max(0, match.ballsBowled - 12);
    set({
      isAway: false,
      awaySinceBallNumber: simulatedStartBall,
      awaySinceTimestamp: Date.now() - 60000,
    });
    get().openCatchUpSheet();
  },

  generateCatchUp: async () => {
    const match = useMatchStore.getState().match;
    const { awaySinceBallNumber, selectedTone, selectedTimeframe } = get();

    // Determine slice of history
    let missedEvents: BallEvent[] = [];
    let winProbBefore = 50;

    if (match.history.length === 0) {
      // No balls bowled yet
      set({
        summary: {
          headline: 'Match Just Beginning!',
          happened: 'Both teams are warming up. Solar Flares need 185 to win off 120 deliveries.',
          whyItMatters: 'Every ball in the powerplay sets the tone for the chase.',
          watchNext: `${match.bowler.name} opens the attack against ${match.striker.name}.`,
          source: 'instant',
          tone: selectedTone,
          missedBallsCount: 0,
          missedRuns: 0,
          missedWickets: 0,
          winProbBefore: 50,
          winProbAfter: 50,
          keyEvents: [],
        },
        isLoadingSummary: false,
      });
      return;
    }

    if (selectedTimeframe === 'start') {
      missedEvents = match.history;
      winProbBefore = 50;
    } else if (selectedTimeframe === '5overs') {
      missedEvents = match.history.slice(-30);
      winProbBefore = missedEvents[0]?.winProbBatting ?? 50;
    } else if (selectedTimeframe === '2min') {
      missedEvents = match.history.slice(-6);
      winProbBefore = missedEvents[0]?.winProbBatting ?? match.winProbability;
    } else {
      // 'away': slice from awaySinceBallNumber
      const startIndex = awaySinceBallNumber ?? Math.max(0, match.history.length - 8);
      missedEvents = match.history.slice(startIndex);
      if (missedEvents.length === 0) {
        // At least take the last 6 balls so the fan has something rich to catch up on
        missedEvents = match.history.slice(-6);
      }
      winProbBefore = missedEvents[0]?.winProbBatting ?? 50;
    }

    const payload = {
      missedEvents,
      winProbBefore,
      winProbAfter: match.winProbability,
      target: match.target,
      currentRuns: match.runs,
      currentWickets: match.wickets,
      ballsBowled: match.ballsBowled,
      strikerName: match.striker.name,
      bowlerName: match.bowler.name,
      tone: selectedTone,
    };

    set({ isLoadingSummary: true });

    try {
      const response = await fetch('/api/catchup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: CatchUpSummary = await response.json();
      set({ summary: data, isLoadingSummary: false });
    } catch (err) {
      console.warn('Falling back to instant local summary due to network/API error:', err);
      // Instant deterministic fallback ensures 0 downtime and zero user-facing error
      const fallback = generateDeterministicSummary(payload);
      set({ summary: fallback, isLoadingSummary: false });
    }
  },
}));
