export interface Transaction {
  id: string;
  type: 'buy' | 'redeem' | 'bonus' | 'rakeback' | 'vault_deposit' | 'vault_withdraw' | 'rain' | 'tip' | 'daily_bonus';
  currency: 'GC' | 'SC' | 'bonus';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
  method?: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx_001', type: 'buy', currency: 'GC', amount: 50000, status: 'completed', timestamp: '2026-05-21T14:22:00Z', description: 'Purchased Gold Coins Package', method: 'Card' },
  { id: 'tx_002', type: 'buy', currency: 'SC', amount: 5, status: 'completed', timestamp: '2026-05-21T14:22:00Z', description: 'Bonus Sweep Coins with purchase', method: 'Card' },
  { id: 'tx_003', type: 'daily_bonus', currency: 'GC', amount: 2500, status: 'completed', timestamp: '2026-05-21T08:00:00Z', description: 'Daily Login Bonus — Day 7 Streak' },
  { id: 'tx_004', type: 'rakeback', currency: 'bonus', amount: 1840, status: 'completed', timestamp: '2026-05-20T23:59:00Z', description: 'Daily Rakeback Reward (20%)' },
  { id: 'tx_005', type: 'vault_deposit', currency: 'GC', amount: 10000, status: 'completed', timestamp: '2026-05-20T16:30:00Z', description: 'Vault Deposit' },
  { id: 'tx_006', type: 'buy', currency: 'GC', amount: 100000, status: 'completed', timestamp: '2026-05-19T20:15:00Z', description: 'Purchased Gold Coins Package — Oasis Bundle', method: 'Crypto (ETH)' },
  { id: 'tx_007', type: 'buy', currency: 'SC', amount: 10, status: 'completed', timestamp: '2026-05-19T20:15:00Z', description: 'Bonus Sweep Coins with Oasis Bundle', method: 'Crypto (ETH)' },
  { id: 'tx_008', type: 'rain', currency: 'GC', amount: 500, status: 'completed', timestamp: '2026-05-19T18:45:00Z', description: 'GoldDuneKing sent a Rain of 500 GC' },
  { id: 'tx_009', type: 'daily_bonus', currency: 'GC', amount: 2500, status: 'completed', timestamp: '2026-05-19T08:00:00Z', description: 'Daily Login Bonus — Day 6 Streak' },
  { id: 'tx_010', type: 'vault_withdraw', currency: 'GC', amount: 5000, status: 'completed', timestamp: '2026-05-18T14:00:00Z', description: 'Vault Withdrawal + 5% Interest' },
  { id: 'tx_011', type: 'tip', currency: 'GC', amount: 200, status: 'completed', timestamp: '2026-05-18T11:30:00Z', description: 'Tip received from OasisHunter' },
  { id: 'tx_012', type: 'bonus', currency: 'bonus', amount: 5000, status: 'completed', timestamp: '2026-05-17T12:00:00Z', description: 'Welcome Bonus — First Purchase' },
  { id: 'tx_013', type: 'redeem', currency: 'SC', amount: 25, status: 'pending', timestamp: '2026-05-17T10:00:00Z', description: 'Sweep Coins Redemption — Pending KYC Review', method: 'Bank Transfer' },
  { id: 'tx_014', type: 'buy', currency: 'GC', amount: 25000, status: 'completed', timestamp: '2026-05-15T19:00:00Z', description: 'Purchased Gold Coins Package — Dune Pack', method: 'Card' },
  { id: 'tx_015', type: 'daily_bonus', currency: 'GC', amount: 2000, status: 'completed', timestamp: '2026-05-15T08:00:00Z', description: 'Daily Login Bonus — Day 4 Streak' },
];
