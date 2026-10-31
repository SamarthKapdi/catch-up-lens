import React from 'react';
import { useMatchStore } from '../store/useMatchStore';
import { Shield } from 'lucide-react';

export const FullScorecard: React.FC = () => {
  const match = useMatchStore((state) => state.match);

  return (
    <div className="bg-pitch-900 rounded-2xl border border-pitch-800 p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-pitch-800 pb-3 mb-3">
        <h3 className="font-display font-bold text-white text-sm flex items-center space-x-2">
          <Shield className="w-4 h-4 text-coral-400" />
          <span>Match Scorecard • {match.teamBatting.name} Chase</span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {match.runs}/{match.wickets} in {Math.floor(match.ballsBowled / 6)}.{match.ballsBowled % 6} ov
        </span>
      </div>

      {/* Batting Table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-pitch-800">
              <th className="py-1.5 font-semibold">Batter</th>
              <th className="py-1.5 font-semibold text-right">R</th>
              <th className="py-1.5 font-semibold text-right">B</th>
              <th className="py-1.5 font-semibold text-right">4s</th>
              <th className="py-1.5 font-semibold text-right">6s</th>
              <th className="py-1.5 font-semibold text-right">SR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pitch-850">
            {match.battingLineup.map((player) => {
              const isStriker = match.striker.id === player.id;
              const isNonStriker = match.nonStriker.id === player.id;
              const isCurrent = isStriker || isNonStriker;

              const sr = player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(0) : '-';

              return (
                <tr key={player.id} className={isCurrent ? 'bg-coral-500/10 text-white font-medium' : 'text-slate-300'}>
                  <td className="py-1.5 pr-2">
                    <div className="flex items-center space-x-1">
                      <span>{player.name}</span>
                      {isStriker && <span className="text-coral-400 font-bold">*</span>}
                    </div>
                    {player.isOut && (
                      <span className="text-[10px] text-slate-500 block">{player.dismissal}</span>
                    )}
                  </td>
                  <td className="py-1.5 text-right font-bold text-white">{player.runs}</td>
                  <td className="py-1.5 text-right text-slate-400">{player.balls}</td>
                  <td className="py-1.5 text-right text-slate-400">{player.fours}</td>
                  <td className="py-1.5 text-right text-slate-400">{player.sixes}</td>
                  <td className="py-1.5 text-right text-slate-400">{sr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bowling Table */}
      <div className="overflow-x-auto pt-2 border-t border-pitch-800">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-pitch-800">
              <th className="py-1.5 font-semibold">Bowler</th>
              <th className="py-1.5 font-semibold text-right">O</th>
              <th className="py-1.5 font-semibold text-right">M</th>
              <th className="py-1.5 font-semibold text-right">R</th>
              <th className="py-1.5 font-semibold text-right">W</th>
              <th className="py-1.5 font-semibold text-right">Econ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pitch-850">
            {match.bowlingLineup.map((bowler) => {
              const isCurrentBowler = match.bowler.id === bowler.id;
              const oversBowled = `${Math.floor(bowler.ballsThisOver / 6)}.${bowler.ballsThisOver % 6}`;

              return (
                <tr key={bowler.id} className={isCurrentBowler ? 'bg-surge-500/10 text-white font-medium' : 'text-slate-300'}>
                  <td className="py-1.5 pr-2">
                    <div className="flex items-center space-x-1">
                      <span>{bowler.name}</span>
                      {isCurrentBowler && <span className="text-surge-400 font-bold">●</span>}
                    </div>
                    <span className="text-[10px] text-slate-500 block">{bowler.style}</span>
                  </td>
                  <td className="py-1.5 text-right text-slate-300">{oversBowled}</td>
                  <td className="py-1.5 text-right text-slate-400">{bowler.maidens}</td>
                  <td className="py-1.5 text-right font-bold text-white">{bowler.runsConceded}</td>
                  <td className="py-1.5 text-right font-bold text-coral-400">{bowler.wickets}</td>
                  <td className="py-1.5 text-right text-slate-400">{bowler.economy}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
