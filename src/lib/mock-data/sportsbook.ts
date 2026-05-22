export type SportKey = 'NFL' | 'NBA' | 'MLB' | 'Soccer' | 'Tennis' | 'MMA' | 'Esports' | 'NHL';

export interface SBGame {
  id: number;
  sport: SportKey;
  league: string;
  home: string;
  homeAbbr: string;
  homeLogo?: string; // ESPN CDN or emoji
  away: string;
  awayAbbr: string;
  awayLogo?: string;
  time: string;
  isLive: boolean;
  liveLabel?: string;
  homeScore?: number;
  awayScore?: number;
  spread: { line: number; homeOdds: number; awayOdds: number };
  moneyline: { home: number; away: number };
  total: { line: number; overOdds: number; underOdds: number };
  isFeatured?: boolean;
  betCount?: number; // "N people bet this"
  oddsMovement?: { spreadHome?: 'up' | 'down'; spreadAway?: 'up' | 'down'; mlHome?: 'up' | 'down'; mlAway?: 'up' | 'down'; totalOver?: 'up' | 'down'; totalUnder?: 'up' | 'down' };
  hasBestOdds?: boolean;
}

export interface PlayerProp {
  id: number;
  sport: SportKey;
  league: string;
  player: string;
  team: string;
  teamAbbr: string;
  avatarUrl?: string; // ESPN or initials fallback
  stat: string;
  line: number;
  overOdds: number;
  underOdds: number;
  isFeatured?: boolean;
  betCount?: number;
}

export interface ParlayLeg {
  label: string;
  game: string;
  odds: number;
}

export interface CreatorParlay {
  id: number;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string; // initials
  creatorAvatarColor: string;
  title: string;
  legs: ParlayLeg[];
  totalOdds: number; // American odds
  record: string; // e.g. "12-4 last 30 days"
  badge?: string; // e.g. "Hot Streak"
}

// ── ESPN CDN helper
function nflLogo(abbr: string) { return `https://a.espncdn.com/i/teamlogos/nfl/500-dark/${abbr.toLowerCase()}.png`; }
function nbaLogo(abbr: string) { return `https://a.espncdn.com/i/teamlogos/nba/500-dark/${abbr.toLowerCase()}.png`; }
function nhlLogo(abbr: string) { return `https://a.espncdn.com/i/teamlogos/nhl/500-dark/${abbr.toLowerCase()}.png`; }
function mlbLogo(abbr: string) { return `https://a.espncdn.com/i/teamlogos/mlb/500-dark/${abbr.toLowerCase()}.png`; }

