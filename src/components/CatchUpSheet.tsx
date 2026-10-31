import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Zap,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Clock,
  Radio,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useCatchUpStore, TimeframeChip } from '../store/useCatchUpStore';
import { SummaryTone, BallEvent } from '../engine/types';

export const CatchUpSheet: React.FC = () => {
  const {
    showCatchUpCard,
    isLoadingSummary,
    summary,
    selectedTone,
    selectedTimeframe,
    closeCatchUpSheet,
    setSelectedTone,
    setSelectedTimeframe,
  } = useCatchUpStore();

  const sheetRef = useRef<HTMLDivElement>(null);

  // Keyboard accessibility: ESC key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCatchUpCard) {
        closeCatchUpSheet();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCatchUpCard, closeCatchUpSheet]);

  if (!showCatchUpCard) return null;

  const toneOptions: { id: SummaryTone; label: string; desc: string }[] = [
    { id: 'simple', label: 'Simple', desc: 'Plain language' },
    { id: 'nerd', label: 'Cricket Nerd', desc: 'Tactics & win equity' },
    { id: 'hinglish', label: 'Hinglish', desc: 'Fan banter style' },
  ];

  const timeframeOptions: { id: TimeframeChip; label: string }[] = [
    { id: 'away', label: 'While Away' },
    { id: '2min', label: 'Last 2 Mins' },
    { id: '5overs', label: 'Last 5 Overs' },
    { id: 'start', label: 'Full Chase' },
  ];

  const probDelta = summary ? summary.winProbAfter - summary.winProbBefore : 0;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-pitch-950/80 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catchup-title"
      >
        {/* Backdrop click to dismiss */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCatchUpSheet}
          className="absolute inset-0 cursor-pointer"
        />

        {/* Modal / Bottom Sheet Card */}
        <motion.div
          ref={sheetRef}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-xl max-h-[90vh] bg-pitch-900 border border-pitch-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto flex flex-col z-10"
        >
          {/* Mobile swipe grab handle */}
          <div className="w-12 h-1.5 bg-pitch-700 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-pitch-800 flex items-center justify-between sticky top-0 bg-pitch-900/95 backdrop-blur-md z-20">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-coral-500/20 border border-coral-500/30 flex items-center justify-center text-coral-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 id="catchup-title" className="font-display font-extrabold text-white text-base sm:text-lg flex items-center space-x-2">
                  <span>Catch-Up Lens</span>
                  <span className="text-slate-500 text-xs font-normal hidden sm:inline">• Never watch alone</span>
                </h2>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span>Back in the match in 20 seconds</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* AI vs Instant Badge */}
              {summary?.source === 'ai' ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-coral-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Groq AI ⚡</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-surge-500/20 border border-surge-500/30 text-surge-300 text-xs font-bold shadow-sm">
                  <Zap className="w-3 h-3 text-surge-400" />
                  <span>Instant Engine</span>
                </span>
              )}

              <button
                onClick={closeCatchUpSheet}
                className="p-1.5 rounded-full hover:bg-pitch-800 text-slate-400 hover:text-white transition"
                aria-label="Close Catch-Up Sheet"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4 flex-1">
            {/* Tone Selector Row */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Summary Tone
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-pitch-950 rounded-xl border border-pitch-800">
                {toneOptions.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedTone(tone.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition flex flex-col items-center ${
                      selectedTone === tone.id
                        ? 'bg-pitch-800 text-coral-400 shadow border border-pitch-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{tone.label}</span>
                    <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">
                      {tone.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Timeframe Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  How long were you away?
                </label>
                <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Click to adjust window</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {timeframeOptions.map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setSelectedTimeframe(tf.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                      selectedTimeframe === tf.id
                        ? 'bg-coral-500 text-white border-coral-400 font-semibold shadow-sm'
                        : 'bg-pitch-850 text-slate-400 border-pitch-750 hover:bg-pitch-800 hover:text-slate-200'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skeleton Loading State */}
            {isLoadingSummary ? (
              <div className="space-y-3 py-4 animate-pulse">
                <div className="h-6 bg-pitch-800 rounded-lg w-3/4" />
                <div className="h-16 bg-pitch-800 rounded-xl" />
                <div className="h-12 bg-pitch-800 rounded-xl" />
                <div className="h-12 bg-pitch-800 rounded-xl" />
              </div>
            ) : summary ? (
              <div className="space-y-4" aria-live="polite">
                {/* 1. Punchy Headline */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-coral-500/15 via-pitch-850 to-surge-500/10 border border-coral-500/30">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-coral-400 mb-0.5 flex items-center space-x-1">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>Live Match Update</span>
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white leading-tight">
                    {summary.headline}
                  </h3>
                </div>

                {/* 2. What You Missed (max 45 words) */}
                <div className="p-3.5 rounded-2xl bg-pitch-850 border border-pitch-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      What You Missed
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {summary.missedBallsCount} balls • {summary.missedRuns} runs • {summary.missedWickets} wkt
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-normal">
                    {summary.happened}
                  </p>
                </div>

                {/* 3. Why It Matters (Win Probability Swing) */}
                <div className="p-3.5 rounded-2xl bg-pitch-850 border border-pitch-800">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Why It Matters</span>
                    <span className="text-xs font-semibold flex items-center space-x-1">
                      {probDelta > 0 ? (
                        <span className="text-surge-400 flex items-center space-x-0.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Flares +{Math.abs(Math.round(probDelta))}%</span>
                        </span>
                      ) : probDelta < 0 ? (
                        <span className="text-coral-400 flex items-center space-x-0.5">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>Flares -{Math.abs(Math.round(probDelta))}%</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Neutral equation</span>
                      )}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {summary.whyItMatters}
                  </p>

                  {/* Visual before/after mini bar */}
                  <div className="mt-2.5 pt-2 border-t border-pitch-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      Before: <strong className="text-slate-200">{summary.winProbBefore}%</strong>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <div>
                      Now: <strong className="text-white font-bold">{summary.winProbAfter}%</strong>
                    </div>
                  </div>
                </div>

                {/* 4. Watch Next */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-pitch-850 border border-amber-500/30">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 mb-1 flex items-center space-x-1">
                    <Flame className="w-3 h-3" />
                    <span>Watch Next (Immediate Next Over)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium">
                    {summary.watchNext}
                  </p>
                </div>

                {/* 5. Key-Moments Mini Timeline */}
                {summary.keyEvents.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Missed Highlights ({summary.keyEvents.length})
                    </label>
                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
                      {summary.keyEvents.map((ev: BallEvent) => (
                        <div
                          key={ev.ballId}
                          className="flex-shrink-0 px-3 py-2 rounded-xl bg-pitch-850 border border-pitch-800 text-xs w-44"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-400 font-medium">
                              Over {ev.overIndex}.{ev.ballInOver}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                ev.isWicket
                                  ? 'bg-coral-500/20 text-coral-400'
                                  : ev.isSix
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-surge-500/20 text-surge-400'
                              }`}
                            >
                              {ev.isWicket ? 'WKT' : ev.isSix ? '6' : '4'}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] truncate" title={ev.commentary}>
                            {ev.commentary}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 sm:p-5 border-t border-pitch-800 bg-pitch-900/95 sticky bottom-0 flex items-center justify-between gap-3">
            <button
              onClick={closeCatchUpSheet}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-coral-500/20 flex items-center justify-center space-x-2 active:scale-98 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Back in the Game — Predict Next Over</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
