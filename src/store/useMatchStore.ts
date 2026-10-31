import { create } from 'zustand';
import { MatchState } from '../engine/types';
import { createInitialMatch, simulateNextBall, fastForwardToTenseFinish } from '../engine/matchSimulator';
import { createRNG, RNG } from '../engine/prng';

interface MatchStore {
  match: MatchState;
  isPlaying: boolean;
  speed: 1 | 2 | 4;
  seed: number;
  rng: RNG;
  
  // Actions
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: 1 | 2 | 4) => void;
  stepBall: () => void;
  triggerDemoMode: () => void;
  resetMatch: (newSeed?: number) => void;
}

const DEFAULT_SEED = 42891;

export const useMatchStore = create<MatchStore>((set, get) => {
  const initialRng = createRNG(DEFAULT_SEED);
  return {
    match: createInitialMatch(),
    isPlaying: true,
    speed: 1,
    seed: DEFAULT_SEED,
    rng: initialRng,

    togglePlay: () => {
      set((state) => ({ isPlaying: !state.isPlaying }));
    },

    setPlaying: (playing: boolean) => {
      set({ isPlaying: playing });
    },

    setSpeed: (speed: 1 | 2 | 4) => {
      set({ speed });
    },

    stepBall: () => {
      const { match, rng } = get();
      if (match.isMatchOver) {
        set({ isPlaying: false });
        return;
      }
      const nextState = simulateNextBall(match, rng);
      set({
        match: nextState,
        isPlaying: !nextState.isMatchOver && get().isPlaying,
      });
    },

    triggerDemoMode: () => {
      const newSeed = Date.now();
      const newRng = createRNG(newSeed);
      const demoState = fastForwardToTenseFinish(createInitialMatch(), newRng);
      set({
        match: demoState,
        isPlaying: true,
        seed: newSeed,
        rng: newRng,
      });
    },

    resetMatch: (customSeed?: number) => {
      const nextSeed = customSeed ?? Date.now();
      const nextRng = createRNG(nextSeed);
      set({
        match: createInitialMatch(),
        isPlaying: true,
        seed: nextSeed,
        rng: nextRng,
      });
    },
  };
});
