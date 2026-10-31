import { create } from 'zustand';
import confetti from 'canvas-confetti';

export type RunsChoice = '0-5' | '6-9' | '10+';
export type WicketChoice = 'yes' | 'no';

export interface FloatingReaction {
  id: string;
  emoji: string;
  x: number; // percentage across screen 10-90%
}

export interface PredictionStore {
  overNumber: number;
  runsChoice: RunsChoice | null;
  wicketChoice: WicketChoice | null;
  hasLockedPrediction: boolean;
  
  // Crowd simulation ("Demo Crowd")
  crowdSplits: {
    runs: { '0-5': number; '6-9': number; '10+': number };
    wicket: { yes: number; no: number };
  };

  // Gamification & Fan IQ
  fanIQ: number;
  streak: number;
  highestStreak: number;
  lastResolution: {
    overNumber: number;
    runsScored: number;
    wicketsTaken: number;
    runsCorrect: boolean;
    wicketCorrect: boolean;
    pointsWon: number;
  } | null;
  showResolutionModal: boolean;

  // Floating reactions
  floatingReactions: FloatingReaction[];

  // Actions
  setRunsChoice: (choice: RunsChoice) => void;
  setWicketChoice: (choice: WicketChoice) => void;
  lockPrediction: () => void;
  shiftCrowdSplits: () => void;
  resolveOver: (overNumber: number, actualRuns: number, actualWickets: number) => void;
  dismissResolution: () => void;
  triggerReaction: (emoji: string) => void;
  removeReaction: (id: string) => void;
  resetPredictions: () => void;
}

export const usePredictionStore = create<PredictionStore>((set, get) => ({
  overNumber: 1,
  runsChoice: null,
  wicketChoice: null,
  hasLockedPrediction: false,

  crowdSplits: {
    runs: { '0-5': 28, '6-9': 44, '10+': 28 },
    wicket: { yes: 34, no: 66 },
  },

  fanIQ: 150,
  streak: 0,
  highestStreak: 0,
  lastResolution: null,
  showResolutionModal: false,
  floatingReactions: [],

  setRunsChoice: (choice) => set({ runsChoice: choice }),
  setWicketChoice: (choice) => set({ wicketChoice: choice }),
  lockPrediction: () => set({ hasLockedPrediction: true }),

  shiftCrowdSplits: () => {
    // Dynamic simulated shift in crowd opinion
    const jitter = (Math.random() - 0.5) * 6;
    set((state) => {
      const newLow = Math.max(15, Math.min(50, Math.round(state.crowdSplits.runs['0-5'] + jitter)));
      const newHigh = Math.max(15, Math.min(50, Math.round(state.crowdSplits.runs['10+'] - jitter)));
      const newMid = 100 - newLow - newHigh;
      const wJitter = (Math.random() - 0.5) * 4;
      const newWicketYes = Math.max(15, Math.min(65, Math.round(state.crowdSplits.wicket.yes + wJitter)));

      return {
        crowdSplits: {
          runs: { '0-5': newLow, '6-9': newMid, '10+': newHigh },
          wicket: { yes: newWicketYes, no: 100 - newWicketYes },
        },
      };
    });
  },

  resolveOver: (overNum, actualRuns, actualWickets) => {
    const { runsChoice, wicketChoice, fanIQ, streak, highestStreak } = get();

    // Determine correctness
    let runsCategory: RunsChoice = '6-9';
    if (actualRuns <= 5) runsCategory = '0-5';
    else if (actualRuns >= 10) runsCategory = '10+';

    const runsCorrect = runsChoice === runsCategory;
    const wicketCorrect =
      wicketChoice !== null &&
      ((wicketChoice === 'yes' && actualWickets > 0) || (wicketChoice === 'no' && actualWickets === 0));

    let pointsWon = 0;
    if (runsCorrect) pointsWon += 50;
    if (wicketCorrect) pointsWon += 50;

    const hadAnyPick = runsChoice !== null || wicketChoice !== null;
    const isWinner = pointsWon > 0;

    let newStreak = streak;
    if (hadAnyPick) {
      if (isWinner) {
        newStreak += 1;
        // Trigger celebratory confetti micro-burst
        try {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#00D688', '#FF385C', '#FFBA08'],
          });
        } catch (_) {}
      } else {
        newStreak = 0;
      }
    }

    set({
      fanIQ: fanIQ + pointsWon,
      streak: newStreak,
      highestStreak: Math.max(highestStreak, newStreak),
      lastResolution: hadAnyPick
        ? {
            overNumber: overNum,
            runsScored: actualRuns,
            wicketsTaken: actualWickets,
            runsCorrect,
            wicketCorrect,
            pointsWon,
          }
        : null,
      showResolutionModal: hadAnyPick,
      // Setup for next over
      overNumber: overNum + 1,
      runsChoice: null,
      wicketChoice: null,
      hasLockedPrediction: false,
    });
  },

  dismissResolution: () => set({ showResolutionModal: false }),

  triggerReaction: (emoji: string) => {
    const id = `react-${Date.now()}-${Math.random()}`;
    const x = Math.floor(Math.random() * 70) + 15; // 15% to 85%
    set((state) => ({
      floatingReactions: [...state.floatingReactions, { id, emoji, x }],
    }));
  },

  removeReaction: (id: string) => {
    set((state) => ({
      floatingReactions: state.floatingReactions.filter((r) => r.id !== id),
    }));
  },

  resetPredictions: () => {
    set({
      overNumber: 1,
      runsChoice: null,
      wicketChoice: null,
      hasLockedPrediction: false,
      lastResolution: null,
      showResolutionModal: false,
      floatingReactions: [],
    });
  },
}));
