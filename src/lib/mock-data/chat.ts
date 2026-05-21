export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  vipTier: number;
  message: string;
  timestamp: string;
  isRain?: boolean;
  rainAmount?: number;
  currency?: 'GC' | 'SC';
  isTip?: boolean;
  tipAmount?: number;
  tipTo?: string;
}

export const MOCK_CHAT: ChatMessage[] = [
  { id: 'cm1', userId: 'u1', username: 'GoldDuneKing', avatar: 'GK', vipTier: 6, message: '🌴 Big win on Mirage Crash just now!', timestamp: '2026-05-21T14:28:00Z' },
  { id: 'cm2', userId: 'u2', username: 'OasisHunter', avatar: 'OH', vipTier: 5, message: 'hit 4.2x on that last round, insane run', timestamp: '2026-05-21T14:27:30Z' },
  { id: 'cm3', userId: 'u3', username: 'SandstormX', avatar: 'SX', vipTier: 4, message: 'can someone explain how the vault interest works?', timestamp: '2026-05-21T14:27:00Z' },
  { id: 'cm4', userId: 'u4', username: 'EmeraldDunes', avatar: 'ED', vipTier: 5, message: '@SandstormX you lock GC in the vault, it earns 5% daily. Its compounding', timestamp: '2026-05-21T14:26:45Z' },
  { id: 'cm5', userId: 'u1', username: 'GoldDuneKing', avatar: 'GK', vipTier: 6, message: '', timestamp: '2026-05-21T14:26:00Z', isRain: true, rainAmount: 5000, currency: 'GC' },
  { id: 'cm6', userId: 'u5', username: 'NightBazaar7', avatar: 'NB', vipTier: 3, message: 'rain!!!! 🌧️🌧️', timestamp: '2026-05-21T14:25:55Z' },
  { id: 'cm7', userId: 'u6', username: 'PyramidAce', avatar: 'PA', vipTier: 2, message: 'tysm GoldDuneKing legend', timestamp: '2026-05-21T14:25:50Z' },
  { id: 'cm8', userId: 'u7', username: 'DesertFox88', avatar: 'DF', vipTier: 5, message: 'those dune mines are lethal today, 3 mines on tile 2 twice in a row', timestamp: '2026-05-21T14:25:00Z' },
  { id: 'cm9', userId: 'u2', username: 'OasisHunter', avatar: 'OH', vipTier: 5, message: 'playing SC mode today, anyone else grinding the leaderboard?', timestamp: '2026-05-21T14:24:00Z' },
  { id: 'cm10', userId: 'u8', username: 'CaravanKing', avatar: 'CK', vipTier: 4, message: 'yes! 3rd place right now, trying to hold', timestamp: '2026-05-21T14:23:30Z' },
  { id: 'cm11', userId: 'u7', username: 'DesertFox88', avatar: 'DF', vipTier: 5, message: '', timestamp: '2026-05-21T14:23:00Z', isTip: true, tipAmount: 200, tipTo: 'NightBazaar7', currency: 'GC' },
  { id: 'cm12', userId: 'u5', username: 'NightBazaar7', avatar: 'NB', vipTier: 3, message: 'aww ty Desert Fox!! 🙏', timestamp: '2026-05-21T14:22:55Z' },
  { id: 'cm13', userId: 'u9', username: 'MirageRunner', avatar: 'MR', vipTier: 3, message: 'anyone in the rooms tonight? opening a GC room at 8pm ET', timestamp: '2026-05-21T14:22:00Z' },
  { id: 'cm14', userId: 'u4', username: 'EmeraldDunes', avatar: 'ED', vipTier: 5, message: 'ill be there 👌', timestamp: '2026-05-21T14:21:30Z' },
  { id: 'cm15', userId: 'u10', username: 'SahararWolf', avatar: 'SW', vipTier: 2, message: 'just claimed my daily bonus, 7 day streak 🔥', timestamp: '2026-05-21T14:20:00Z' },
  { id: 'cm16', userId: 'u3', username: 'SandstormX', avatar: 'SX', vipTier: 4, message: 'pharaoh towers is so addictive, lost 3 runs at level 8', timestamp: '2026-05-21T14:19:00Z' },
  { id: 'cm17', userId: 'u1', username: 'GoldDuneKing', avatar: 'GK', vipTier: 6, message: 'gotta know when to cash out on that one lol', timestamp: '2026-05-21T14:18:30Z' },
  { id: 'cm18', userId: 'u11', username: 'OasisQueen', avatar: 'OQ', vipTier: 1, message: 'just joined Yala today, this place is amazing', timestamp: '2026-05-21T14:17:00Z' },
  { id: 'cm19', userId: 'u7', username: 'DesertFox88', avatar: 'DF', vipTier: 5, message: 'welcome @OasisQueen! gl out there 🌴', timestamp: '2026-05-21T14:16:45Z' },
  { id: 'cm20', userId: 'u12', username: 'DuneStrider', avatar: 'DS', vipTier: 2, message: 'who is winning the weekly race this week?', timestamp: '2026-05-21T14:15:00Z' },
  { id: 'cm21', userId: 'u2', username: 'OasisHunter', avatar: 'OH', vipTier: 5, message: 'GoldDuneKing by a mile as always 😅', timestamp: '2026-05-21T14:14:30Z' },
  { id: 'cm22', userId: 'u8', username: 'CaravanKing', avatar: 'CK', vipTier: 4, message: 'this rakeback system is the best i have seen', timestamp: '2026-05-21T14:13:00Z' },
  { id: 'cm23', userId: 'u6', username: 'PyramidAce', avatar: 'PA', vipTier: 2, message: 'agreed, 20% as Desert Prince is crazy good', timestamp: '2026-05-21T14:12:00Z' },
  { id: 'cm24', userId: 'u1', username: 'GoldDuneKing', avatar: 'GK', vipTier: 6, message: 'Sheikh gets 25%, best tier in the game fr', timestamp: '2026-05-21T14:11:00Z' },
  { id: 'cm25', userId: 'u9', username: 'MirageRunner', avatar: 'MR', vipTier: 3, message: 'one day... one day 😤', timestamp: '2026-05-21T14:10:30Z' },
];
