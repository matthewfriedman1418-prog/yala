// ─────────────────────────────────────────────────────────────────────────────
// Extended admin mock data for the full spec build (Phases 2–4).
// Self-contained; original; no real PII or money.
// ─────────────────────────────────────────────────────────────────────────────

// ── SC economy (we only track SWEEP COINS for circulation — GC has no value) ──
export const SC_ECONOMY = {
  issued: 8_420_000,          // total SC ever issued
  inCirculation: 1_284_900,   // SC currently held by players
  redeemed: 6_519_400,        // SC redeemed for cash to date
  pendingRedemption: 18_400,  // SC in the redemption pipeline
  redemptionRatePct: 77.4,    // redeemed / issued
};

// 30 days of new signups, for the KPI drill-down (most recent last).
export const SIGNUPS_DAILY: { day: string; value: number; source: { organic: number; paid: number; affiliate: number } }[] =
  Array.from({ length: 30 }, (_, i) => {
    const base = 380 + Math.round(140 * Math.sin(i / 3.5) + i * 6 + (i % 7 >= 5 ? 120 : 0));
    const paid = Math.round(base * 0.38);
    const affiliate = Math.round(base * 0.22);
    const organic = base - paid - affiliate;
    const d = new Date('2026-04-29T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + i);
    return { day: d.toISOString().slice(0, 10), value: base, source: { organic, paid, affiliate } };
  });

// ── Bonuses (typed library) ──────────────────────────────────────────────────
// Bonus type is a free-form key so operators can invent new ones (monthly,
// seasonal, whatever). These are just the seeded defaults.
export type BonusFrequency = 'one_time' | 'daily' | 'weekly' | 'monthly' | 'event';
export type PercentBasis = 'deposit' | 'net_losses' | 'wager';
export interface Bonus {
  id: number;
  title: string;
  type: string;
  frequency: BonusFrequency;
  /** When true, the award is a percentage of `percentBasis` rather than a flat amount. */
  isPercentage: boolean;
  percent: number;          // used when isPercentage
  percentBasis: PercentBasis;
  gcAmount: number;         // used when flat
  scAmount: number;         // used when flat
  active: boolean;
  validity: string;
  eligibility: string;
}
export const BONUSES: Bonus[] = [
  { id: 32, title: 'Weekly Commission Bonus', type: 'weekly_commission', frequency: 'weekly', isPercentage: true, percent: 10, percentBasis: 'wager', gcAmount: 0, scAmount: 0, active: true, validity: 'Calculated weekly', eligibility: 'Based on referral activity' },
  { id: 31, title: 'Weekly Cashback Bonus', type: 'weekly_cashback', frequency: 'weekly', isPercentage: true, percent: 15, percentBasis: 'net_losses', gcAmount: 0, scAmount: 0, active: true, validity: 'Calculated weekly', eligibility: 'Net losses prior week' },
  { id: 33, title: 'Monthly Loyalty Bonus', type: 'monthly_loyalty', frequency: 'monthly', isPercentage: true, percent: 5, percentBasis: 'net_losses', gcAmount: 0, scAmount: 0, active: true, validity: '1st of each month', eligibility: 'Active players, prior month' },
  { id: 30, title: 'Birthday Bonus', type: 'birthday', frequency: 'one_time', isPercentage: false, percent: 0, percentBasis: 'deposit', gcAmount: 25_000, scAmount: 5, active: true, validity: 'On birthday', eligibility: 'Verified DOB' },
  { id: 29, title: 'Early User Bonus', type: 'early_user', frequency: 'one_time', isPercentage: false, percent: 0, percentBasis: 'deposit', gcAmount: 100_000, scAmount: 25, active: true, validity: 'First 30 days', eligibility: 'Accounts before launch+30d' },
  { id: 28, title: 'Referral Bonus', type: 'referral', frequency: 'event', isPercentage: false, percent: 0, percentBasis: 'deposit', gcAmount: 50_000, scAmount: 10, active: true, validity: 'On referred FTD', eligibility: 'Referred user first purchase' },
  { id: 2, title: 'Reload Boost', type: 'boost', frequency: 'event', isPercentage: true, percent: 100, percentBasis: 'deposit', gcAmount: 0, scAmount: 0, active: true, validity: 'Event windows', eligibility: 'Opted-in players' },
  { id: 1, title: 'Welcome Bonus', type: 'welcome', frequency: 'one_time', isPercentage: false, percent: 0, percentBasis: 'deposit', gcAmount: 100_000, scAmount: 50, active: true, validity: 'First purchase', eligibility: 'New accounts' },
];

// ── Coin packages / store ────────────────────────────────────────────────────
export interface CoinPackage {
  id: string; name: string; priceUSD: number; gc: number; bonusSC: number;
  bestValue: boolean; active: boolean; sold30d: number;
}
export const PACKAGES: CoinPackage[] = [
  { id: 'pkg_1', name: 'Starter Pack', priceUSD: 4.99, gc: 10_000, bonusSC: 5, bestValue: false, active: true, sold30d: 8_420 },
  { id: 'pkg_2', name: 'Dune Pack', priceUSD: 19.99, gc: 50_000, bonusSC: 25, bestValue: false, active: true, sold30d: 6_110 },
  { id: 'pkg_3', name: 'Oasis Bundle', priceUSD: 49.99, gc: 150_000, bonusSC: 75, bestValue: true, active: true, sold30d: 4_980 },
  { id: 'pkg_4', name: 'Caravan Crate', priceUSD: 99.99, gc: 350_000, bonusSC: 175, bestValue: false, active: true, sold30d: 2_240 },
  { id: 'pkg_5', name: 'Sheikh Vault', priceUSD: 199.99, gc: 750_000, bonusSC: 400, bestValue: false, active: true, sold30d: 920 },
  { id: 'pkg_6', name: 'Legacy Holiday Pack', priceUSD: 29.99, gc: 80_000, bonusSC: 40, bestValue: false, active: false, sold30d: 0 },
];

// ── Providers / Aggregators / Categories ─────────────────────────────────────
export interface Provider { id: number; name: string; games: number; status: 'active' | 'disabled'; aggregator: string; }
export const PROVIDERS: Provider[] = [
  { id: 1654, name: 'Yala Studios', games: 15, status: 'active', aggregator: 'Direct' },
  { id: 94, name: 'Pragmatic Play', games: 312, status: 'active', aggregator: 'SoftSwiss' },
  { id: 71, name: 'Evolution', games: 184, status: 'active', aggregator: 'Direct' },
  { id: 69, name: 'NoLimit City', games: 96, status: 'active', aggregator: 'SoftSwiss' },
  { id: 188, name: 'Hacksaw Gaming', games: 88, status: 'active', aggregator: 'SoftSwiss' },
  { id: 74, name: 'Push Gaming', games: 64, status: 'active', aggregator: 'Relax' },
  { id: 42, name: 'Relax Gaming', games: 210, status: 'active', aggregator: 'Relax' },
  { id: 83, name: 'Big Time Gaming', games: 47, status: 'disabled', aggregator: 'SoftSwiss' },
];
export interface Aggregator { id: string; name: string; providers: number; status: 'active' | 'disabled'; }
export const AGGREGATORS: Aggregator[] = [
  { id: 'agg_1', name: 'SoftSwiss', providers: 42, status: 'active' },
  { id: 'agg_2', name: 'Relax (Silver Bullet)', providers: 28, status: 'active' },
  { id: 'agg_3', name: 'Direct integrations', providers: 4, status: 'active' },
];
export interface Category { id: number; name: string; games: number; status: 'active' | 'inactive'; order: number; }
export const CATEGORIES: Category[] = [
  { id: 448, name: 'Popular Games', games: 60, status: 'active', order: 1 },
  { id: 67, name: 'Slots', games: 980, status: 'active', order: 2 },
  { id: 445, name: 'Sweet Slots', games: 120, status: 'active', order: 3 },
  { id: 449, name: 'Live Casino', games: 184, status: 'active', order: 4 },
  { id: 444, name: 'Table Games', games: 96, status: 'active', order: 5 },
  { id: 446, name: 'Fish Games', games: 24, status: 'inactive', order: 6 },
  { id: 3, name: 'Bingo', games: 18, status: 'inactive', order: 7 },
  { id: 4, name: 'Blackjack', games: 32, status: 'active', order: 8 },
];

// ── Bet / round explorer ─────────────────────────────────────────────────────
export interface GameRound {
  id: string; player: string; playerId: string; game: string; currency: 'GC' | 'SC';
  bet: number; payout: number; multiplier: number; result: 'win' | 'loss';
  ts: string; serverSeedHash: string; clientSeed: string; nonce: number;
}
export const ROUNDS: GameRound[] = Array.from({ length: 24 }, (_, i) => {
  const games = ['Mirage Crash', 'Oasis Plinko', 'Dune Mines', 'Gates of Olympus', 'Crazy Time', 'Golden Dice'];
  const bet = [0.25, 0.5, 1, 2.5, 5][i % 5];
  const mult = [0, 0, 1.4, 2.1, 0, 5.8, 0, 12.4][i % 8];
  const payout = Math.round(bet * mult * 100) / 100;
  return {
    id: `rnd_${(982_341 + i * 7).toString(36)}`,
    player: ['NightHunter', 'EmeraldWave', 'SpinAce', 'ThunderX', 'JackpotJin'][i % 5],
    playerId: `usr_${i % 5}`,
    game: games[i % games.length],
    currency: i % 3 === 0 ? 'SC' : 'GC',
    bet, payout, multiplier: mult, result: payout > bet ? 'win' : 'loss',
    ts: new Date(Date.parse('2026-05-28T09:00:00Z') - i * 137_000).toISOString(),
    serverSeedHash: `${(i * 9301 + 49297).toString(16).padStart(8, '0')}a3f${i}c91e7b2`,
    clientSeed: `client_${(i * 31 + 7).toString(36)}`,
    nonce: 1000 + i,
  };
});

// ── Jackpots ─────────────────────────────────────────────────────────────────
export interface Jackpot { id: string; name: string; pool: number; seed: number; contribRate: number; lastWinner: string; lastWonAt: string; }
export const JACKPOTS: Jackpot[] = [
  { id: 'jp_mini', name: 'Mini Oasis', pool: 12_480, seed: 5_000, contribRate: 0.5, lastWinner: 'NeonLuck', lastWonAt: '2026-05-27' },
  { id: 'jp_major', name: 'Major Mirage', pool: 184_220, seed: 100_000, contribRate: 1.0, lastWinner: 'GoldRushKing', lastWonAt: '2026-05-19' },
  { id: 'jp_grand', name: 'Grand Caravan', pool: 1_284_900, seed: 1_000_000, contribRate: 1.5, lastWinner: 'ThunderX', lastWonAt: '2026-04-30' },
];

// ── Devices / duplicates (fraud) ─────────────────────────────────────────────
export interface DeviceCluster {
  id: string; signal: 'device' | 'ip' | 'payment' | 'email';
  detail: string; accounts: { username: string; playerId: string; status: string }[];
  riskScore: number;
}
export const DEVICE_CLUSTERS: DeviceCluster[] = [
  { id: 'dc_1', signal: 'device', detail: 'Fingerprint d41f…a907 · 3 accounts', riskScore: 82, accounts: [
    { username: 'JackpotJin', playerId: 'usr_5', status: 'flagged' },
    { username: 'SpinAce', playerId: 'usr_3', status: 'active' },
    { username: 'CobraClyde', playerId: 'usr_29', status: 'self_excluded' },
  ] },
  { id: 'dc_2', signal: 'ip', detail: '49.43.6.243 · 2 accounts', riskScore: 54, accounts: [
    { username: 'NomadNova', playerId: 'usr_19', status: 'active' },
    { username: 'ScarabKid', playerId: 'usr_20', status: 'active' },
  ] },
  { id: 'dc_3', signal: 'payment', detail: 'Card •••• 4291 · 2 accounts', riskScore: 71, accounts: [
    { username: 'DuneRider', playerId: 'usr_8', status: 'banned' },
    { username: 'VelvetSpin', playerId: 'usr_15', status: 'active' },
  ] },
];

// ── AML cases ────────────────────────────────────────────────────────────────
export interface AmlCase {
  id: string; player: string; playerId: string; type: 'sanctions' | 'pep' | 'structuring' | 'velocity';
  detail: string; status: 'open' | 'escalated' | 'cleared' | 'sar_filed'; opened: string; riskScore: number;
}
export const AML_CASES: AmlCase[] = [
  { id: 'aml_1', player: 'ScarabKid', playerId: 'usr_20', type: 'sanctions', detail: 'Possible OFAC list match (name + DOB)', status: 'escalated', opened: '2026-05-27T22:40:00Z', riskScore: 88 },
  { id: 'aml_2', player: 'JackpotJin', playerId: 'usr_5', type: 'structuring', detail: 'Multiple sub-threshold redemptions in 24h', status: 'open', opened: '2026-05-28T03:00:00Z', riskScore: 74 },
  { id: 'aml_3', player: 'GoldRushKing', playerId: 'usr_0', type: 'velocity', detail: 'Deposit velocity 6× baseline', status: 'open', opened: '2026-05-28T06:10:00Z', riskScore: 61 },
  { id: 'aml_4', player: 'DuneRider', playerId: 'usr_8', type: 'pep', detail: 'PEP screen hit — secondary review', status: 'cleared', opened: '2026-05-20T10:00:00Z', riskScore: 33 },
];

// ── Fraud rules engine ───────────────────────────────────────────────────────
export interface FraudRule {
  id: string; name: string; condition: string; action: 'flag' | 'hold' | 'withdraw_only' | 'ban';
  enabled: boolean; hits30d: number;
}
export const FRAUD_RULES: FraudRule[] = [
  { id: 'fr_1', name: 'Redemption velocity', condition: '≥ 3 redemptions / 24h', action: 'hold', enabled: true, hits30d: 142 },
  { id: 'fr_2', name: 'Multi-account (device)', condition: 'Shared fingerprint across ≥ 2 accounts', action: 'flag', enabled: true, hits30d: 38 },
  { id: 'fr_3', name: 'Bonus abuse', condition: 'Bonus-only wagering, no real spend', action: 'withdraw_only', enabled: true, hits30d: 21 },
  { id: 'fr_4', name: 'Card testing', condition: '≥ 4 declined deposits / 10 min', action: 'ban', enabled: true, hits30d: 7 },
  { id: 'fr_5', name: 'Geo mismatch', condition: 'Signup vs login country differ', action: 'flag', enabled: false, hits30d: 0 },
  { id: 'fr_6', name: 'High-value first redemption', condition: 'First redemption > $1,000', action: 'hold', enabled: true, hits30d: 18 },
];

// ── Geo / jurisdiction ───────────────────────────────────────────────────────
export interface GeoRule { code: string; name: string; status: 'allowed' | 'blocked' | 'sc_blocked'; note: string; }
export const GEO_RULES: GeoRule[] = [
  { code: 'WA', name: 'Washington', status: 'blocked', note: 'No sweeps play permitted' },
  { code: 'ID', name: 'Idaho', status: 'blocked', note: 'No sweeps play permitted' },
  { code: 'MI', name: 'Michigan', status: 'sc_blocked', note: 'GC only — SC redemption disabled' },
  { code: 'NY', name: 'New York', status: 'allowed', note: '' },
  { code: 'CA', name: 'California', status: 'allowed', note: '' },
  { code: 'TX', name: 'Texas', status: 'allowed', note: '' },
  { code: 'FL', name: 'Florida', status: 'allowed', note: '' },
];

// ── AMOE (mail-in entries) ───────────────────────────────────────────────────
export interface AmoeEntry {
  id: string; name: string; player: string; playerId: string; received: string;
  status: 'pending' | 'validated' | 'granted' | 'rejected'; scGranted: number;
}
export const AMOE_ENTRIES: AmoeEntry[] = [
  { id: 'amoe_1', name: 'Postcard #4821', player: 'NeonLuck', playerId: 'usr_6', received: '2026-05-27T00:00:00Z', status: 'pending', scGranted: 5 },
  { id: 'amoe_2', name: 'Postcard #4820', player: 'EmeraldWave', playerId: 'usr_2', received: '2026-05-26T00:00:00Z', status: 'validated', scGranted: 5 },
  { id: 'amoe_3', name: 'Postcard #4819', player: 'SpinAce', playerId: 'usr_3', received: '2026-05-25T00:00:00Z', status: 'granted', scGranted: 5 },
  { id: 'amoe_4', name: 'Postcard #4818', player: '(no match)', playerId: '', received: '2026-05-24T00:00:00Z', status: 'rejected', scGranted: 0 },
];

// ── Crypto deposits (on-chain) ───────────────────────────────────────────────
export interface CryptoDeposit {
  id: string; player: string; playerId: string; asset: 'BTC' | 'ETH' | 'USDC' | 'USDT' | 'LTC';
  amount: number; usd: number; confirmations: number; required: number;
  status: 'pending' | 'confirming' | 'credited' | 'failed'; txHash: string; receivedAt: string;
}
export const CRYPTO_DEPOSITS: CryptoDeposit[] = [
  { id: 'cd_1', player: 'NightHunter', playerId: 'usr_1', asset: 'USDC', amount: 250, usd: 250, confirmations: 14, required: 12, status: 'credited', txHash: '0x8a3f…c91e', receivedAt: '2026-05-28T08:40:00Z' },
  { id: 'cd_2', player: 'ThunderX', playerId: 'usr_4', asset: 'ETH', amount: 0.12, usd: 384.2, confirmations: 6, required: 12, status: 'confirming', txHash: '0x44c2…7b21', receivedAt: '2026-05-28T09:05:00Z' },
  { id: 'cd_3', player: 'JackpotJin', playerId: 'usr_5', asset: 'BTC', amount: 0.011, usd: 742.5, confirmations: 1, required: 3, status: 'confirming', txHash: 'bc1q…9x4d', receivedAt: '2026-05-28T09:18:00Z' },
  { id: 'cd_4', player: 'EmeraldWave', playerId: 'usr_2', asset: 'USDT', amount: 100, usd: 100, confirmations: 0, required: 12, status: 'pending', txHash: '0x19ab…44ff', receivedAt: '2026-05-28T09:26:00Z' },
  { id: 'cd_5', player: 'DuneRider', playerId: 'usr_8', asset: 'LTC', amount: 2.4, usd: 196.8, confirmations: 0, required: 6, status: 'failed', txHash: 'ltc1…0a7c', receivedAt: '2026-05-27T22:10:00Z' },
];

// ── Tax statements ───────────────────────────────────────────────────────────
export interface TaxRecord { id: string; player: string; playerId: string; form: 'W-2G' | '1099-MISC'; year: number; amount: number; status: 'draft' | 'issued'; }
export const TAX_RECORDS: TaxRecord[] = [
  { id: 'tax_1', player: 'GoldRushKing', playerId: 'usr_0', form: '1099-MISC', year: 2025, amount: 12_400, status: 'issued' },
  { id: 'tax_2', player: 'NightHunter', playerId: 'usr_1', form: '1099-MISC', year: 2025, amount: 8_900, status: 'issued' },
  { id: 'tax_3', player: 'ThunderX', playerId: 'usr_4', form: 'W-2G', year: 2025, amount: 1_500, status: 'issued' },
  { id: 'tax_4', player: 'JackpotJin', playerId: 'usr_5', form: '1099-MISC', year: 2026, amount: 6_200, status: 'draft' },
];

// ── Chargebacks / disputes ───────────────────────────────────────────────────
export interface Chargeback {
  id: string; player: string; playerId: string; amount: number; reason: string;
  status: 'new' | 'representing' | 'won' | 'lost'; opened: string; processor: string;
}
export const CHARGEBACKS: Chargeback[] = [
  { id: 'cb_1', player: 'ThunderX', playerId: 'usr_4', amount: 99.99, reason: 'Fraudulent — card not present', status: 'new', opened: '2026-05-28T07:00:00Z', processor: 'Nuvei' },
  { id: 'cb_2', player: 'DuneRider', playerId: 'usr_8', amount: 49.99, reason: 'Product not received', status: 'representing', opened: '2026-05-26T00:00:00Z', processor: 'Nuvei' },
  { id: 'cb_3', player: 'VelvetSpin', playerId: 'usr_15', amount: 19.99, reason: 'Duplicate charge', status: 'won', opened: '2026-05-20T00:00:00Z', processor: 'Worldpay' },
];

// ── CRM segments + campaigns ─────────────────────────────────────────────────
export interface Segment { id: string; name: string; rule: string; size: number; }
export const SEGMENTS: Segment[] = [
  { id: 'seg_1', name: 'Dormant depositors', rule: 'Deposited ≥1 · inactive 14d · KYC verified', size: 3_420 },
  { id: 'seg_2', name: 'New no-deposit', rule: 'Signup ≤7d · 0 purchases', size: 5_910 },
  { id: 'seg_3', name: 'VIP at-risk', rule: 'Tier ≥4 · wager ↓50% WoW', size: 184 },
  { id: 'seg_4', name: 'High redeemers', rule: 'Redeemed ≥ $500 lifetime', size: 1_240 },
];
export interface Campaign { id: string; name: string; channel: 'email' | 'push' | 'in_app'; segment: string; status: 'draft' | 'scheduled' | 'sent'; sent: number; openRate: number; }
export const CAMPAIGNS: Campaign[] = [
  { id: 'cmp_1', name: 'Weekend Reload 2×', channel: 'push', segment: 'Dormant depositors', status: 'sent', sent: 3_420, openRate: 38.2 },
  { id: 'cmp_2', name: 'Finish your first purchase', channel: 'email', segment: 'New no-deposit', status: 'scheduled', sent: 0, openRate: 0 },
  { id: 'cmp_3', name: 'VIP — your host has a gift', channel: 'in_app', segment: 'VIP at-risk', status: 'draft', sent: 0, openRate: 0 },
];

// ── Tournaments / missions / spin wheel / streak ─────────────────────────────
export interface Tournament { id: string; name: string; game: string; prizePool: number; status: 'live' | 'scheduled' | 'ended'; start: string; end: string; players: number; }
export const TOURNAMENTS: Tournament[] = [
  { id: 'trn_1', name: 'Mirage Madness', game: 'Mirage Crash', prizePool: 50_000, status: 'live', start: '2026-05-26', end: '2026-05-30', players: 4_210 },
  { id: 'trn_2', name: 'Plinko Rush', game: 'Oasis Plinko', prizePool: 25_000, status: 'scheduled', start: '2026-06-01', end: '2026-06-03', players: 0 },
  { id: 'trn_3', name: 'May Slots Race', game: 'All slots', prizePool: 100_000, status: 'live', start: '2026-05-01', end: '2026-05-31', players: 18_900 },
];
export interface Mission { id: string; name: string; objective: string; reward: string; active: boolean; }
export const MISSIONS: Mission[] = [
  { id: 'msn_1', name: 'First Steps', objective: 'Play 5 different games', reward: '5,000 GC', active: true },
  { id: 'msn_2', name: 'High Roller', objective: 'Wager 100,000 GC in a day', reward: '10,000 GC + 5 SC', active: true },
  { id: 'msn_3', name: 'Daily Devotee', objective: '7-day login streak', reward: '2× daily bonus', active: true },
  { id: 'msn_4', name: 'Social Butterfly', objective: 'Refer 3 friends', reward: '25 SC', active: false },
];
export interface WheelSegment { label: string; weight: number; reward: string; }
export const SPIN_WHEEL: WheelSegment[] = [
  { label: '500 GC', weight: 30, reward: '500 GC' },
  { label: '1,000 GC', weight: 25, reward: '1,000 GC' },
  { label: '2,500 GC', weight: 18, reward: '2,500 GC' },
  { label: '1 SC', weight: 15, reward: '1 SC' },
  { label: '5,000 GC', weight: 8, reward: '5,000 GC' },
  { label: '5 SC', weight: 3, reward: '5 SC' },
  { label: 'JACKPOT', weight: 1, reward: '50,000 GC + 25 SC' },
];

// ── CMS pages + banners ──────────────────────────────────────────────────────
export interface CmsPage { id: number; title: string; slug: string; status: 'active' | 'inactive'; }
export const CMS_PAGES: CmsPage[] = [
  { id: 20, title: 'Sweepstakes Rules', slug: 'sweepstakes-rules', status: 'active' },
  { id: 17, title: 'Terms of Service', slug: 'terms', status: 'active' },
  { id: 16, title: 'Privacy Policy', slug: 'privacy', status: 'active' },
  { id: 9, title: 'Responsible Gaming', slug: 'responsible-gaming', status: 'active' },
  { id: 12, title: 'How to Redeem', slug: 'how-to-redeem', status: 'active' },
  { id: 11, title: 'AMOE Instructions', slug: 'amoe', status: 'active' },
  { id: 7, title: 'About Yala', slug: 'about', status: 'inactive' },
];
export interface AdminBanner { id: number; type: string; placement: string; redirect: string; priority: number; enabled: boolean; }
export const ADMIN_BANNERS: AdminBanner[] = [
  { id: 63, type: 'Welcome to Yala', placement: 'Home', redirect: '/wallet/buy', priority: 1, enabled: true },
  { id: 64, type: 'Refer a Friend', placement: 'Refer Friend', redirect: '/affiliate', priority: 1, enabled: true },
  { id: 60, type: 'Registration Offer', placement: 'Registration', redirect: '/wallet/buy', priority: 2, enabled: true },
  { id: 66, type: 'Casino Drops & Wins', placement: 'Casino', redirect: '/promotions', priority: 2, enabled: true },
  { id: 39, type: 'Store Sale', placement: 'Store', redirect: '/wallet/buy', priority: 4, enabled: false },
];

// ── Feature flags / jobs / webhooks ──────────────────────────────────────────
export interface FeatureFlag { code: string; enabled: boolean; description: string; }
export const FEATURE_FLAGS: FeatureFlag[] = [
  { code: 'abandoned_bets:pragmatic', enabled: true, description: 'Pragmatic abandoned-bet reconciliation monitor' },
  { code: 'abandoned_bets:evolution', enabled: false, description: 'Evolution abandoned-bet reconciliation monitor' },
  { code: 'abandoned_bets:hacksaw', enabled: true, description: 'Hacksaw abandoned-bet reconciliation monitor' },
  { code: 'redemptions:auto_approve_under_50', enabled: true, description: 'Auto-approve verified redemptions under $50' },
  { code: 'kyc:require_doc_over_2000', enabled: true, description: 'Force documentary KYC past $2,000 lifetime redemption' },
  { code: 'store:apple_pay', enabled: true, description: 'Apple Pay deposit method' },
  { code: 'store:crypto', enabled: true, description: 'Crypto on-ramp deposits' },
  { code: 'social:global_chat', enabled: true, description: 'Global chat enabled site-wide' },
  { code: 'originals:sandstorm_limbo', enabled: false, description: 'Sandstorm Limbo original (maintenance)' },
];
export interface JobMonitor { name: string; schedule: string; lastRun: string; status: 'ok' | 'degraded' | 'failed'; durationMs: number; }
export const JOBS: JobMonitor[] = [
  { name: 'rakeback:accrue', schedule: '*/15 * * * *', lastRun: '2026-05-28T09:15:00Z', status: 'ok', durationMs: 842 },
  { name: 'redemptions:settle', schedule: '0 * * * *', lastRun: '2026-05-28T09:00:00Z', status: 'ok', durationMs: 2_140 },
  { name: 'leaderboards:recompute', schedule: '*/5 * * * *', lastRun: '2026-05-28T09:25:00Z', status: 'ok', durationMs: 410 },
  { name: 'kyc:poll_vendor', schedule: '*/2 * * * *', lastRun: '2026-05-28T09:28:00Z', status: 'degraded', durationMs: 9_900 },
  { name: 'reconcile:psp', schedule: '0 6 * * *', lastRun: '2026-05-28T06:00:00Z', status: 'ok', durationMs: 18_400 },
  { name: 'bonus_drop:dispatch', schedule: '0 12 * * *', lastRun: '2026-05-27T12:00:00Z', status: 'failed', durationMs: 0 },
];
export interface Webhook { id: string; source: string; event: string; status: 'delivered' | 'failed' | 'retrying'; ts: string; }
export const WEBHOOKS: Webhook[] = [
  { id: 'wh_1', source: 'Nuvei', event: 'payment.succeeded', status: 'delivered', ts: '2026-05-28T09:20:00Z' },
  { id: 'wh_2', source: 'Persona', event: 'inquiry.completed', status: 'delivered', ts: '2026-05-28T09:12:00Z' },
  { id: 'wh_3', source: 'Pragmatic', event: 'round.settled', status: 'retrying', ts: '2026-05-28T09:05:00Z' },
  { id: 'wh_4', source: 'Dwolla', event: 'transfer.failed', status: 'failed', ts: '2026-05-28T08:40:00Z' },
  { id: 'wh_5', source: 'Coinbase', event: 'charge.confirmed', status: 'delivered', ts: '2026-05-28T08:10:00Z' },
];

// ── VIP tiers (operator view) ────────────────────────────────────────────────
export interface VipTierConfig {
  level: number; name: string; tierId: number; wagerThreshold: number;
  cashReward: number; commissionPct: number; rakebackPct: number; color: string;
}
export const VIP_TIER_CONFIG: VipTierConfig[] = [
  { level: 0, name: 'Bronze', tierId: 1, wagerThreshold: 0, cashReward: 0, commissionPct: 2, rakebackPct: 2, color: '#CD7F32' },
  { level: 1, name: 'Silver', tierId: 2, wagerThreshold: 100_000, cashReward: 25, commissionPct: 3, rakebackPct: 5, color: '#C0C0C0' },
  { level: 2, name: 'Gold', tierId: 3, wagerThreshold: 500_000, cashReward: 100, commissionPct: 5, rakebackPct: 8, color: '#F0B232' },
  { level: 3, name: 'Platinum', tierId: 4, wagerThreshold: 2_000_000, cashReward: 500, commissionPct: 7, rakebackPct: 12, color: '#E5E4E2' },
  { level: 4, name: 'Ruby', tierId: 5, wagerThreshold: 7_500_000, cashReward: 2_500, commissionPct: 10, rakebackPct: 16, color: '#10B981' },
  { level: 5, name: 'Obsidian', tierId: 6, wagerThreshold: 25_000_000, cashReward: 10_000, commissionPct: 15, rakebackPct: 20, color: '#8B5CF6' },
];

// PNL calculator rows (per time range) for the VIP tool.
export interface PnlRow {
  range: string; deposits: number; bonus: number; bet: number; ggr: number; ngr: number; marginPct: number;
}
export const PNL_SAMPLE: PnlRow[] = [
  { range: 'Last 24 Hours', deposits: 0, bonus: 10_126, bet: 160_000, ggr: -3_094, ngr: -13_220, marginPct: -23.4 },
  { range: 'Last 7 Days', deposits: 6_000, bonus: 10_340, bet: 229_272, ggr: 4_532, ngr: -5_807, marginPct: -128.1 },
  { range: 'Last 14 Days', deposits: 44_546, bonus: 16_898, bet: 744_621, ggr: 117_196, ngr: 100_298, marginPct: 85.6 },
  { range: 'Last Month', deposits: 44_546, bonus: 16_898, bet: 744_621, ggr: 117_196, ngr: 100_298, marginPct: 85.6 },
  { range: 'All Time', deposits: 2_635_289, bonus: 599_953, bet: 55_562_981, ggr: 2_564_057, ngr: 1_964_104, marginPct: 76.6 },
];

// ── Reports (tabular report registry) ────────────────────────────────────────
export interface ReportDef { id: string; name: string; group: string; description: string; }
export const REPORTS: ReportDef[] = [
  { id: 'rep_txn_bank', name: 'Transactions — Banking', group: 'Finance', description: 'All deposits/withdrawals by processor & method' },
  { id: 'rep_casino_txn', name: 'Casino Transactions', group: 'Finance', description: 'Wager/win ledger by game & provider' },
  { id: 'rep_redeem', name: 'Redeem Requests', group: 'Finance', description: 'Redemption pipeline & payout aging' },
  { id: 'rep_ggr', name: 'GGR / NGR', group: 'Revenue', description: 'Gross & net gaming revenue by period' },
  { id: 'rep_cohort', name: 'Cohort Retention', group: 'Growth', description: 'D1/D7/D30 retention by signup cohort' },
  { id: 'rep_funnel', name: 'Conversion Funnel', group: 'Growth', description: 'Signup → FTD → repeat purchase' },
  { id: 'rep_ltv', name: 'Player LTV', group: 'Growth', description: 'Lifetime value by tier & acquisition source' },
  { id: 'rep_bonus', name: 'Bonus Cost', group: 'Revenue', description: 'Bonus issuance vs wagering contribution' },
  { id: 'rep_tax', name: 'Tax Liability', group: 'Compliance', description: 'W-2G / 1099 reportable winnings' },
];
