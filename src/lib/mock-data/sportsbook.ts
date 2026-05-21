export type SportKey = 'NFL' | 'NBA' | 'MLB' | 'Soccer' | 'Tennis' | 'MMA' | 'Esports' | 'NHL';

export interface SBGame {
  id: number;
  sport: SportKey;
  league: string;
  home: string;
  homeAbbr: string;
  away: string;
  awayAbbr: string;
  time: string; // display time or live clock
  isLive: boolean;
  liveLabel?: string; // e.g. "Q3 8:42", "68'"
  homeScore?: number;
  awayScore?: number;
  spread: { line: number; homeOdds: number; awayOdds: number }; // line is home spread
  moneyline: { home: number; away: number };
  total: { line: number; overOdds: number; underOdds: number };
  isFeatured?: boolean;
}

export const SPORTSBOOK_GAMES: SBGame[] = [
  // ── NFL ─────────────────────────────────────────────
  {
    id: 1, sport: 'NFL', league: 'NFL · Week 14',
    home: 'Kansas City Chiefs', homeAbbr: 'KC',
    away: 'Philadelphia Eagles', awayAbbr: 'PHI',
    time: 'Sun 4:25 PM ET', isLive: false,
    spread: { line: -3.5, homeOdds: -110, awayOdds: -110 },
    moneyline: { home: -168, away: +142 },
    total: { line: 47.5, overOdds: -110, underOdds: -110 },
    isFeatured: true,
  },
  {
    id: 2, sport: 'NFL', league: 'NFL · Week 14',
    home: 'San Francisco 49ers', homeAbbr: 'SF',
    away: 'Dallas Cowboys', awayAbbr: 'DAL',
    time: 'Sun 8:20 PM ET', isLive: false,
    spread: { line: -6.5, homeOdds: -110, awayOdds: -110 },
    moneyline: { home: -260, away: +215 },
    total: { line: 44.5, overOdds: -110, underOdds: -110 },
  },
  {
    id: 3, sport: 'NFL', league: 'NFL · Week 14',
    home: 'Buffalo Bills', homeAbbr: 'BUF',
    away: 'Miami Dolphins', awayAbbr: 'MIA',
    time: 'Sun 1:00 PM ET', isLive: true, liveLabel: 'Q2 4:12',
    homeScore: 14, awayScore: 10,
    spread: { line: -4.5, homeOdds: -115, awayOdds: -105 },
    moneyline: { home: -205, away: +172 },
    total: { line: 49.5, overOdds: -105, underOdds: -115 },
  },
  {
    id: 4, sport: 'NFL', league: 'NFL · Week 14',
    home: 'Detroit Lions', homeAbbr: 'DET',
    away: 'Green Bay Packers', awayAbbr: 'GB',
    time: 'Thu 8:15 PM ET', isLive: true, liveLabel: 'Q4 2:34',
    homeScore: 28, awayScore: 24,
    spread: { line: -2.5, homeOdds: -110, awayOdds: -110 },
    moneyline: { home: -142, away: +120 },
    total: { line: 52.5, overOdds: -110, underOdds: -110 },
  },

  // ── NBA ─────────────────────────────────────────────
  {
    id: 5, sport: 'NBA', league: 'NBA · Regular Season',
    home: 'Los Angeles Lakers', homeAbbr: 'LAL',
    away: 'Boston Celtics', awayAbbr: 'BOS',
    time: 'Tonight 7:30 PM ET', isLive: true, liveLabel: 'Q3 5:18',
    homeScore: 87, awayScore: 82,
    spread: { line: +1.5, homeOdds: -110, awayOdds: -110 },
    moneyline: { home: +105, away: -125 },
    total: { line: 218.5, overOdds: -115, underOdds: -105 },
    isFeatured: true,
  },
  {
    id: 6, sport: 'NBA', league: 'NBA · Regular Season',
    home: 'Golden State Warriors', homeAbbr: 'GSW',
    away: 'Denver Nuggets', awayAbbr: 'DEN',
    time: 'Tonight 10:00 PM ET', isLive: false,
    spread: { line: +2.5, homeOdds: -110, awayOdds: -110 },
    moneyline: { home: +118, away: -138 },
    total: { line: 224.5, overOdds: -110, underOdds: -110 },
  },
  {
    id: 7, sport: 'NBA', league: 'NBA · Regular Season',
    home: 'Miami Heat', homeAbbr: 'MIA',
    away: 'New York Knicks', awayAbbr: 'NYK',
    time: 'Tomorrow 7:00 PM ET', isLive: false,
    spread: { line: -1.5, homeOdds: -115, awayOdds: -105 },
    moneyline: { home: -128, away: +108 },
    total: { line: 210.5, overOdds: -110, underOdds: -110 },
  },

  // ── Soccer ──────────────────────────────────────────
  {
    id: 8, sport: 'Soccer', league: 'UEFA Champions League',
    home: 'Real Madrid', homeAbbr: 'RMA',
    away: 'Manchester City', awayAbbr: 'MCI',
    time: 'Wed 3:00 PM ET', isLive: true, liveLabel: "62'",
    homeScore: 1, awayScore: 1,
    spread: { line: -0.5, homeOdds: -125, awayOdds: +105 },
    moneyline: { home: +175, away: +190 },
    total: { line: 2.5, overOdds: -145, underOdds: +120 },
    isFeatured: true,
  },
  {
    id: 9, sport: 'Soccer', league: 'Premier League',
    home: 'Arsenal', homeAbbr: 'ARS',
    away: 'Liverpool', awayAbbr: 'LIV',
    time: 'Sat 12:30 PM ET', isLive: false,
    spread: { line: +0.5, homeOdds: -110, awayOdds: -110 },
    moneyline: { home: +185, away: +145 },
    total: { line: 2.5, overOdds: -130, underOdds: +110 },
  },
  {
    id: 10, sport: 'Soccer', league: 'La Liga',
    home: 'Barcelona', homeAbbr: 'BAR',
    away: 'Atletico Madrid', awayAbbr: 'ATM',
    time: 'Sun 10:15 AM ET', isLive: false,
    spread: { line: -1.5, homeOdds: +115, awayOdds: -135 },
    moneyline: { home: -110, away: +290 },
    total: { line: 2.5, overOdds: -140, underOdds: +118 },
  },

  // ── Tennis ──────────────────────────────────────────
  {
    id: 11, sport: 'Tennis', league: 'ATP Finals',
    home: 'Carlos Alcaraz', homeAbbr: 'ALC',
    away: 'Novak Djokovic', awayAbbr: 'DJO',
    time: 'Today 1:00 PM ET', isLive: true, liveLabel: 'Set 2 · 3-2',
    homeScore: 1, awayScore: 0,
    spread: { line: -1.5, homeOdds: +160, awayOdds: -195 },
    moneyline: { home: -140, away: +118 },
    total: { line: 3.5, overOdds: -150, underOdds: +125 },
  },
  {
    id: 12, sport: 'Tennis', league: 'ATP Finals',
    home: 'Jannik Sinner', homeAbbr: 'SIN',
    away: 'Daniil Medvedev', awayAbbr: 'MED',
    time: 'Today 4:00 PM ET', isLive: false,
    spread: { line: -1.5, homeOdds: -140, awayOdds: +115 },
    moneyline: { home: -195, away: +162 },
    total: { line: 3.5, overOdds: -130, underOdds: +108 },
  },

  // ── MMA ─────────────────────────────────────────────
  {
    id: 13, sport: 'MMA', league: 'UFC 309 · Main Card',
    home: 'Jon Jones', homeAbbr: 'JON',
    away: 'Stipe Miocic', awayAbbr: 'STI',
    time: 'Sat 10:00 PM ET', isLive: false,
    spread: { line: -1.5, homeOdds: -195, awayOdds: +160 },
    moneyline: { home: -420, away: +335 },
    total: { line: 2.5, overOdds: -110, underOdds: -110 },
    isFeatured: true,
  },
  {
    id: 14, sport: 'MMA', league: 'UFC 309 · Co-Main',
    home: 'Bo Nickal', homeAbbr: 'BON',
    away: 'Paul Craig', awayAbbr: 'CRA',
    time: 'Sat 9:00 PM ET', isLive: false,
    spread: { line: -1.5, homeOdds: -245, awayOdds: +195 },
    moneyline: { home: -650, away: +480 },
    total: { line: 2.5, overOdds: +140, underOdds: -165 },
  },

  // ── Esports ─────────────────────────────────────────
  {
    id: 15, sport: 'Esports', league: 'CS2 · IEM Katowice',
    home: 'Team Liquid', homeAbbr: 'LIQ',
    away: 'Natus Vincere', awayAbbr: 'NaVi',
    time: 'Fri 8:00 PM ET', isLive: false,
    spread: { line: -1.5, homeOdds: +125, awayOdds: -148 },
    moneyline: { home: +105, away: -125 },
    total: { line: 2.5, overOdds: -115, underOdds: -105 },
  },
  {
    id: 16, sport: 'Esports', league: 'League of Legends · Worlds',
    home: 'T1', homeAbbr: 'T1',
    away: 'Gen.G', awayAbbr: 'GEN',
    time: 'Sat 6:00 AM ET', isLive: false,
    spread: { line: -1.5, homeOdds: -175, awayOdds: +148 },
    moneyline: { home: -270, away: +220 },
    total: { line: 3.5, overOdds: -130, underOdds: +108 },
  },

  // ── NHL ─────────────────────────────────────────────
  {
    id: 17, sport: 'NHL', league: 'NHL · Regular Season',
    home: 'Toronto Maple Leafs', homeAbbr: 'TOR',
    away: 'Montreal Canadiens', awayAbbr: 'MTL',
    time: 'Tonight 7:00 PM ET', isLive: true, liveLabel: 'P2 12:44',
    homeScore: 2, awayScore: 1,
    spread: { line: -1.5, homeOdds: +130, awayOdds: -152 },
    moneyline: { home: -175, away: +148 },
    total: { line: 5.5, overOdds: -110, underOdds: -110 },
  },
];

export const SPORT_TABS: { key: SportKey | 'All'; label: string; emoji: string }[] = [
  { key: 'All', label: 'All Sports', emoji: '🏆' },
  { key: 'NFL', label: 'NFL', emoji: '🏈' },
  { key: 'NBA', label: 'NBA', emoji: '🏀' },
  { key: 'NHL', label: 'NHL', emoji: '🏒' },
  { key: 'MLB', label: 'MLB', emoji: '⚾' },
  { key: 'Soccer', label: 'Soccer', emoji: '⚽' },
  { key: 'Tennis', label: 'Tennis', emoji: '🎾' },
  { key: 'MMA', label: 'MMA', emoji: '🥊' },
  { key: 'Esports', label: 'Esports', emoji: '🎮' },
];
