import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Zap, RotateCcw } from 'lucide-react';
import { useMatchStore } from '../store/useMatchStore';
import { usePredictionStore } from '../store/usePredictionStore';

export const PitchVisualizer: React.FC = () => {
  const { match, isPlaying, speed, togglePlay, setSpeed, stepBall, triggerDemoMode, resetMatch } =
    useMatchStore();
  const { shiftCrowdSplits, resolveOver } = usePredictionStore();

  const prevBallsBowledRef = useRef(match.ballsBowled);

  // Timer loop for simulation
  useEffect(() => {
    if (!isPlaying || match.isMatchOver) return;

    // Speeds: 1x = 3000ms, 2x = 1500ms, 4x = 750ms
    const intervalMs = 3000 / speed;

    const timer = setInterval(() => {
      stepBall();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed, match.isMatchOver, stepBall]);

  // Handle over completion predictions and crowd shifts
  useEffect(() => {
    if (match.ballsBowled !== prevBallsBowledRef.current) {
      shiftCrowdSplits();

      // Check if an over just completed (ballsBowled is multiple of 6)
      if (match.ballsBowled > 0 && match.ballsBowled % 6 === 0) {
        const overIndex = match.ballsBowled / 6;
        const overSummary = match.overSummaries.find((o) => o.overNumber === overIndex);
        if (overSummary) {
          resolveOver(overIndex, overSummary.runsConceded, overSummary.wicketsTaken);
        }
      }

      prevBallsBowledRef.current = match.ballsBowled;
    }
  }, [match.ballsBowled, match.overSummaries, shiftCrowdSplits, resolveOver]);

  // Last ball event
  const lastBall = match.history[match.history.length - 1];

  // Current over balls
  const currentOverBallCount = match.ballsBowled % 6 === 0 && match.ballsBowled > 0 ? 6 : match.ballsBowled % 6;
  const currentOverBalls = match.history.slice(-currentOverBallCount);

  return (
    <div className="bg-pitch-900 rounded-2xl border border-pitch-800 p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Background stadium glow depending on event */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          lastBall?.isWicket
            ? 'bg-coral-500/10 opacity-100'
            : lastBall?.isSix
            ? 'bg-gold-500/10 opacity-100'
            : lastBall?.isFour
            ? 'bg-surge-500/10 opacity-100'
            : 'opacity-0'
        }`}
      />

      {/* Simulator Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 z-10 relative">
        <div className="flex items-center space-x-2">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            disabled={match.isMatchOver}
            aria-label={isPlaying ? 'Pause match simulation' : 'Play match simulation'}
            className="p-2.5 rounded-xl bg-pitch-800 hover:bg-pitch-700 text-white border border-pitch-700 transition active:scale-95 disabled:opacity-50"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-surge-400 fill-surge-400" />}
          </button>

          {/* Speed Pills */}
          <div className="flex bg-pitch-850 p-1 rounded-xl border border-pitch-700/60" role="group" aria-label="Simulation speed">
            {([1, 2, 4] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  speed === s
                    ? 'bg-pitch-700 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Step 1 Ball */}
          <button
            onClick={stepBall}
            disabled={isPlaying || match.isMatchOver}
            className="px-3 py-1.5 rounded-xl bg-pitch-800 hover:bg-pitch-700 text-slate-300 hover:text-white border border-pitch-700 text-xs font-medium transition disabled:opacity-40"
          >
            +1 Ball
          </button>
        </div>

        {/* Demo Mode Button and Reset */}
        <div className="flex items-center space-x-2">
          <button
            onClick={triggerDemoMode}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-coral-500 hover:from-amber-600 hover:to-coral-600 text-white text-xs font-bold shadow-lg shadow-coral-500/25 flex items-center space-x-1.5 transition active:scale-95"
            title="Fast forward to final 2 overs with tense finish"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Demo Mode (Tense Finish)</span>
          </button>

          <button
            onClick={() => resetMatch()}
            className="p-2 rounded-xl bg-pitch-800 hover:bg-pitch-700 text-slate-400 hover:text-white border border-pitch-700 transition"
            title="Restart Match"
            aria-label="Restart match"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Pitch Strip */}
      <div className="relative h-28 sm:h-32 bg-gradient-to-b from-pitch-850 to-pitch-950 rounded-xl border border-pitch-800 flex items-center justify-center p-3 mb-4 overflow-hidden">
        {/* Pitch crease lines */}
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-14 bg-amber-900/10 border-y border-amber-800/30 rounded-sm flex items-center justify-between px-6">
          <div className="w-1.5 h-full bg-amber-200/40 rounded-full" />
          <div className="text-center font-display text-[10px] tracking-widest text-slate-600 uppercase">
            22 YARDS • {match.bowler.style.toUpperCase()}
          </div>
          <div className="w-1.5 h-full bg-amber-200/40 rounded-full" />
        </div>

        {/* Current over ball outcome indicators */}
        <div className="z-10 flex items-center space-x-2 sm:space-x-3">
          {Array.from({ length: 6 }).map((_, index) => {
            const ball = currentOverBalls[index];
            if (!ball) {
              return (
                <div
                  key={index}
                  className="w-8 h-8 rounded-full border border-pitch-700/60 bg-pitch-900/50 flex items-center justify-center text-xs text-slate-600"
                >
                  {index + 1}
                </div>
              );
            }

            let badgeClass = 'bg-pitch-800 text-slate-300 border-pitch-700';
            let label = ball.runsScored.toString();

            if (ball.isWicket) {
              badgeClass = 'bg-coral-500 text-white font-bold border-coral-400 shadow-lg shadow-coral-500/40 animate-pulse';
              label = 'W';
            } else if (ball.isSix) {
              badgeClass = 'bg-gradient-to-br from-amber-500 to-purple-600 text-white font-bold border-amber-400 shadow-md';
              label = '6';
            } else if (ball.isFour) {
              badgeClass = 'bg-surge-500 text-pitch-950 font-bold border-surge-400 shadow-md';
              label = '4';
            } else if (ball.isDroppedCatch) {
              badgeClass = 'bg-amber-600 text-white font-bold border-amber-400';
              label = 'DC';
            } else if (ball.runsScored === 0) {
              label = '•';
            }

            return (
              <motion.div
                key={ball.ballId}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center text-xs sm:text-sm font-semibold transition ${badgeClass}`}
                title={`Ball ${ball.overIndex}.${ball.ballInOver}: ${ball.commentary}`}
              >
                {label}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Commentary & Event Announcement */}
      <div className="bg-pitch-850 rounded-xl p-3 sm:p-4 border border-pitch-750 min-h-[72px] flex items-center justify-between" aria-live="polite">
        <AnimatePresence mode="wait">
          {lastBall ? (
            <motion.div
              key={lastBall.ballId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex-1 pr-3"
            >
              <div className="flex items-center space-x-2 text-xs font-semibold mb-1">
                <span className="text-amber-400">
                  Over {lastBall.overIndex}.{lastBall.ballInOver}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">
                  {lastBall.bowlerName} to {lastBall.strikerName}
                </span>
                {lastBall.milestone && (
                  <span className="px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 font-bold text-[10px] border border-gold-500/30">
                    ★ {lastBall.milestone}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                {lastBall.commentary}
              </p>
            </motion.div>
          ) : (
            <div className="text-xs text-slate-400">
              Match starting. Press Play to begin the chase or hit Demo Mode.
            </div>
          )}
        </AnimatePresence>

        {lastBall && (
          <div className="text-right pl-2 border-l border-pitch-750 hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Outcome</div>
            <div
              className={`font-display text-xl font-extrabold ${
                lastBall.isWicket
                  ? 'text-coral-500'
                  : lastBall.isSix
                  ? 'text-amber-400'
                  : lastBall.isFour
                  ? 'text-surge-400'
                  : 'text-slate-200'
              }`}
            >
              {lastBall.isWicket
                ? 'WICKET'
                : lastBall.isSix
                ? 'SIX!'
                : lastBall.isFour
                ? 'FOUR!'
                : `${lastBall.runsScored} RUN${lastBall.runsScored === 1 ? '' : 'S'}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
