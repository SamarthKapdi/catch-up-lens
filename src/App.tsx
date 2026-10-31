import React, { useState } from 'react';
import { BroadcastHeader } from './components/BroadcastHeader';
import { PitchVisualizer } from './components/PitchVisualizer';
import { PredictionCard } from './components/PredictionCard';
import { HighlightRail } from './components/HighlightRail';
import { FullScorecard } from './components/FullScorecard';
import { CatchUpSheet } from './components/CatchUpSheet';
import { FloatingReactions } from './components/FloatingReactions';
import { ActivityWatcher } from './components/ActivityWatcher';
import { Sparkles, Shield, Flame } from 'lucide-react';
import { useCatchUpStore } from './store/useCatchUpStore';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'predict' | 'scorecard'>('predict');
  const { openCatchUpSheet } = useCatchUpStore();

  return (
    <div className="min-h-screen bg-pitch-950 text-slate-100 flex flex-col font-sans selection:bg-coral-500 selection:text-white">
      {/* Background radial gradient glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,56,92,0.12),rgba(255,255,255,0))] -z-10" />

      {/* Hero Live Broadcast Sticky Header */}
      <BroadcastHeader />

      {/* Main Content Arena */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Subtle Dream11 Hiring Assignment Context Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-pitch-900/60 border border-pitch-800 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-coral-400" />
            <span className="font-semibold text-slate-300">Dream11 Second-Screen Prototype</span>
            <span className="text-slate-500">•</span>
            <span>Catch-Up Lens: AI artifact getting fans back into the match in 20 seconds</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-surge-400 font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>100% Free to Play • No Real Money • Fictional Teams</span>
          </div>
        </div>

        {/* 2-Column Responsive Layout (Mobile stacked, Desktop side-by-side) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (Main Stage: Visualizer & Rail) */}
          <section className="lg:col-span-7 space-y-6">
            <PitchVisualizer />
            <HighlightRail />
          </section>

          {/* Right Column (Engagement Hub: Predict, React & Scorecard) */}
          <section className="lg:col-span-5 space-y-4">
            {/* View Switcher Tabs */}
            <div className="flex p-1 bg-pitch-900 rounded-xl border border-pitch-800" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'predict'}
                onClick={() => setActiveTab('predict')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  activeTab === 'predict'
                    ? 'bg-pitch-800 text-coral-400 shadow-md border border-pitch-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-coral-400" />
                <span>React & Predict</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'scorecard'}
                onClick={() => setActiveTab('scorecard')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  activeTab === 'scorecard'
                    ? 'bg-pitch-800 text-surge-400 shadow-md border border-pitch-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-surge-400" />
                <span>Full Scorecard</span>
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'predict' ? <PredictionCard /> : <FullScorecard />}
          </section>
        </div>
      </main>

      {/* Floating CTA for Mobile Catch-Up Access */}
      <div className="sm:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={openCatchUpSheet}
          className="p-3.5 rounded-full bg-gradient-to-r from-coral-500 to-amber-500 text-white shadow-xl shadow-coral-500/40 flex items-center justify-center active:scale-90 transition"
          aria-label="Open Catch-Up Lens"
        >
          <Sparkles className="w-5 h-5 fill-white" />
        </button>
      </div>

      {/* Footer */}
      <footer className="w-full bg-pitch-950 border-t border-pitch-900 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-display font-bold text-slate-300">Catch-Up Lens</span>
            <span>—</span>
            <span>Never watch alone.</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Dream11 Forward Deployed Engineer Intern Assignment • Built with Gemini AI & Pure TypeScript
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <CatchUpSheet />
      <FloatingReactions />
      <ActivityWatcher />
    </div>
  );
};
export default App;
