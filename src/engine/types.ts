export type WicketType = 'bowled' | 'caught' | 'lbw' | 'run out' | 'stumped';

export interface PlayerState {
  id: string;
  name: string;
  role: 'top-order' | 'middle-order' | 'finisher' | 'all-rounder' | 'bowler';
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissal?: string | undefined;
}

export interface BowlerState {
  id: string;
  name: string;
  style: 'Fast' | 'Pace' | 'Off-spin' | 'Leg-spin' | 'Left-arm seam';
  overs: number;
  ballsThisOver: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
}

export interface BallEvent {
  ballId: string;
  ballNumber: number; // 1 to 120
  overIndex: number; // 0 to 19
  ballInOver: number; // 1 to 6
  runsScored: number;
  isWicket: boolean;
  wicketType: WicketType | null;
  dismissedPlayer?: string;
  isBoundary: boolean;
  isFour: boolean;
  isSix: boolean;
  isDroppedCatch: boolean;
  strikerName: string;
  nonStrikerName: string;
  bowlerName: string;
  commentary: string;
  winProbBatting: number;
  milestone?: string;
  scoreAfterBall: {
    runs: number;
    wickets: number;
  };
}

export interface OverSummary {
  overNumber: number; // 1 to 20
  bowlerName: string;
  runsConceded: number;
  wicketsTaken: number;
  balls: BallEvent[];
  scoreAtEnd: string; // e.g. "124/3"
}

export interface HighlightMoment {
  id: string;
  type: 'six' | 'four' | 'wicket' | 'dropped_catch' | 'milestone' | 'nailbiter';
  title: string;
  description: string;
  ballNumber: number;
  overString: string; // e.g. "16.4"
  badgeText: string;
}

export interface TeamInfo {
  name: string;
  shortName: string;
  primaryColor: string;
  accentColor: string;
}

export interface MatchState {
  teamBatting: TeamInfo;
  teamBowling: TeamInfo;
  target: number;
  totalBalls: number;
  runs: number;
  wickets: number;
  ballsBowled: number;
  isMatchOver: boolean;
  result: string | null;
  striker: PlayerState;
  nonStriker: PlayerState;
  bowler: BowlerState;
  battingLineup: PlayerState[];
  bowlingLineup: BowlerState[];
  currentPartnership: {
    runs: number;
    balls: number;
  };
  history: BallEvent[];
  overSummaries: OverSummary[];
  highlights: HighlightMoment[];
  winProbability: number; // 0 to 100 for batting team
  momentum: 'batting-surge' | 'bowling-surge' | 'neutral';
  recentMomentumFactor: number; // -1 (bowling dominant) to +1 (batting dominant)
}

export type SummaryTone = 'simple' | 'nerd' | 'hinglish';

export interface CatchUpSummary {
  headline: string;
  happened: string; // strictly <= 45 words
  whyItMatters: string;
  watchNext: string;
  source: 'ai' | 'instant';
  tone: SummaryTone;
  missedBallsCount: number;
  missedRuns: number;
  missedWickets: number;
  winProbBefore: number;
  winProbAfter: number;
  keyEvents: BallEvent[];
}

export interface PredictionState {
  overNumber: number;
  runsRangeChoice: '0-5' | '6-9' | '10+' | null;
  wicketChoice: 'yes' | 'no' | null;
  crowdSplits: {
    runs: { '0-5': number; '6-9': number; '10+': number };
    wicket: { yes: number; no: number };
  };
  resolved: boolean;
  runsCorrect?: boolean;
  wicketCorrect?: boolean;
  fanIQGained?: number;
}
