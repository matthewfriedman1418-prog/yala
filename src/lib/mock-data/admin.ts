// ─────────────────────────────────────────────────────────────────────────────
// Admin / back-office mock data.
//
// Everything here is fabricated for the operator-facing dashboard. No real PII,
// no real money. Numbers are internally consistent enough to look believable on
// charts and tables but are not derived from the player-facing stores.
// ─────────────────────────────────────────────────────────────────────────────

export type AdminRole = 'owner' | 'admin' | 'support' | 'compliance' | 'finance';

export interface AdminOperator {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar: string;
  lastActive: string;
  status: 'active' | 'invited' | 'suspended';
  twoFactor: boolean;
}

export const ADMIN_ME: AdminOperator = {
  id: 'op_001',
  name: 'Mara Okonkwo',
  email: 'mara@yala.com',
  role: 'owner',
  avatar: 'MO',
  lastActive: '2026-05-28T09:12:00Z',
  status: 'active',
  twoFactor: true,
};

export const STAFF: AdminOperator[] = [
  ADMIN_ME,
  { id: 'op_002', name: 'Dev Patel',       email: 'dev@yala.com',      role: 'admin',      avatar: 'DP', lastActive: '2026-05-28T08:40:00Z', status: 'active',    twoFactor: true },
  { id: 'op_003', name: 'Lena Hoffman',    email: 'lena@yala.com',     role: 'compliance', avatar: 'LH', lastActive: '2026-05-27T22:05:00Z', status: 'active',    twoFactor: true },
  { id: 'op_004', name: 'Tariq Mansour',   email: 'tariq@yala.com',    role: 'finance',    avatar: 'TM', lastActive: '2026-05-28T07:55:00Z', status: 'active',    twoFactor: false },
  { id: 'op_005', name: 'Grace Liu',       email: 'grace@yala.com',    role: 'support',    avatar: 'GL', lastActive: '2026-05-28T09:01:00Z', status: 'active',    twoFactor: true },
  { id: 'op_006', name: 'Owen Brooks',     email: 'owen@yala.com',     role: 'support',    avatar: 'OB', lastActive: '2026-05-26T18:20:00Z', status: 'active',    twoFactor: false },
  { id: 'op_007', name: 'Priya Nair',      email: 'priya@yala.com',    role: 'compliance', avatar: 'PN', lastActive: '—',                     status: 'invited',   twoFactor: false },
  { id: 'op_008', name: 'Carlos Vega',     email: 'carlos@yala.com',   role: 'admin',      avatar: 'CV', lastActive: '2026-04-30T11:00:00Z', status: 'suspended', twoFactor: true },
];

export const ROLE_LABELS: Record<AdminRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  support: 'Support',
  compliance: 'Compliance',
  finance: 'Finance',
};

// ── KPIs ─────────────────────────────────────────────────────────────────────

export interface Kpi {
  key: string;
  label: string;
  /** Pre-formatted display value. */
  value: string;
  /** Percentage change vs the previous period. */
  delta: number;
  /** Whether an up arrow is good (true) or bad (false). */
  upIsGood: boolean;
  /** Currency/section accent: 'gold' | 'teal' | 'blue' | 'purple' | 'amber'. */
  accent: 'gold' | 'teal' | 'blue' | 'purple' | 'amber';
  /** Tiny trend series for the sparkline. */
  spark: number[];
}

export const KPIS: Kpi[] = [
  { key: 'revenue',     label: 'Gross Revenue (30d)', value: '$1.84M',  delta: 12.4,  upIsGood: true,  accent: 'teal',   spark: [42, 48, 45, 51, 58, 55, 63, 61, 68, 72, 70, 78] },
  { key: 'dau',         label: 'Daily Active Players', value: '38,204', delta: 6.1,   upIsGood: true,  accent: 'gold',   spark: [30, 31, 29, 33, 35, 34, 36, 35, 37, 38, 37, 38] },
  { key: 'redemptions', label: 'Redemptions (30d)',   value: '$612K',   delta: -3.8,  upIsGood: false, accent: 'amber',  spark: [70, 66, 68, 64, 62, 65, 60, 58, 61, 57, 59, 55] },
  { key: 'signups',     label: 'New Signups (30d)',   value: '14,920',  delta: 22.7,  upIsGood: true,  accent: 'blue',   spark: [20, 24, 26, 25, 30, 33, 38, 42, 40, 46, 49, 52] },
  { key: 'arpu',        label: 'ARPPU',                value: '$48.20',  delta: 4.2,   upIsGood: true,  accent: 'purple', spark: [40, 41, 43, 42, 44, 45, 44, 46, 47, 46, 48, 48] },
  { key: 'kyc',         label: 'KYC Pass Rate',        value: '91.3%',   delta: 1.1,   upIsGood: true,  accent: 'teal',   spark: [86, 87, 88, 87, 89, 90, 89, 90, 91, 90, 91, 91] },
];