export const SPORTSBOOK_GAMES: SBGame[] = [
  // ── NFL ─────────────────────────────────────────────
  {
    id: 1, sport: 'NFL', league: 'NFL · Week 14',
    home: 'Kansas City Chiefs', homeAbbr: 'KC', homeLogo: nflLogo('kc'),
    away: 'Philadelphia Eagles', awayAbbr: 'PHI', awayLogo: nflLogo('phi'),
    time: 'Sun 4:25 PM ET', isLive: false,
    spread: { line: -3.5, homeOdds: -110, awayOdds: -110 },
    moneyline: { home: -168, away: +142 },
    total: { line: 47.5, overOdds: -110, underOdds: -110 },
    isFeatured: true,
    betCount: 4821,
    oddsMovement: { mlHome: 'down', mlAway: 'up' },
    hasBestOdds: true,
  },
  {
    id: 2, sport: 'NFL', league: 'NFL · Week 14',
    home: 'San Francisco 49ers', homeAbbr: 'SF', homeLogo: nflLogo('sf'),
    away: 'Dallas Cowboys', awayAbbr: 'DAL', awayLogo: nflLogo('dal'),
    time: 'Sun 8:20 PM ET', isLive: false,
    spread: { line: -6.5, homeOdds: -110, awayOdds: -110 },
    moneyline: { home: -260, away: +215 },
    total: { line: 44.5, overOdds: -110, underOdds: -110 },
    betCount: 2103,
    oddsMovement: { spreadHome: 'up' },
  },
  {
    id: 3, sport: 'NFL', league: 'NFL · Week 14',
    home: 'Buffalo Bills', homeAbbr: 'BUF', homeLogo: nflLogo('buf'),
    away: 'Miami Dolphins', awayAbbr: 'MIA', awayLogo: nflLogo('mia'),
    time: 'Sun 1:00 PM ET', isLive: true, liveLabel: 'Q2 4:12',
    homeScore: 14, awayScore: 10,
    spread: { line: -4.5, homeOdds: -115, awayOdds: -105 },
    moneyline: { home: -205, away: +172 },
    total: { line: 49.5, overOdds: -105, underOdds: -115 },
    betCount: 6344,
    oddsMovement: { totalOver: 'up', mlHome: 'down' },
  },
  {
    id: 4, sport: 'NFL', league: 'NFL · Week 14',
    home: 'Detroit Lions', homeAbbr: 'DET', homeLogo: nflLogo('det'),
    away: 'Green Bay Packers', awayAbbr: 'GB', awayLogo: nflLogo('gb'),
    time: 'Thu 8:15 PM ET', isLive: true, liveLabel: 'Q4 2:34',
    homeScore: 28, awayScore: 24,
    spread: { line: -2.5, homeOdds: -110, awayOdds: -110 },
    moneyline: { home: -142, away: +120 },
    total: { line: 52.5, overOdds: -110, underOdds: -110 },
    betCount: 8901,
    oddsMovement: { mlHome: 'up', mlAway: 'down' },
    hasBestOdds: true,
  },

  // ── NBA ─────────────────────────────────────────────
  {
    id: 5, sport: 'NBA', league: 'NBA · Regular Season',
    home: 'Los Angeles Lakers', homeAbbr: 'LAL', homeLogo: nbaLogo('lal'),
    away: 'Boston Celtics', awayAbbr: 'BOS', awayLogo: nbaLogo('bos'),
    time: 'Tonight 7:30 PM ET', isLive: true, liveLabel: 'Q3 5:18',
    homeScore: 87, awayScore: 82,
    spread: { line: +1.5, homeOdds: -110, awayOdds: -110 },
    moneyline: { home: +105, away: -125 },
    total: { line: 218.5, overOdds: -115, underOdds: -105 },
    isFeatured: true,
    betCount: 11240,
    oddsMovement: { mlHome: 'up', totalOver: 'up' },
    hasBestOdds: true,
  },
  {
    id: 6, sport: 'NBA', league: 'NBA · Regular Season',
    home: 'Golden State Warriors', homeAbbr: 'GSW', homeLogo: nbaLogo('gs'),
    away: 'Denver Nuggets', awayAbbr: 'DEN', awayLogo: nbaLogo('den'),
    time: 'Tonight 10:00 PM ET', isLive: false,
    spread: { line: +2.5, homeOdds: -110, awayOdds: -110 },
    moneyline: { home: +118, away: -138 },
    total: { line: 224.5, overOdds: -110, underOdds: -110 },
    betCount: 3421,
    oddsMovement: { mlAway: 'up' },
  },
  {
    id: 7, sport: 'NBA', league: 'NBA · Regular Season',
    home: 'Miami Heat', homeAbbr: 'MIA', homeLogo: nbaLogo('mia'),
    away: 'New York Knicks', awayAbbr: 'NYK', awayLogo: nbaLogo('ny'),
    time: 'Tomorrow 7:00 PM ET', isLive: false,
    spread: { line: -1.5, homeOdds: -115, awayOdds: -105 },
    moneyline: { home: -128, away: +108 },
    total: { line: 210.5, overOdds: -110, underOdds: -110 },
    betCount: 1892,
  },

  // ── Soccer ──────────────────────────────────────────
  {
    id: 8, sport: 'Soccer', league: 'UEFA Champions League',
    home: 'Real Madrid', homeAbbr: 'RMA', homeLogo: '🇪🇸',
    away: 'Manchester City', awayAbbr: 'MCI', awayLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    time: 'Wed 3:00 PM ET', isLive: true, liveLabel: "62'",
    homeScore: 1, awayScore: 1,
    spread: { line: -0.5, homeOdds: -125, awayOdds: +105 },
    moneyline: { home: +175, away: +190 },
    total: { line: 2.5, overOdds: -145, underOdds: +120 },
    isFeatured: true,
    betCount: 15632,
    oddsMovement: { mlHome: 'up', mlAway: 'up' },
    hasBestOdds: true,
  },
  {
    id: 9, sport: 'Soccer', league: 'Premier League',
    home: 'Arsenal', homeAbbr: 'ARS', homeLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    away: 'Liverpool', awayAbbr: 'LIV', awayLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    time: 'Sat 12:30 PM ET', isLive: false,
    spread: { line: +0.5, homeOdds: -110, awayOdds: -110 },
    moneyline: { home: +185, away: +145 },
    total: { line: 2.5, overOdds: -130, underOdds: +110 },
    betCount: 7821,
    oddsMovement: { mlAway: 'down' },
  },
  {
    id: 10, sport: 'Soccer', league: 'La Liga',
    home: 'Barcelona', homeAbbr: 'BAR', homeLogo: '🇪🇸',
    away: 'Atletico Madrid', awayAbbr: 'ATM', awayLogo: '🇪🇸',
    time: 'Sun 10:15 AM ET', isLive: false,
    spread: { line: -1.5, homeOdds: +115, awayOdds: -135 },
    moneyline: { home: -110, away: +290 },
    total: { line: 2.5, overOdds: -140, underOdds: +118 },
    betCount: 4219,
  },

  // ── Tennis ──────────────────────────────────────────
  {
    id: 11, sport: 'Tennis', league: 'ATP Finals',
    home: 'Carlos Alcaraz', homeAbbr: 'CA', homeLogo: undefined,
    away: 'Novak Djokovic', awayAbbr: 'ND', awayLogo: undefined,
    time: 'Today 1:00 PM ET', isLive: true, liveLabel: 'Set 2 · 3-2',
    homeScore: 1, awayScore: 0,
    spread: { line: -1.5, homeOdds: +160, awayOdds: -195 },
    moneyline: { home: -140, away: +118 },
    total: { line: 3.5, overOdds: -150, underOdds: +125 },
    betCount: 3104,
    oddsMovement: { mlHome: 'down' },
  },
  {
    id: 12, sport: 'Tennis', league: 'ATP Finals',
    home: 'Jannik Sinner', homeAbbr: 'JS', homeLogo: undefined,
    away: 'Daniil Medvedev', awayAbbr: 'DM', awayLogo: undefined,
    time: 'Today 4:00 PM ET', isLive: false,
    spread: { line: -1.5, homeOdds: -140, awayOdds: +115 },
    moneyline: { home: -195, away: +162 },
    total: { line: 3.5, overOdds: -130, underOdds: +108 },
    betCount: 1840,
  },

  // ── MMA ─────────────────────────────────────────────
  {
    id: 13, sport: 'MMA', league: 'UFC 309 · Main Card',
    home: 'Jon Jones', homeAbbr: 'JJ', homeLogo: undefined,
    away: 'Stipe Miocic', awayAbbr: 'SM', awayLogo: undefined,
    time: 'Sat 10:00 PM ET', isLive: false,
    spread: { line: -1.5, homeOdds: -195, awayOdds: +160 },
    moneyline: { home: -420, away: +335 },
    total: { line: 2.5, overOdds: -110, underOdds: -110 },
    isFeatured: true,
    betCount: 9214,
    oddsMovement: { mlHome: 'down', mlAway: 'up' },
    hasBestOdds: true,
  },
  {
    id: 14, sport: 'MMA', league: 'UFC 309 · Co-Main',
    home: 'Bo Nickal', homeAbbr: 'BN', homeLogo: undefined,
    away: 'Paul Craig', awayAbbr: 'PC', awayLogo: undefined,
    time: 'Sat 9:00 PM ET', isLive: false,
    spread: { line: -1.5, homeOdds: -245, awayOdds: +195 },
    moneyline: { home: -650, away: +480 },
    total: { line: 2.5, overOdds: +140, underOdds: -165 },
    betCount: 3821,
  },

  // ── Esports ─────────────────────────────────────────
  {
    id: 15, sport: 'Esports', league: 'CS2 · IEM Katowice',
    home: 'Team Liquid', homeAbbr: 'LIQ', homeLogo: undefined,
    away: 'Natus Vincere', awayAbbr: 'NaV', awayLogo: undefined,
    time: 'Fri 8:00 PM ET', isLive: false,
    spread: { line: -1.5, homeOdds: +125, awayOdds: -148 },
    moneyline: { home: +105, away: -125 },
    total: { line: 2.5, overOdds: -115, underOdds: -105 },
    betCount: 2134,
  },
  {
    id: 16, sport: 'Esports', league: 'League of Legends · Worlds',
    home: 'T1', homeAbbr: 'T1', homeLogo: undefined,
    away: 'Gen.G', awayAbbr: 'GNG', awayLogo: undefined,
    time: 'Sat 6:00 AM ET', isLive: false,
    spread: { line: -1.5, homeOdds: -175, awayOdds: +148 },
    moneyline: { home: -270, away: +220 },
    total: { line: 3.5, overOdds: -130, underOdds: +108 },
    betCount: 1623,
  },

  // ── NHL ─────────────────────────────────────────────
  {
    id: 17, sport: 'NHL', league: 'NHL · Regular Season',
    home: 'Toronto Maple Leafs', homeAbbr: 'TOR', homeLogo: nhlLogo('tor'),
    away: 'Montreal Canadiens', awayAbbr: 'MTL', awayLogo: nhlLogo('mtl'),
    time: 'Tonight 7:00 PM ET', isLive: true, liveLabel: 'P2 12:44',
    homeScore: 2, awayScore: 1,
    spread: { line: -1.5, homeOdds: +130, awayOdds: -152 },
    moneyline: { home: -175, away: +148 },
    total: { line: 5.5, overOdds: -110, underOdds: -110 },
    betCount: 4102,
    oddsMovement: { mlHome: 'up' },
  },
  {
    id: 18, sport: 'NHL', league: 'NHL · Regular Season',
    home: 'Colorado Avalanche', homeAbbr: 'COL', homeLogo: nhlLogo('col'),
    away: 'Vegas Golden Knights', awayAbbr: 'VGK', awayLogo: nhlLogo('vgk'),
    time: 'Tonight 9:00 PM ET', isLive: false,
    spread: { line: -1.5, homeOdds: -115, awayOdds: -105 },
    moneyline: { home: -145, away: +122 },
    total: { line: 6.0, overOdds: -120, underOdds: -100 },
    betCount: 2811,
    oddsMovement: { totalOver: 'up' },
  },
];

