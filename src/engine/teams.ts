import { PlayerState, BowlerState, TeamInfo } from './types';

export const SOLAR_FLARES: TeamInfo = {
  name: 'Solar Flares',
  shortName: 'SFL',
  primaryColor: '#FF385C',
  accentColor: '#FFB800',
};

export const CYBER_STRIKERS: TeamInfo = {
  name: 'Cyber Strikers',
  shortName: 'CST',
  primaryColor: '#00D688',
  accentColor: '#0EA5E9',
};

export function getInitialBattingLineup(): PlayerState[] {
  return [
    { id: 'bat-1', name: 'Dexter Drake', role: 'top-order', runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
    { id: 'bat-2', name: 'Ronin Vance', role: 'top-order', runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
    { id: 'bat-3', name: 'Leo Sterling (C)', role: 'middle-order', runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
    { id: 'bat-4', name: 'Jaxom Frost', role: 'middle-order', runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
    { id: 'bat-5', name: 'Kaelan Cruz', role: 'finisher', runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
    { id: 'bat-6', name: 'Zephyr Holt', role: 'all-rounder', runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
    { id: 'bat-7', name: 'Tyson Blade', role: 'all-rounder', runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
    { id: 'bat-8', name: 'Milo Thorne', role: 'bowler', runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
    { id: 'bat-9', name: 'Dash Wilder', role: 'bowler', runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
    { id: 'bat-10', name: 'Orion Vance', role: 'bowler', runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
    { id: 'bat-11', name: 'Echo Raine', role: 'bowler', runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
  ];
}

export function getInitialBowlingLineup(): BowlerState[] {
  return [
    { id: 'bowl-1', name: 'Rex Mercer', style: 'Fast', overs: 0, ballsThisOver: 0, maidens: 0, runsConceded: 0, wickets: 0, economy: 0 },
    { id: 'bowl-2', name: 'Damon Cross', style: 'Left-arm seam', overs: 0, ballsThisOver: 0, maidens: 0, runsConceded: 0, wickets: 0, economy: 0 },
    { id: 'bowl-3', name: 'Blaze Nolan', style: 'Off-spin', overs: 0, ballsThisOver: 0, maidens: 0, runsConceded: 0, wickets: 0, economy: 0 },
    { id: 'bowl-4', name: 'Kage Aris', style: 'Leg-spin', overs: 0, ballsThisOver: 0, maidens: 0, runsConceded: 0, wickets: 0, economy: 0 },
    { id: 'bowl-5', name: 'Silas Reed', style: 'Pace', overs: 0, ballsThisOver: 0, maidens: 0, runsConceded: 0, wickets: 0, economy: 0 },
  ];
}