// 30 days of revenue split by purchase channel. Most-recent day is last.
export interface RevenuePoint { day: string; card: number; crypto: number; }
export const REVENUE_30D: RevenuePoint[] = Array.from({ length: 30 }, (_, i) => {
  // deterministic pseudo-wave so charts are stable across renders
  const base = 38 + Math.round(18 * Math.sin(i / 3.2) + i * 0.9);
  const card = Math.round(base * 0.62);
  const crypto = base - card;
  const d = new Date('2026-04-29T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + i);
  return { day: d.toISOString().slice(0, 10), card, crypto };
});

// Daily active players, 14 days, for the bar chart.
export const DAU_14D: { day: string; value: number }[] = Array.from({ length: 14 }, (_, i) => {
  const value = 31_000 + Math.round(4_000 * Math.sin(i / 2.1) + i * 220 + (i % 7 === 5 || i % 7 === 6 ? 3_500 : 0));
  const d = new Date('2026-05-15T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + i);
  return { day: d.toISOString().slice(0, 10), value };
});

// Coins in circulation breakdown for the donut.
export const COIN_CIRCULATION = [
  { label: 'Gold Coins', value: 4_820_000_000, color: '#F0B232' },
  { label: 'Sweep Coins', value: 18_400_000,    color: '#10B981' },
  { label: 'Bonus', value: 942_000_000,         color: '#F59E0B' },
  { label: 'Vault (locked)', value: 1_240_000_000, color: '#3B82F6' },
];

// Top games by handle (wager volume) for the overview leaderboard.
export const TOP_GAMES_BY_HANDLE = [
  { name: 'Mirage Crash',   provider: 'Yala Studios',  handle: 284_200_000, ggr: 2_842_000, sessions: 184_200 },
  { name: 'Gates of Olympus', provider: 'Pragmatic Play', handle: 211_400_000, ggr: 4_228_000, sessions: 96_400 },
  { name: 'Oasis Plinko',   provider: 'Yala Studios',  handle: 176_800_000, ggr: 1_768_000, sessions: 142_900 },
  { name: 'Sweet Bonanza',  provider: 'Pragmatic Play', handle: 158_300_000, ggr: 3_166_000, sessions: 71_200 },
  { name: 'Dune Mines',     provider: 'Yala Studios',  handle: 121_600_000, ggr: 1_216_000, sessions: 118_400 },
];

// ── Players ────────────────────────────────────────────────────────────────

export type PlayerStatus = 'active' | 'flagged' | 'banned' | 'self_excluded' | 'dormant';
export type KycStatus = 'verified' | 'pending' | 'unverified' | 'rejected';

export interface AdminPlayer {
  id: string;
  username: string;
  email: string;
  avatar: string;
  country: string;
  vipTier: number;
  vipName: string;
  status: PlayerStatus;
  kyc: KycStatus;
  joinDate: string;
  lastSeen: string;
  gcBalance: number;
  scBalance: number;
  totalDeposited: number;
  totalRedeemed: number;
  totalWagered: number;
  /** Lifetime net to the house (deposits − redemptions), USD. */
  netRevenue: number;
  flags: string[];
}

const COUNTRIES = ['US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR', 'BR', 'ZA', 'IE'];
const VIP = [
  { tier: 1, name: 'Scout' }, { tier: 2, name: 'Contender' }, { tier: 3, name: 'High Roller' },
  { tier: 4, name: 'Champion' }, { tier: 5, name: 'Legend' }, { tier: 6, name: 'Icon' },
];
const NAME_POOL = [
  'GoldRushKing', 'NightHunter', 'NeonLuck', 'ThunderX', 'DesertFox88', 'EmeraldWave', 'NightOwl7',
  'CoinKing', 'SpinAce', 'OasisHunter', 'MirageQueen', 'DuneRider', 'SandStorm', 'LuckyCamel',
  'JackpotJin', 'VelvetSpin', 'CrimsonAce', 'SilkRoadSam', 'PharaohPete', 'NomadNova', 'ScarabKid',
  'BedouinBet', 'AmberAndi', 'CaravanCat', 'SultanSpin', 'ZephyrZoe', 'FalconFifi', 'IbisIvy',
  'CobraClyde', 'LotusLuca', 'RoyalRiya', 'TidalTariq', 'VortexVic', 'WadiWill', 'XanaduXi',
  'YuccaYas', 'ZenithZara', 'AsterAria', 'BoltBruno', 'CinderCleo',
];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

// 40 deterministic players. The first is our known player from the app.
export const PLAYERS: AdminPlayer[] = NAME_POOL.map((username, i) => {
  const vip = pick(VIP, (i * 7 + 2) % 6);
  const deposited = Math.round((500 + (i * 9173) % 64_000) * (vip.tier + 1));
  const redeemed = Math.round(deposited * (0.2 + ((i * 13) % 50) / 100));
  const statusRoll = (i * 3 + 1) % 17;
  const status: PlayerStatus =
    statusRoll === 0 ? 'banned' :
    statusRoll === 1 || statusRoll === 9 ? 'flagged' :
    statusRoll === 4 ? 'self_excluded' :
    statusRoll === 13 ? 'dormant' : 'active';
  const kyc: KycStatus =
    vip.tier >= 4 ? 'verified' :
    statusRoll % 4 === 0 ? 'pending' :
    statusRoll % 7 === 0 ? 'rejected' : (i % 3 === 0 ? 'verified' : 'unverified');
  const flags: string[] = [];
  if (status === 'flagged') flags.push('Rapid redemption velocity');
  if (statusRoll === 9) flags.push('Multiple accounts (device match)');
  if (status === 'self_excluded') flags.push('Self-exclusion active');
  const joinD = new Date('2024-08-01T00:00:00Z');
  joinD.setUTCDate(joinD.getUTCDate() + (i * 11) % 540);
  const lastD = new Date('2026-05-28T00:00:00Z');
  lastD.setUTCHours(lastD.getUTCHours() - ((i * 17) % 600));
  return {
    id: `usr_${(7_341_900 + i * 113).toString(36)}`,
    username,
    email: `${username.toLowerCase()}@example.com`,
    avatar: username.slice(0, 2).toUpperCase(),
    country: pick(COUNTRIES, i * 3),
    vipTier: vip.tier,
    vipName: vip.name,
    status,
    kyc,
    joinDate: joinD.toISOString().slice(0, 10),
    lastSeen: lastD.toISOString(),
    gcBalance: 5_000 + ((i * 73_419) % 2_400_000),
    scBalance: Math.round(((i * 137) % 1800) * 10) / 10,
    totalDeposited: deposited,
    totalRedeemed: redeemed,
    totalWagered: deposited * (8 + (i % 12)),
    netRevenue: deposited - redeemed,
    flags,
  };
});

export function getPlayer(id: string): AdminPlayer | undefined {
  return PLAYERS.find((p) => p.id === id);
}

// Per-player activity feed used on the detail page (generic, reused for all).
export interface PlayerEvent { ts: string; kind: 'login' | 'deposit' | 'redeem' | 'wager' | 'bonus' | 'flag' | 'note'; text: string; }
export const PLAYER_EVENTS: PlayerEvent[] = [
  { ts: '2026-05-28T08:42:00Z', kind: 'login',   text: 'Signed in · iOS · New York, US' },
  { ts: '2026-05-28T08:45:00Z', kind: 'wager',   text: 'Wagered 12,500 GC on Mirage Crash' },
  { ts: '2026-05-27T19:10:00Z', kind: 'deposit', text: 'Purchased $99.99 Oasis Bundle (Card)' },
  { ts: '2026-05-27T19:11:00Z', kind: 'bonus',   text: 'Granted 50 SC welcome bonus' },
  { ts: '2026-05-26T14:02:00Z', kind: 'redeem',  text: 'Requested redemption of 200 SC → ACH' },
  { ts: '2026-05-25T22:30:00Z', kind: 'flag',    text: 'Auto-flag: 3 redemptions within 24h' },
  { ts: '2026-05-24T09:00:00Z', kind: 'note',    text: 'Support: verified address docs by phone (G. Liu)' },
  { ts: '2026-05-20T11:45:00Z', kind: 'login',   text: 'Signed in · Web · Toronto, CA' },
];

// ── Redemption queue ─────────────────────────────────────────────────────────

export type RedemptionStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'paid';
export interface Redemption {
  id: string;
  player: string;
  playerId: string;
  amountSC: number;
  usd: number;
  method: 'ACH' | 'Bank Wire' | 'Crypto (USDC)' | 'Skrill';
  status: RedemptionStatus;
  requestedAt: string;
  kyc: KycStatus;
  riskScore: number; // 0-100
  note?: string;
}

export const REDEMPTIONS: Redemption[] = [
  { id: 'rdm_8841', player: 'NightHunter',  playerId: 'usr_1', amountSC: 842.50, usd: 842.50, method: 'ACH',          status: 'pending',   requestedAt: '2026-05-28T07:55:00Z', kyc: 'verified',  riskScore: 18 },
  { id: 'rdm_8840', player: 'EmeraldWave',  playerId: 'usr_2', amountSC: 724.20, usd: 724.20, method: 'Bank Wire',    status: 'pending',   requestedAt: '2026-05-28T06:31:00Z', kyc: 'verified',  riskScore: 24 },
  { id: 'rdm_8839', player: 'SpinAce',      playerId: 'usr_3', amountSC: 1500.00, usd: 1500.00, method: 'Crypto (USDC)', status: 'in_review', requestedAt: '2026-05-28T04:12:00Z', kyc: 'pending',   riskScore: 67, note: 'KYC pending — hold until verified' },
  { id: 'rdm_8838', player: 'ThunderX',     playerId: 'usr_4', amountSC: 611.80, usd: 611.80, method: 'ACH',          status: 'in_review', requestedAt: '2026-05-27T23:40:00Z', kyc: 'verified',  riskScore: 41 },
  { id: 'rdm_8837', player: 'JackpotJin',   playerId: 'usr_5', amountSC: 2400.00, usd: 2400.00, method: 'Bank Wire',   status: 'in_review', requestedAt: '2026-05-27T21:05:00Z', kyc: 'verified',  riskScore: 72, note: 'Large amount — finance second-sign required' },
  { id: 'rdm_8836', player: 'NeonLuck',     playerId: 'usr_6', amountSC: 320.00, usd: 320.00, method: 'Skrill',       status: 'approved',  requestedAt: '2026-05-27T18:20:00Z', kyc: 'verified',  riskScore: 12 },
  { id: 'rdm_8835', player: 'CoinKing',     playerId: 'usr_7', amountSC: 95.00,  usd: 95.00,  method: 'ACH',          status: 'paid',      requestedAt: '2026-05-27T12:00:00Z', kyc: 'verified',  riskScore: 9 },
  { id: 'rdm_8834', player: 'DuneRider',    playerId: 'usr_8', amountSC: 540.00, usd: 540.00, method: 'Crypto (USDC)', status: 'rejected',  requestedAt: '2026-05-26T16:45:00Z', kyc: 'rejected',  riskScore: 88, note: 'Failed KYC — document mismatch' },
  { id: 'rdm_8833', player: 'MirageQueen',  playerId: 'usr_9', amountSC: 410.00, usd: 410.00, method: 'ACH',          status: 'paid',      requestedAt: '2026-05-26T09:30:00Z', kyc: 'verified',  riskScore: 15 },
  { id: 'rdm_8832', player: 'OasisHunter',  playerId: 'usr_10', amountSC: 1180.00, usd: 1180.00, method: 'Bank Wire', status: 'approved',  requestedAt: '2026-05-25T20:10:00Z', kyc: 'verified',  riskScore: 33 },
];

// ── KYC queue ────────────────────────────────────────────────────────────────

export interface KycCase {
  id: string;
  player: string;
  playerId: string;
  submittedAt: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  step: 'identity' | 'address' | 'documents' | 'review';
  docType: 'Passport' | "Driver's License" | 'National ID';
  country: string;
  riskScore: number;
  checks: { label: string; pass: boolean | null }[];
}

export const KYC_CASES: KycCase[] = [
  {
    id: 'kyc_5521', player: 'SpinAce', playerId: 'usr_3', submittedAt: '2026-05-28T03:50:00Z', status: 'pending', step: 'review',
    docType: 'Passport', country: 'US', riskScore: 22,
    checks: [
      { label: 'Document authenticity', pass: true },
      { label: 'Face match (selfie)', pass: true },
      { label: 'Address proof', pass: null },
      { label: 'Sanctions / PEP screen', pass: true },
      { label: 'Age 18+', pass: true },
    ],
  },
  {
    id: 'kyc_5520', player: 'NomadNova', playerId: 'usr_19', submittedAt: '2026-05-28T01:14:00Z', status: 'pending', step: 'documents',
    docType: "Driver's License", country: 'CA', riskScore: 38,
    checks: [
      { label: 'Document authenticity', pass: true },
      { label: 'Face match (selfie)', pass: null },
      { label: 'Address proof', pass: true },
      { label: 'Sanctions / PEP screen', pass: true },
      { label: 'Age 18+', pass: true },
    ],
  },
  {
    id: 'kyc_5519', player: 'ScarabKid', playerId: 'usr_20', submittedAt: '2026-05-27T22:40:00Z', status: 'in_review', step: 'review',
    docType: 'National ID', country: 'GB', riskScore: 61,
    checks: [
      { label: 'Document authenticity', pass: true },
      { label: 'Face match (selfie)', pass: true },
      { label: 'Address proof', pass: true },
      { label: 'Sanctions / PEP screen', pass: false },
      { label: 'Age 18+', pass: true },
    ],
  },
  {
    id: 'kyc_5518', player: 'DuneRider', playerId: 'usr_8', submittedAt: '2026-05-27T15:05:00Z', status: 'rejected', step: 'review',
    docType: 'Passport', country: 'AU', riskScore: 84,
    checks: [
      { label: 'Document authenticity', pass: false },
      { label: 'Face match (selfie)', pass: false },
      { label: 'Address proof', pass: true },
      { label: 'Sanctions / PEP screen', pass: true },
      { label: 'Age 18+', pass: true },
    ],
  },
  {
    id: 'kyc_5517', player: 'VelvetSpin', playerId: 'usr_15', submittedAt: '2026-05-27T09:22:00Z', status: 'approved', step: 'review',
    docType: "Driver's License", country: 'US', riskScore: 11,
    checks: [
      { label: 'Document authenticity', pass: true },
      { label: 'Face match (selfie)', pass: true },
      { label: 'Address proof', pass: true },
      { label: 'Sanctions / PEP screen', pass: true },
      { label: 'Age 18+', pass: true },
    ],
  },
];

// ── Support tickets ────────────────────────────────────────────────────────

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export interface Ticket {
  id: string;
  subject: string;
  player: string;
  playerId: string;
  category: 'Payments' | 'KYC' | 'Account' | 'Gameplay' | 'Responsible Gaming' | 'Bug';
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  messages: number;
  preview: string;
}

export const TICKETS: Ticket[] = [
  { id: 'tkt_9912', subject: 'Redemption stuck in review for 3 days', player: 'JackpotJin', playerId: 'usr_5', category: 'Payments', priority: 'high', status: 'open', assignee: null, createdAt: '2026-05-28T06:10:00Z', updatedAt: '2026-05-28T06:10:00Z', messages: 1, preview: 'I submitted a 2,400 SC redemption and it still says in review. Can someone check?' },
  { id: 'tkt_9911', subject: 'Cannot upload passport photo', player: 'NomadNova', playerId: 'usr_19', category: 'KYC', priority: 'normal', status: 'open', assignee: 'Grace Liu', createdAt: '2026-05-28T04:32:00Z', updatedAt: '2026-05-28T08:01:00Z', messages: 3, preview: 'The selfie step keeps failing on my Android phone.' },
  { id: 'tkt_9910', subject: 'Requesting self-exclusion (6 months)', player: 'CobraClyde', playerId: 'usr_29', category: 'Responsible Gaming', priority: 'urgent', status: 'pending', assignee: 'Lena Hoffman', createdAt: '2026-05-28T02:15:00Z', updatedAt: '2026-05-28T03:00:00Z', messages: 2, preview: 'Please close my account for at least 6 months.' },
  { id: 'tkt_9909', subject: 'Daily bonus wheel did not credit', player: 'NeonLuck', playerId: 'usr_6', category: 'Gameplay', priority: 'low', status: 'open', assignee: null, createdAt: '2026-05-27T21:40:00Z', updatedAt: '2026-05-27T21:40:00Z', messages: 1, preview: 'Spun the wheel, saw 2,500 GC, balance never updated.' },
  { id: 'tkt_9908', subject: 'Double charged for Oasis Bundle', player: 'ThunderX', playerId: 'usr_4', category: 'Payments', priority: 'high', status: 'pending', assignee: 'Owen Brooks', createdAt: '2026-05-27T18:05:00Z', updatedAt: '2026-05-28T07:20:00Z', messages: 5, preview: 'My card shows two $99.99 charges from today.' },
  { id: 'tkt_9907', subject: 'Crash game froze mid-round', player: 'DuneRider', playerId: 'usr_8', category: 'Bug', priority: 'normal', status: 'resolved', assignee: 'Dev Patel', createdAt: '2026-05-26T13:22:00Z', updatedAt: '2026-05-27T10:11:00Z', messages: 4, preview: 'Mirage Crash stopped responding at 4.2x.' },
  { id: 'tkt_9906', subject: 'How do I change my username?', player: 'AmberAndi', playerId: 'usr_22', category: 'Account', priority: 'low', status: 'closed', assignee: 'Grace Liu', createdAt: '2026-05-25T09:00:00Z', updatedAt: '2026-05-25T09:45:00Z', messages: 2, preview: 'Want to change my display name.' },
];

// ── Affiliates ───────────────────────────────────────────────────────────────

export interface Affiliate {
  id: string;
  code: string;
  name: string;
  tier: 'Creator' | 'Partner' | 'VIP Partner';
  status: 'active' | 'review' | 'paused';
  referrals: number;
  activeReferrals: number;
  commissionRate: number; // %
  earningsUSD: number;
  unpaidUSD: number;
  joinedAt: string;
}

export const AFFILIATES: Affiliate[] = [
  { id: 'aff_01', code: 'DESERT88',  name: 'DesertFox88',  tier: 'VIP Partner', status: 'active', referrals: 4_210, activeReferrals: 1_840, commissionRate: 35, earningsUSD: 184_200, unpaidUSD: 12_400, joinedAt: '2025-02-10' },
  { id: 'aff_02', code: 'NEONPLAYS', name: 'NeonLuck',     tier: 'Partner',     status: 'active', referrals: 1_980, activeReferrals: 720,   commissionRate: 25, earningsUSD: 62_500,  unpaidUSD: 4_100,  joinedAt: '2025-05-21' },
  { id: 'aff_03', code: 'GOLDRUSH',  name: 'GoldRushKing', tier: 'VIP Partner', status: 'review', referrals: 6_540, activeReferrals: 2_110, commissionRate: 35, earningsUSD: 248_900, unpaidUSD: 31_200, joinedAt: '2024-11-02' },
  { id: 'aff_04', code: 'SPINACE',   name: 'SpinAce',      tier: 'Creator',     status: 'active', referrals: 420,   activeReferrals: 180,   commissionRate: 15, earningsUSD: 9_400,   unpaidUSD: 820,    joinedAt: '2026-01-15' },
  { id: 'aff_05', code: 'NIGHTOWL',  name: 'NightOwl7',    tier: 'Partner',     status: 'paused', referrals: 1_120, activeReferrals: 90,    commissionRate: 25, earningsUSD: 28_700,  unpaidUSD: 0,      joinedAt: '2025-08-30' },
  { id: 'aff_06', code: 'MIRAGEQ',   name: 'MirageQueen',  tier: 'Creator',     status: 'active', referrals: 640,   activeReferrals: 310,   commissionRate: 15, earningsUSD: 14_200,  unpaidUSD: 1_650,  joinedAt: '2025-12-04' },
];

// ── Compliance: responsible-gaming flags & self-exclusions ─────────────────────

export type RgType = 'deposit_limit' | 'loss_limit' | 'time_limit' | 'cooloff' | 'self_exclusion' | 'reality_check';
export interface RgRecord {
  id: string;
  player: string;
  playerId: string;
  type: RgType;
  detail: string;
  setBy: 'player' | 'operator' | 'auto';
  startedAt: string;
  endsAt: string | null;
  status: 'active' | 'expired' | 'requested';
}

export const RG_LABELS: Record<RgType, string> = {
  deposit_limit: 'Deposit limit',
  loss_limit: 'Loss limit',
  time_limit: 'Session time limit',
  cooloff: 'Cool-off',
  self_exclusion: 'Self-exclusion',
  reality_check: 'Reality check',
};

export const RG_RECORDS: RgRecord[] = [
  { id: 'rg_01', player: 'CobraClyde', playerId: 'usr_29', type: 'self_exclusion', detail: '6 months', setBy: 'player',   startedAt: '2026-05-28T03:00:00Z', endsAt: '2026-11-28T03:00:00Z', status: 'requested' },
  { id: 'rg_02', player: 'LuckyCamel', playerId: 'usr_14', type: 'self_exclusion', detail: 'Permanent', setBy: 'player',  startedAt: '2026-03-12T00:00:00Z', endsAt: null, status: 'active' },
  { id: 'rg_03', player: 'SandStorm', playerId: 'usr_13', type: 'cooloff', detail: '72 hours', setBy: 'player', startedAt: '2026-05-27T18:00:00Z', endsAt: '2026-05-30T18:00:00Z', status: 'active' },
  { id: 'rg_04', player: 'ThunderX', playerId: 'usr_4', type: 'deposit_limit', detail: '$500 / week', setBy: 'player', startedAt: '2026-05-01T00:00:00Z', endsAt: null, status: 'active' },
  { id: 'rg_05', player: 'JackpotJin', playerId: 'usr_5', type: 'loss_limit', detail: '$1,000 / month', setBy: 'auto', startedAt: '2026-05-10T00:00:00Z', endsAt: null, status: 'active' },
  { id: 'rg_06', player: 'VelvetSpin', playerId: 'usr_15', type: 'time_limit', detail: '3 hours / day', setBy: 'player', startedAt: '2026-04-20T00:00:00Z', endsAt: null, status: 'active' },
  { id: 'rg_07', player: 'DuneRider', playerId: 'usr_8', type: 'cooloff', detail: '24 hours', setBy: 'operator', startedAt: '2026-05-20T00:00:00Z', endsAt: '2026-05-21T00:00:00Z', status: 'expired' },
];

// ── Audit log / live activity feed (overview) ──────────────────────────────────

export interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target: string;
  kind: 'payment' | 'kyc' | 'player' | 'config' | 'security' | 'support';
}

export const AUDIT_LOG: AuditEntry[] = [
  { id: 'a1', ts: '2026-05-28T09:10:00Z', actor: 'Tariq Mansour', action: 'Approved redemption', target: 'rdm_8836 · $320', kind: 'payment' },
  { id: 'a2', ts: '2026-05-28T09:02:00Z', actor: 'Lena Hoffman',  action: 'Approved KYC',         target: 'kyc_5517 · VelvetSpin', kind: 'kyc' },
  { id: 'a3', ts: '2026-05-28T08:51:00Z', actor: 'auto',          action: 'Flagged player',       target: 'JackpotJin · redemption velocity', kind: 'security' },
  { id: 'a4', ts: '2026-05-28T08:30:00Z', actor: 'Grace Liu',     action: 'Replied to ticket',    target: 'tkt_9911', kind: 'support' },
  { id: 'a5', ts: '2026-05-28T08:05:00Z', actor: 'Dev Patel',     action: 'Disabled game',        target: 'Sandstorm Limbo (maintenance)', kind: 'config' },
  { id: 'a6', ts: '2026-05-28T07:40:00Z', actor: 'Tariq Mansour', action: 'Rejected redemption',  target: 'rdm_8834 · KYC fail', kind: 'payment' },
  { id: 'a7', ts: '2026-05-28T07:12:00Z', actor: 'Mara Okonkwo',  action: 'Updated promotion',    target: 'Welcome Pack · bonus +10%', kind: 'config' },
  { id: 'a8', ts: '2026-05-28T06:55:00Z', actor: 'auto',          action: 'Self-exclusion request', target: 'CobraClyde · 6 months', kind: 'player' },
];

// Operational alerts surfaced on the overview.
export interface AdminAlert { id: string; severity: 'critical' | 'warning' | 'info'; title: string; detail: string; href: string; }
export const ALERTS: AdminAlert[] = [
  { id: 'al1', severity: 'critical', title: '2 high-value redemptions awaiting second sign-off', detail: 'Combined $3,900 over the $2,000 finance threshold.', href: '/admin/redemptions' },
  { id: 'al2', severity: 'warning',  title: '5 KYC cases breaching 24h SLA',                    detail: 'Oldest waiting 31h. Compliance queue backing up.', href: '/admin/kyc' },
  { id: 'al3', severity: 'warning',  title: '1 self-exclusion request needs confirmation',       detail: 'CobraClyde requested a 6-month exclusion.',        href: '/admin/compliance' },
  { id: 'al4', severity: 'info',     title: 'Affiliate GOLDRUSH under review',                   detail: 'Referral spike +180% — verify traffic quality.',   href: '/admin/affiliates' },
];

// Game catalog enriched with operator-facing controls. Kept self-contained so the
// games page can toggle flags without touching the player-facing games store.
export interface AdminGame {
  id: string;
  name: string;
  provider: string;
  category: string;
  rtp: number;
  enabled: boolean;
  featured: boolean;
  isHot: boolean;
  isNew: boolean;
  ggr30d: number;
  sessions30d: number;
}

export const ADMIN_GAMES: AdminGame[] = [
  { id: 'g1',  name: 'Mirage Crash',          provider: 'Yala Studios',   category: 'Originals', rtp: 99.0, enabled: true,  featured: true,  isHot: true,  isNew: false, ggr30d: 2_842_000, sessions30d: 184_200 },
  { id: 'g2',  name: 'Oasis Plinko',          provider: 'Yala Studios',   category: 'Originals', rtp: 99.0, enabled: true,  featured: true,  isHot: true,  isNew: false, ggr30d: 1_768_000, sessions30d: 142_900 },
  { id: 'g3',  name: 'Dune Mines',            provider: 'Yala Studios',   category: 'Originals', rtp: 98.5, enabled: true,  featured: false, isHot: false, isNew: false, ggr30d: 1_216_000, sessions30d: 118_400 },
  { id: 'g4',  name: 'Caravan Cross',         provider: 'Yala Studios',   category: 'Originals', rtp: 99.0, enabled: true,  featured: true,  isHot: false, isNew: true,  ggr30d: 944_000,   sessions30d: 88_100 },
  { id: 'g5',  name: 'Sandstorm Limbo',       provider: 'Yala Studios',   category: 'Originals', rtp: 99.0, enabled: false, featured: false, isHot: false, isNew: false, ggr30d: 0,         sessions30d: 0 },
  { id: 'g6',  name: 'Gates of Olympus',      provider: 'Pragmatic Play', category: 'Slots',     rtp: 96.5, enabled: true,  featured: true,  isHot: true,  isNew: false, ggr30d: 4_228_000, sessions30d: 96_400 },
  { id: 'g7',  name: 'Sweet Bonanza',         provider: 'Pragmatic Play', category: 'Slots',     rtp: 96.4, enabled: true,  featured: false, isHot: true,  isNew: false, ggr30d: 3_166_000, sessions30d: 71_200 },
  { id: 'g8',  name: 'Mental',                provider: 'NoLimit City',   category: 'Slots',     rtp: 96.0, enabled: true,  featured: false, isHot: false, isNew: false, ggr30d: 1_842_000, sessions30d: 41_800 },
  { id: 'g9',  name: 'Wanted Dead or a Wild', provider: 'Hacksaw',        category: 'Slots',     rtp: 96.4, enabled: true,  featured: false, isHot: false, isNew: true,  ggr30d: 1_204_000, sessions30d: 38_900 },
  { id: 'g10', name: 'Crazy Time',            provider: 'Evolution',      category: 'Live',      rtp: 95.4, enabled: true,  featured: true,  isHot: true,  isNew: false, ggr30d: 2_980_000, sessions30d: 52_300 },
  { id: 'g11', name: 'Lightning Roulette',    provider: 'Evolution',      category: 'Live',      rtp: 97.3, enabled: true,  featured: false, isHot: false, isNew: false, ggr30d: 1_510_000, sessions30d: 33_100 },
  { id: 'g12', name: 'Fruit Party',           provider: 'Pragmatic Play', category: 'Slots',     rtp: 96.5, enabled: false, featured: false, isHot: false, isNew: false, ggr30d: 0,         sessions30d: 0 },
];