// ── Player Props ────────────────────────────────────────────────────────────
export const PLAYER_PROPS: PlayerProp[] = [
  {
    id: 101, sport: 'NFL', league: 'NFL · Week 14',
    player: 'Patrick Mahomes', team: 'Kansas City Chiefs', teamAbbr: 'KC',
    stat: 'Passing Yards', line: 285.5,
    overOdds: -115, underOdds: -105,
    isFeatured: true, betCount: 5821,
  },
  {
    id: 102, sport: 'NFL', league: 'NFL · Week 14',
    player: 'Jalen Hurts', team: 'Philadelphia Eagles', teamAbbr: 'PHI',
    stat: 'Rushing Yards', line: 42.5,
    overOdds: -120, underOdds: -100,
    betCount: 3102,
  },
  {
    id: 103, sport: 'NFL', league: 'NFL · Week 14',
    player: 'Josh Allen', team: 'Buffalo Bills', teamAbbr: 'BUF',
    stat: 'Passing TDs', line: 1.5,
    overOdds: -150, underOdds: +128,
    betCount: 4421,
  },
  {
    id: 104, sport: 'NBA', league: 'NBA · Regular Season',
    player: 'LeBron James', team: 'Los Angeles Lakers', teamAbbr: 'LAL',
    stat: 'Points', line: 27.5,
    overOdds: -110, underOdds: -110,
    isFeatured: true, betCount: 8934,
  },
  {
    id: 105, sport: 'NBA', league: 'NBA · Regular Season',
    player: 'Jayson Tatum', team: 'Boston Celtics', teamAbbr: 'BOS',
    stat: 'Points + Rebounds', line: 35.5,
    overOdds: -118, underOdds: -102,
    betCount: 4201,
  },
  {
    id: 106, sport: 'NBA', league: 'NBA · Regular Season',
    player: 'Nikola Jokic', team: 'Denver Nuggets', teamAbbr: 'DEN',
    stat: 'Rebounds', line: 12.5,
    overOdds: -125, underOdds: +104,
    betCount: 3812,
  },
  {
    id: 107, sport: 'Soccer', league: 'UEFA Champions League',
    player: 'Erling Haaland', team: 'Manchester City', teamAbbr: 'MCI',
    stat: 'To Score Anytime', line: 0.5,
    overOdds: +140, underOdds: -170,
    isFeatured: true, betCount: 11203,
  },
  {
    id: 108, sport: 'Soccer', league: 'UEFA Champions League',
    player: 'Vinicius Jr.', team: 'Real Madrid', teamAbbr: 'RMA',
    stat: 'Shots on Target', line: 1.5,
    overOdds: -130, underOdds: +108,
    betCount: 5644,
  },
  {
    id: 109, sport: 'NHL', league: 'NHL · Regular Season',
    player: 'Auston Matthews', team: 'Toronto Maple Leafs', teamAbbr: 'TOR',
    stat: 'Points', line: 0.5,
    overOdds: -165, underOdds: +138,
    betCount: 2901,
  },
  {
    id: 110, sport: 'MMA', league: 'UFC 309 · Main Card',
    player: 'Jon Jones', team: 'UFC Heavyweight', teamAbbr: 'JJ',
    stat: 'Win by KO/TKO', line: 0.5,
    overOdds: +105, underOdds: -125,
    betCount: 7321,
  },
];

