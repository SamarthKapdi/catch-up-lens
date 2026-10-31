import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { useMatchStore } from '../store/useMatchStore';
import { HighlightMoment } from '../engine/types';

export const HighlightRail: React.FC = () => {
  const highlights = useMatchStore((state) => state.match.highlights);

  if (highlights.length === 0) {
    return (
      <div className="bg-pitch-900/60 rounded-2xl border border-pitch-800/80 p-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
          <Trophy className="w-4 h-4 text-slate-600" />
          <span>Big match moments will appear here as the chase unfolds</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-pitch-900 rounded-2xl border border-pitch-800 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="font-display font-bold text-white text-sm">Key Match Moments</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">{highlights.length} Moments</span>
      </div>

      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
        {highlights.map((h: HighlightMoment) => {
          let badgeStyle = 'bg-pitch-800 text-slate-300 border-pitch-700';
          if (h.type === 'wicket') {
            badgeStyle = 'bg-coral-500/20 text-coral-400 border-coral-500/40';
          } else if (h.type === 'six') {
            badgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
          } else if (h.type === 'four') {
            badgeStyle = 'bg-surge-500/20 text-surge-400 border-surge-500/40';
          } else if (h.type === 'dropped_catch') {
            badgeStyle = 'bg-purple-500/20 text-purple-400 border-purple-500/40';
          }

          return (
            <div
              key={h.id}
              className="flex-shrink-0 w-60 p-3 rounded-xl bg-pitch-850 border border-pitch-750 flex flex-col justify-between hover:border-pitch-650 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Over {h.overString}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeStyle}`}>
                    {h.badgeText}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1 leading-snug">{h.title}</h4>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                {h.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
