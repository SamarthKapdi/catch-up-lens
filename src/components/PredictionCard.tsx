import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Flame,
  Award,
  Users,
  CheckCircle,
  XCircle,
  X,
  Target,
  Sparkles,
} from 'lucide-react';
import {
  usePredictionStore,
  RunsChoice,
  WicketChoice,
} from '../store/usePredictionStore';

const EMOJIS = ['🔥', '😱', '👏', '💔', '🎯', '🥶'];

export const PredictionCard: React.FC = () => {
  const {
    overNumber,
    runsChoice,
    wicketChoice,
    crowdSplits,
    fanIQ,
    streak,
    lastResolution,
    showResolutionModal,
    setRunsChoice,
    setWicketChoice,
    dismissResolution,
    triggerReaction,
  } = usePredictionStore();

  const runsOptions: { id: RunsChoice; label: string }[] = [
    { id: '0-5', label: '0 – 5' },
    { id: '6-9', label: '6 – 9' },
    { id: '10+', label: '10+' },
  ];

  return (
    <div className="bg-pitch-900 rounded-2xl border border-pitch-800 p-4 sm:p-5 shadow-xl relative">
      {/* Gamification Header: Fan IQ, Streak & Demo Crowd Notice */}
      <div className="flex items-center justify-between border-b border-pitch-800 pb-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display font-bold text-white text-sm sm:text-base">
                Over {overNumber} Predictions
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-pitch-800 text-[10px] font-semibold text-slate-400 border border-pitch-700 flex items-center space-x-1">
                <Users className="w-2.5 h-2.5 text-slate-400" />
                <span>Demo crowd</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Free to play • No stakes • Second-screen banter</p>
          </div>
        </div>

        {/* Fan IQ and Streak Score */}
        <div className="flex items-center space-x-2">
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-coral-500/20 border border-coral-500/30 text-coral-400 text-xs font-bold"
            >
              <Flame className="w-3.5 h-3.5 fill-coral-400" />
              <span>{streak}x Streak</span>
            </motion.div>
          )}

          <div className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-500/20 to-surge-500/20 border border-purple-500/30 text-slate-100 text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-surge-400" />
            <span>{fanIQ} IQ</span>
          </div>
        </div>
      </div>

      {/* Prediction Questions */}
      <div className="space-y-4 mb-4">
        {/* Question 1: Runs in this over */}
        <div>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
            <span className="flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-coral-400" />
              <span>Runs scored in Over {overNumber}?</span>
            </span>
            <span className="text-[11px] text-slate-500 font-normal">Pick one</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {runsOptions.map((opt) => {
              const split = crowdSplits.runs[opt.id];
              const isSelected = runsChoice === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setRunsChoice(opt.id)}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-between active:scale-95 ${
                    isSelected
                      ? 'bg-coral-500/20 border-coral-400 text-white shadow-lg shadow-coral-500/20 font-bold'
                      : 'bg-pitch-850 hover:bg-pitch-800 border-pitch-750 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-semibold mb-1">{opt.label} runs</span>
                  <div className="w-full bg-pitch-950 rounded-full h-1.5 overflow-hidden my-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-coral-400' : 'bg-slate-600'
                      }`}
                      style={{ width: `${split}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">{split}% crowd</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 2: Wicket in this over */}
        <div>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
            <span>Will a wicket fall in this over?</span>
            <span className="text-[11px] text-slate-500 font-normal">Pick one</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['yes', 'no'] as WicketChoice[]).map((choice) => {
              const split = crowdSplits.wicket[choice];
              const isSelected = wicketChoice === choice;
              const isYes = choice === 'yes';

              return (
                <button
                  key={choice}
                  onClick={() => setWicketChoice(choice)}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-between active:scale-95 ${
                    isSelected
                      ? isYes
                        ? 'bg-coral-500/20 border-coral-400 text-white font-bold'
                        : 'bg-surge-500/20 border-surge-400 text-white font-bold'
                      : 'bg-pitch-850 hover:bg-pitch-800 border-pitch-750 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-semibold uppercase">{choice}</span>
                  <span className="text-xs text-slate-400">{split}% crowd</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Emoji Reactions Bar */}
      <div className="pt-3 border-t border-pitch-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Match Reactions</span>
          <span className="text-[10px] text-slate-500">Tap to react live</span>
        </div>
        <div className="flex items-center justify-between gap-1.5">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => triggerReaction(emoji)}
              className="p-2 sm:p-2.5 rounded-xl bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 text-lg hover:scale-115 active:scale-90 transition-transform"
              title={`Send ${emoji} reaction`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Resolution Popup Modal / Micro-Celebration */}
      <AnimatePresence>
        {showResolutionModal && lastResolution && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-x-3 bottom-3 bg-pitch-950/95 border border-purple-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-30"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-surge-400">
                <Sparkles className="w-4 h-4" />
                <span>Over {lastResolution.overNumber} Resolved!</span>
              </div>
              <button
                onClick={dismissResolution}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Dismiss resolution"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Runs Scored ({lastResolution.runsScored} runs):</span>
                {lastResolution.runsCorrect ? (
                  <span className="text-surge-400 font-bold flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Correct (+50 IQ)</span>
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center space-x-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Missed</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Wickets Taken ({lastResolution.wicketsTaken} wkt):</span>
                {lastResolution.wicketCorrect ? (
                  <span className="text-surge-400 font-bold flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Correct (+50 IQ)</span>
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center space-x-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Missed</span>
                  </span>
                )}
              </div>
            </div>

            {lastResolution.pointsWon > 0 && (
              <div className="mt-3 pt-2 border-t border-pitch-800 text-center font-bold text-xs text-surge-400 flex items-center justify-center space-x-1">
                <span>+{lastResolution.pointsWon} Fan IQ points added! Total: {fanIQ}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