// ── Creator Parlays ─────────────────────────────────────────────────────────
export const CREATOR_PARLAYS: CreatorParlay[] = [
  {
    id: 201,
    creatorName: 'DuneKing',
    creatorHandle: '@duneking',
    creatorAvatar: 'DK',
    creatorAvatarColor: 'linear-gradient(135deg, #F0B232, #FF6B35)',
    title: "Sunday Special",
    legs: [
      { label: 'Chiefs -3.5', game: 'KC vs PHI', odds: -110 },
      { label: 'Lakers ML', game: 'LAL vs BOS', odds: +105 },
      { label: 'O 47.5 (KC/PHI)', game: 'KC vs PHI', odds: -110 },
    ],
    totalOdds: +650,
    record: '12-4 last 30 days',
    badge: 'Hot Streak',
  },
  {
    id: 202,
    creatorName: 'OasisBets',
    creatorHandle: '@oasisbets',
    creatorAvatar: 'OB',
    creatorAvatarColor: 'linear-gradient(135deg, #2DC97A, #0EA5E9)',
    title: "Prime Pick",
    legs: [
      { label: 'Mahomes O 285.5 Yds', game: 'KC vs PHI', odds: -115 },
      { label: 'Haaland Anytime Scorer', game: 'MCI vs RMA', odds: +140 },
    ],
    totalOdds: +285,
    record: '8-2 last 14 days',
    badge: 'Trending',
  },
  {
    id: 203,
    creatorName: 'DesertSharps',
    creatorHandle: '@desertsharps',
    creatorAvatar: 'DS',
    creatorAvatarColor: 'linear-gradient(135deg, #9333EA, #F0B232)',
    title: "MMA + NBA Bomb",
    legs: [
      { label: 'Jones ML (-420)', game: 'Jones vs Miocic', odds: -420 },
      { label: 'BOS ML', game: 'LAL vs BOS', odds: -125 },
      { label: 'LeBron O 27.5 Pts', game: 'LAL vs BOS', odds: -110 },
      { label: 'O 218.5 (LAL/BOS)', game: 'LAL vs BOS', odds: -115 },
    ],
    totalOdds: +880,
    record: '5-7 last 14 days',
  },
  {
    id: 204,
    creatorName: 'NightOwlBets',
    creatorHandle: '@nightowlbets',
    creatorAvatar: 'NO',
    creatorAvatarColor: 'linear-gradient(135deg, #1E40AF, #2DC97A)',
    title: "Late Night Lock",
    legs: [
      { label: 'Warriors +2.5', game: 'GSW vs DEN', odds: -110 },
      { label: 'DEN ML', game: 'GSW vs DEN', odds: -138 },
    ],
    totalOdds: +172,
    record: '18-9 last 60 days',
    badge: 'Verified',
  },
  {
    id: 205,
    creatorName: 'ChalkKing',
    creatorHandle: '@chalkking',
    creatorAvatar: 'CK',
    creatorAvatarColor: 'linear-gradient(135deg, #EF4444, #F0B232)',
    title: "5-Leg Mega Parlay",
    legs: [
      { label: 'Chiefs ML', game: 'KC vs PHI', odds: -168 },
      { label: 'Celtics ML', game: 'LAL vs BOS', odds: -125 },
      { label: 'Mahomes O 285.5', game: 'KC vs PHI', odds: -115 },
      { label: 'Jones ML', game: 'Jones vs Miocic', odds: -420 },
      { label: 'UCL O 2.5 Goals', game: 'RMA vs MCI', odds: -145 },
    ],
    totalOdds: +1850,
    record: '3-11 last 30 days',
    badge: 'High Risk',
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
