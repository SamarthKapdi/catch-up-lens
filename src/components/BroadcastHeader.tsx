import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Shield, TrendingUp, Sparkles, UserCheck, EyeOff, Sun, Moon } from 'lucide-react';
import { useMatchStore } from '../store/useMatchStore';
import { useCatchUpStore } from '../store/useCatchUpStore';
import { useThemeStore } from '../store/useThemeStore';

export const BroadcastHeader: React.FC = () => {
  const match = useMatchStore((state) => state.match);
  const { isAway, simulateStepAway, openCatchUpSheet } = useCatchUpStore();
  const { isDark, toggleTheme } = useThemeStore();

  const ballsRemaining = Math.max(0, 120 - match.ballsBowled);
  const runsNeeded = Math.max(0, match.target - match.runs);
  const rrr = ballsRemaining > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(1) : '0.0';
  const crr = match.ballsBowled > 0 ? ((match.runs / match.ballsBowled) * 6).toFixed(1) : '0.0';

  const overFormatted = `${Math.floor(match.ballsBowled / 6)}.${match.ballsBowled % 6}`;

  // Solar Flares is batting (chasing), Cyber Strikers is bowling
  const flaresWinProb = match.winProbability;
  const strikersWinProb = Math.round((100 - flaresWinProb) * 10) / 10;

  return (
    <header className="w-full bg-pitch-900/90 backdrop-blur-md border-b border-pitch-700/60 sticky top-0 z-30 transition-colors">
      {/* Top micro-bar: Live status, Fan Attention Status & Catch-Up triggers */}
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-xs border-b border-pitch-800/60">
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-coral-500"></span>
          </span>
          <span className="font-semibold tracking-wider uppercase text-coral-400">LIVE CHASE</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 hidden sm:inline">T20 Champions League Final</span>
        </div>

        {/* Attention tracker & Hero feature triggers */}
        <div className="flex items-center space-x-2">
          {isAway ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <EyeOff className="w-3 h-3 animate-pulse" />
              <span>Away (Tab Hidden)</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-surge-500/20 text-surge-400 border border-surge-500/30">
              <UserCheck className="w-3 h-3" />
              <span>You're Live</span>
            </span>
          )}

          <button
            onClick={simulateStepAway}
            className="px-2.5 py-1 rounded bg-pitch-800 hover:bg-pitch-700 text-slate-300 hover:text-white border border-pitch-700 transition flex items-center space-x-1"
            title="Simulate stepping away for 2 minutes to test Catch-Up"
          >
            <EyeOff className="w-3 h-3 text-amber-400" />
            <span className="font-medium">Step Away</span>
          </button>

          <button
            onClick={openCatchUpSheet}
            className="px-3 py-1 rounded bg-coral-500 hover:bg-coral-600 text-white font-semibold flex items-center space-x-1.5 shadow-sm transition active:scale-95"
            aria-label="Open Catch-Up Lens"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catch-Up Lens</span>
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1 sm:px-2.5 sm:py-1 rounded bg-pitch-800 hover:bg-pitch-700 text-slate-300 hover:text-white border border-pitch-700 transition flex items-center space-x-1.5 shadow-sm active:scale-95"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-medium text-xs">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline font-medium text-xs">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Score & Teams Board */}
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Left: Chasing Team & Target */}
          <div className="md:col-span-4 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral-500 to-amber-500 flex items-center justify-center font-display font-extrabold text-white text-lg shadow-lg shadow-coral-500/20">
              SFL
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {match.runs}/{match.wickets}
                </span>
                <span className="text-sm font-medium text-slate-400">
                  ({overFormatted} / 20 ov)
                </span>
              </div>
              <div className="text-xs text-slate-300 flex items-center space-x-2">
                <span>{match.teamBatting.name}</span>
                <span className="text-slate-500">•</span>
                <span className="text-coral-400 font-semibold">
                  Target: {match.target}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Match Equation & Required Rate */}
          <div className="md:col-span-4 bg-pitch-850/80 rounded-xl p-2.5 border border-pitch-700/50 flex flex-col items-center justify-center text-center">
            {match.isMatchOver ? (
              <div className="text-sm font-bold text-surge-400">
                {match.result}
              </div>
            ) : (
              <>
                <div className="text-xs sm:text-sm font-semibold text-slate-200">
                  Need <span className="text-coral-400 font-bold">{runsNeeded}</span> runs in{' '}
                  <span className="text-white font-bold">{ballsRemaining}</span> balls
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                  <span>
                    Req Rate: <strong className="text-slate-200">{rrr}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Cur Rate: <strong className="text-slate-200">{crr}</strong>
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Right: Bowling Team & Momentum */}
          <div className="md:col-span-4 flex items-center justify-between md:justify-end space-x-3">
            <div className="text-left md:text-right">
              <div className="text-xs text-slate-400">Defending:</div>
              <div className="font-semibold text-sm text-surge-400 flex items-center md:justify-end space-x-1">
                <span>{match.teamBowling.name}</span>
              </div>
              <div className="text-xs text-slate-500">
                Bowler: <strong className="text-slate-300">{match.bowler.name}</strong> ({match.bowler.wickets}/{match.bowler.runsConceded})
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surge-500 to-sky-500 flex items-center justify-center font-display font-extrabold text-pitch-950 text-base shadow-lg shadow-surge-500/20">
              CST
            </div>
          </div>
        </div>

        {/* Crease snapshot: Batters & Bowler Mini Bar */}
        <div className="mt-3 pt-2.5 border-t border-pitch-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center space-x-3">
            <span className="text-slate-400 font-medium">Batting:</span>
            <span className="font-semibold text-white flex items-center">
              {match.striker.name}
              <span className="text-coral-400 ml-0.5">*</span>
              <span className="text-slate-400 font-normal ml-1">
                {match.striker.runs} ({match.striker.balls}b, {match.striker.fours}x4, {match.striker.sixes}x6)
              </span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">
              {match.nonStriker.name}{' '}
              <span className="text-slate-400 font-normal">
                {match.nonStriker.runs} ({match.nonStriker.balls}b)
              </span>
            </span>
          </div>

          {/* Momentum Indicator */}
          <div className="flex items-center space-x-2">
            {match.momentum === 'batting-surge' && (
              <motion.span
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-coral-500/20 text-coral-400 font-semibold border border-coral-500/30 text-[11px]"
              >
                <Flame className="w-3 h-3 animate-bounce" />
                <span>Batting Surge</span>
              </motion.span>
            )}
            {match.momentum === 'bowling-surge' && (
              <motion.span
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-surge-500/20 text-surge-400 font-semibold border border-surge-500/30 text-[11px]"
              >
                <Shield className="w-3 h-3" />
                <span>Bowling Clamp</span>
              </motion.span>
            )}
            {match.momentum === 'neutral' && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[11px]">
                <TrendingUp className="w-3 h-3" />
                <span>Even Contest</span>
              </span>
            )}
          </div>
        </div>

        {/* Win-Probability Spring Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-coral-400 flex items-center space-x-1">
              <span>Solar Flares: {flaresWinProb}%</span>
            </span>
            <span className="text-surge-400 flex items-center space-x-1">
              <span>Cyber Strikers: {strikersWinProb}%</span>
            </span>
          </div>
          <div className="w-full h-2.5 bg-pitch-800 rounded-full overflow-hidden flex shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-coral-500 to-amber-500 h-full rounded-l-full"
              initial={false}
              animate={{ width: `${flaresWinProb}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            />
            <motion.div
              className="bg-gradient-to-r from-teal-500 to-surge-500 h-full rounded-r-full"
              initial={false}
              animate={{ width: `${strikersWinProb}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
