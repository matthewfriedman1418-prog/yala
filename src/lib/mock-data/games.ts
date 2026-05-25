export type GameCategory =
  | 'originals'
  | 'slots'
  | 'live'
  | 'table'
  | 'megaways'
  | 'gameshows'
  | 'scratch'
  | 'fish'
  | 'casual';

export interface Game {
  id: string;
  slug: string;
  name: string;
  provider: string;
  category: GameCategory;
  rtp: number;
  isOriginal: boolean;
  isNew: boolean;
  isHot: boolean;
  maxWin: string;
  tags: string[];
  gradient: string;
  /** Optional cover image URL — used instead of gradient when set */
  imageUrl?: string;
}

export interface Original {
  slug: string;
  name: string;
  tagline: string;
  type: string;
  rtp: number;
  maxWin: string;
  minBet: number;
  houseEdge: number;
  description: string;
  gradient: string;
  imageUrl?: string;
  iconBg: string;
  rules: string[];
  fairnessNote: string;
}

export const YALA_ORIGINALS: Original[] = [
  {
    slug: 'caravan-cross',
    name: 'Caravan Cross',
    tagline: 'Walk your camel across the dunes. Cash out before the sandstorm hits.',
    type: 'Crash',
    rtp: 99.0,
    maxWin: '∞',
    minBet: 0.1,
    houseEdge: 1.0,
    description: 'A side-scrolling crash original. Your camel walks across the desert as the multiplier rises. A sandstorm forms on the horizon ~1.5 seconds before bust — that\'s your window to cash out. Same provably-fair math as Crash, but the bust is foreshadowed.',
    imageUrl: 'https://picsum.photos/seed/caravan-cross/300/450',
    gradient: 'from-amber-800 via-orange-900 to-red-950',
    iconBg: 'bg-amber-900',
    rules: [
      'Set your bet and (optional) auto cash-out multiplier, then press Bet.',
      'Your camel walks across the dunes. The multiplier rises from 1.00× and grows over time.',
      'A sandstorm appears on the horizon about 1.5 seconds before the bust point — that is your reaction window.',
      'Cash out at any time to lock in your current multiplier (bet × multiplier paid out).',
      'If the storm engulfs your camel before you cash out, your bet is lost.',
      'Auto cash-out fires automatically if your set multiplier is reached.',
    ],
    fairnessNote: 'Caravan Cross uses the standard Crash bust distribution: bust = max(1.00, 0.99 / (1 - r)) where r is a uniform random in [0, 1). 1% house edge, 99% RTP, occasional 1.00× insta-crash. Each round\'s seed is shown after the round ends.',
  },
  {
    slug: 'mirage-auction',
    name: 'Mirage Auction',
    tagline: 'Outbid three desert bandits for the oasis. Pay too much and bust.',
    type: 'Auction',
    rtp: 99.0,
    maxWin: '450×',
    minBet: 1,
    houseEdge: 1.0,
    description: 'A hidden-information auction game. You and three AI bandits — Greedy, Cautious, Bluffer — each hold a face-down card worth 1–99. Over four rounds you each submit a bid. Highest total bid wins the oasis. Multiplier scales by how close to your card\'s true value you won.',
    imageUrl: 'https://picsum.photos/seed/mirage-auction/300/450',
    gradient: 'from-purple-900 via-indigo-950 to-amber-950',
    iconBg: 'bg-indigo-900',
    rules: [
      'You and three AI bandits each receive a hidden card valued 1–99. Only you see yours.',
      'In each of 4 bid rounds, all 4 players bid simultaneously. Bids reveal after the round.',
      'Highest TOTAL bid across the four rounds wins the auction.',
      'Multiplier = (your card value ÷ your total bid) × 4.5.',
      'If your total bid is MORE than your card value, you bust (overpaid for the oasis).',
      'If a bandit wins instead of you, you bust.',
      'Each bandit has a different personality — read them to predict their bids.',
    ],
    fairnessNote: 'Each bandit\'s hidden card and bidding randomness use a provably fair seed shown after the round. Personalities: Greedy (frontloads, bids 18–30% of card per round), Cautious (sandbags, 8–15%), Bluffer (60% low / 40% high). The 4.5× multiplier constant is tuned to land at 99% RTP under balanced player strategy.',
  },
  {
    slug: 'trail',
    name: 'Trail',
    tagline: 'Draw your path. Avoid the hazards. Cash out before you get boxed in.',
    type: 'Trail',
    rtp: 99.0,
    maxWin: '5000×',
    minBet: 0.1,
    houseEdge: 1.0,
    description: 'A Yala original. Pick a starting edge tile and extend your path one orthogonal step at a time. Each safe tile bumps your multiplier. Hit a hazard and the trail goes dark. Reach the opposite edge for a +50% jackpot bonus.',
    imageUrl: 'https://picsum.photos/seed/trail-game/300/450',
    gradient: 'from-emerald-900 via-emerald-950 to-amber-950',
    iconBg: 'bg-emerald-900',
    rules: [
      'Set your bet and pick a difficulty (3, 5, or 8 hazards on a 6×6 grid).',
      'Click any EDGE tile to start your trail.',
      'Each next tile must be orthogonally adjacent (up / down / left / right) to your last tile.',
      'Safe tile = multiplier ticks up. Hazard = bust, your bet is lost.',
      'Cash out any time to lock in your current multiplier.',
      'Reach a tile on the OPPOSITE edge from your start tile for a +50% jackpot bonus.',
    ],
    fairnessNote: 'Trail uses a provably fair seed. Hazard locations are determined before your first reveal from a hash of (server seed + client seed + nonce). The starting tile is always safe.',
  },
  {
    slug: 'mirage-crash',
    name: 'Yala Crash',
    tagline: 'Watch the multiplier soar. Cash out before it crashes.',
    type: 'Crash',
    rtp: 99.0,
    maxWin: '∞',
    minBet: 1,
    houseEdge: 1.0,
    description: 'A hypnotic crash game set in the shimmering heat of the desert. The multiplier climbs as the mirage rises. but vanish before it crashes.',
    imageUrl: 'https://picsum.photos/seed/mirage-crash/300/450',
    gradient: 'from-amber-900 via-orange-800 to-yellow-700',
    iconBg: 'bg-amber-900',
    rules: [
      'Place your bet before the round begins.',
      'The multiplier rises from 1.00× and increases over time.',
      'Cash out at any point to lock in your multiplier.',
      'If the mirage crashes before you cash out, your bet is lost.',
      'Auto cash-out can be set at any multiplier before the round starts.',
    ],
    fairnessNote: 'Mirage Crash uses a provably fair system. Each round seed is derived from a SHA-256 hash of the server seed combined with the client seed. You can verify any result using the verification tool.',
  },
  {
    slug: 'oasis-plinko',
    name: 'Neon Plinko',
    tagline: 'Drop your coin. Watch fortune flow.',
    type: 'Plinko',
    rtp: 99.0,
    maxWin: '1000×',
    minBet: 0.1,
    houseEdge: 1.0,
    description: 'A serene Plinko experience inspired by the emerald pools of a desert oasis. Choose your risk level, drop your coin, and follow it to fortune.',
    imageUrl: 'https://picsum.photos/seed/oasis-plinko/300/450',
    gradient: 'from-emerald-950 via-teal-900 to-emerald-800',
    iconBg: 'bg-emerald-900',
    rules: [
      'Select your bet amount and risk level (Low, Medium, High).',
      'Choose the number of rows (8 to 16).',
      'Click Drop to release the coin.',
      'The coin bounces between pegs and lands in a prize bucket.',
      'Higher risk = higher potential rewards but lower probability of landing in top buckets.',
    ],
    fairnessNote: 'Each drop path is determined by a cryptographically secure random seed. The full path can be verified after each round.',
  },
  {
    slug: 'dune-mines',
    name: 'Gold Mines',
    tagline: 'Navigate the grid. Avoid mines, claim the gold.',
    type: 'Mines',
    rtp: 99.0,
    maxWin: '2000×',
    minBet: 0.1,
    houseEdge: 1.0,
    description: 'A 5×5 grid of sand dunes hides both buried treasure and lethal scorpion nests. Choose your path carefully.',
    imageUrl: 'https://picsum.photos/seed/dune-mines/300/450',
    gradient: 'from-yellow-950 via-amber-900 to-stone-800',
    iconBg: 'bg-yellow-900',
    rules: [
      'Choose how many mines are hidden in the 5×5 grid (1–24).',
      'Click tiles to reveal safe gems. each safe tile increases your multiplier.',
      'Hit a mine and your bet is lost.',
      'Cash out any time before hitting a mine to claim your winnings.',
      'More mines = higher multiplier per safe tile revealed.',
    ],
    fairnessNote: 'Mine positions are determined by a provably fair algorithm before your first tile selection.',
  },
  {
    slug: 'golden-dice',
    name: 'Golden Dice',
    tagline: 'Set your target. Roll the gold. Beat the odds.',
    type: 'Dice',
    rtp: 99.0,
    maxWin: '9900×',
    minBet: 0.01,
    houseEdge: 1.0,
    description: 'A classic dice game wrapped in desert gold. Predict over or under and adjust your win chance to find the perfect risk/reward balance.',
    imageUrl: 'https://picsum.photos/seed/golden-dice/300/450',
    gradient: 'from-yellow-800 via-gold-900 to-amber-950',
    iconBg: 'bg-yellow-800',
    rules: [
      'Set your win chance using the slider (2% to 98%).',
      'Choose Over or Under.',
      'Click Roll. if the dice lands in your predicted range, you win.',
      'Higher win chance = lower payout; lower win chance = higher payout.',
      'Multiplier is automatically calculated: (100 - house edge) / win chance.',
    ],
    fairnessNote: 'Each roll generates a result from 0.00 to 99.99 using an HMAC-SHA512 hash of server seed + client seed + nonce.',
  },
  {
    slug: 'sandstorm-limbo',
    name: 'Hyper Limbo',
    tagline: 'Set your multiplier. Beat the odds.',
    type: 'Limbo',
    rtp: 99.0,
    maxWin: '1,000,000×',
    minBet: 0.01,
    houseEdge: 1.0,
    description: 'Name your multiplier and challenge the sandstorm. If the result lands at or above your target, you win that exact multiplier.',
    imageUrl: 'https://picsum.photos/seed/sandstorm-limbo/300/450',
    gradient: 'from-stone-900 via-amber-950 to-yellow-950',
    iconBg: 'bg-stone-800',
    rules: [
      'Enter your target multiplier (1.01× to 1,000,000×).',
      'Click Roll. if the result is ≥ your target, you win.',
      'Higher target = lower chance of winning but higher payout.',
      'Minimum target is 1.01×.',
      'Auto-bet allows you to set number of rounds and profit/loss limits.',
    ],
    fairnessNote: 'Results use a provably fair RNG. Verify any result with the hash and seed system in your profile.',
  },
  {
    slug: 'emerald-wheel',
    name: 'Emerald Wheel',
    tagline: 'Spin the jewel. One wheel, infinite fortunes.',
    type: 'Wheel',
    rtp: 99.0,
    maxWin: '49.5×',
    minBet: 0.1,
    houseEdge: 1.0,
    description: 'A radiant emerald fortune wheel with multiple risk levels. Simple, elegant, and surprisingly deep.',
    imageUrl: 'https://picsum.photos/seed/emerald-wheel/300/450',
    gradient: 'from-emerald-950 via-green-900 to-teal-900',
    iconBg: 'bg-emerald-800',
    rules: [
      'Select your risk level: Low, Medium, or High.',
      'Choose the number of segments (10, 20, 30, 40, or 50).',
      'Click Spin and watch the emerald wheel determine your fate.',
      'Green segments are wins; dark segments are losses.',
      'Higher risk = fewer winning segments but higher multipliers.',
    ],
    fairnessNote: 'Spin results are generated from a provably fair hash. Each segment position is mathematically verifiable.',
  },
  {
    slug: 'caravan-keno',
    name: 'Royal Keno',
    tagline: 'Pick your numbers. Chart your path to fortune.',
    type: 'Keno',
    rtp: 96.0,
    maxWin: '10,000×',
    minBet: 0.1,
    houseEdge: 4.0,
    description: 'A Keno game set on an ancient desert trade map. Pick your stops on the caravan route and wait for the sand to reveal your fortune.',
    imageUrl: 'https://picsum.photos/seed/caravan-keno/300/450',
    gradient: 'from-amber-950 via-orange-950 to-yellow-950',
    iconBg: 'bg-amber-900',
    rules: [
      'Select 1–10 numbers from the grid of 40.',
      'The game draws 20 numbers randomly.',
      'Winnings depend on how many of your picks are drawn.',
      'More selections = higher maximum potential win but harder to hit.',
      'Payout tables are shown before each round.',
    ],
    fairnessNote: 'Numbers are drawn using a provably fair algorithm. All 40 starting positions are shuffled with a verified seed.',
  },
  {
    slug: 'night-bazaar-blackjack',
    name: 'Midnight Blackjack',
    tagline: 'Outsmart the dealer. Hit 21 or bust.',
    type: 'Blackjack',
    rtp: 99.5,
    maxWin: '3×',
    minBet: 0.5,
    houseEdge: 0.5,
    description: 'Classic blackjack wrapped in the mysterious glow of a midnight bazaar. Standard rules with split, double, and insurance.',
    imageUrl: 'https://picsum.photos/seed/night-bazaar-blackjack/300/450',
    gradient: 'from-slate-950 via-indigo-950 to-blue-950',
    iconBg: 'bg-slate-800',
    rules: [
      'Try to beat the dealer without exceeding 21.',
      'Hit: take another card. Stand: keep your current total.',
      'Double Down: double your bet and receive exactly one more card.',
      'Split: if you have two cards of the same value, split them into two hands.',
      'Blackjack (Ace + 10-value card) pays 3:2.',
      'Dealer hits on soft 16 and below, stands on soft 17 and above.',
    ],
    fairnessNote: 'Card dealing uses a 6-deck shoe shuffled with a provably fair seed at the start of each shoe.',
  },
  {
    slug: 'pharaoh-towers',
    name: 'Tower Rush',
    tagline: 'Climb higher. Each level reveals a greater reward.',
    type: 'Tower',
    rtp: 99.0,
    maxWin: '2000×',
    minBet: 0.1,
    houseEdge: 1.0,
    description: 'An ascending tower game built into the chambers of an ancient pyramid. Choose your path upward. but one wrong step ends the ascent.',
    imageUrl: 'https://picsum.photos/seed/pharaoh-towers/300/450',
    gradient: 'from-yellow-950 via-amber-900 to-orange-950',
    iconBg: 'bg-yellow-900',
    rules: [
      'Each row of the pyramid contains multiple tiles, one of which is a trap.',
      'Click a safe tile to ascend to the next level.',
      'Each level increases your multiplier.',
      'Choose Easy, Medium, or Hard difficulty to adjust the number of traps per row.',
      'Cash out at any level or aim for the top for the maximum multiplier.',
    ],
    fairnessNote: 'Trap positions are determined before you begin climbing, using a verifiable seed hash.',
  },
  {
    slug: 'oasis-hi-lo',
    name: 'Hi-Lo Pro',
    tagline: 'Higher or lower? Read the cards and trust your instinct.',
    type: 'Hi-Lo',
    rtp: 99.0,
    maxWin: '12×',
    minBet: 0.1,
    houseEdge: 1.0,
    description: 'A card prediction game set against the shimmering backdrop of a desert oasis. Predict whether the next card will be higher or lower.',
    imageUrl: 'https://picsum.photos/seed/oasis-hi-lo/300/450',
    gradient: 'from-teal-950 via-emerald-950 to-green-900',
    iconBg: 'bg-teal-900',
    rules: [
      'A card from a standard 52-card deck is drawn.',
      'Predict whether the next card will be Higher, Lower, or Equal (Skip).',
      'A correct prediction multiplies your current winnings.',
      'Cash out at any point to secure your winnings.',
      'Choosing "Equal" skips the current card without risking your balance.',
    ],
    fairnessNote: 'The card sequence is pre-determined by a provably fair seed and can be verified after your session.',
  },
  {
    slug: 'desert-roulette',
    name: 'Yala Roulette',
    tagline: 'The wheel turns. Fortune favors the bold.',
    type: 'Roulette',
    rtp: 97.3,
    maxWin: '35×',
    minBet: 0.1,
    houseEdge: 2.7,
    description: 'European single-zero roulette set in the grandeur of a desert palace casino room. Timeless elegance, provably fair.',
    imageUrl: 'https://picsum.photos/seed/desert-roulette/300/450',
    gradient: 'from-red-950 via-rose-950 to-stone-900',
    iconBg: 'bg-red-900',
    rules: [
      'Place chips on numbers (0–36), colors (red/black), or combinations.',
      'Single number pays 35:1. Red/Black pays 1:1.',
      'Street (3 numbers) pays 11:1. Corner (4 numbers) pays 8:1.',
      'Column and Dozen bets pay 2:1.',
      'Single zero (0) is the house advantage.',
    ],
    fairnessNote: 'Wheel spin results are derived from a provably fair algorithm. The zero-indexed position of the ball is cryptographically verifiable.',
  },
  {
    slug: 'scorpion-cases',
    name: 'Lucky Cases',
    tagline: 'Choose your case. Unbox the treasure.',
    type: 'Cases',
    rtp: 90.0,
    maxWin: '5000×',
    minBet: 0.5,
    houseEdge: 10.0,
    description: 'Desert-themed case opening with a curated loot table. Each case contains prizes from bonus gold coins to massive jackpot multipliers.',
    imageUrl: 'https://picsum.photos/seed/scorpion-cases/300/450',
    gradient: 'from-stone-950 via-amber-950 to-yellow-950',
    iconBg: 'bg-stone-800',
    rules: [
      'Select a case tier (Bronze, Silver, Gold, or Obsidian).',
      'Purchase the case for the listed price.',
      'Click Open to reveal your prize.',
      'Prizes range from small coin bonuses to jackpot multipliers.',
      'All possible prizes and their probabilities are shown before purchase.',
    ],
    fairnessNote: 'Prize selection is determined by a provably fair roll. The full prize pool and probabilities are transparent and verifiable.',
  },
];

const SS = 'https://cdn.softswiss.net/i/s4';

const SLOT_GAMES: Game[] = [
  { id: 'g1', slug: 'golden-scarab', name: 'Golden Scarab Megaways', provider: 'Hacksaw Gaming', category: 'megaways', rtp: 96.36, isOriginal: false, isNew: true, isHot: true, maxWin: '50,000×', tags: ['megaways', 'bonus buy', 'high volatility'], imageUrl: `${SS}/playngo/book_dead.webp`, gradient: 'from-amber-700 to-yellow-900' },
  { id: 'g2', slug: 'desert-storm-deluxe', name: 'Storm Surge Deluxe', provider: 'NoLimit City', category: 'slots', rtp: 96.06, isOriginal: false, isNew: false, isHot: true, maxWin: '45,000×', tags: ['high volatility', 'xways'], imageUrl: `${SS}/nolimitcity/deadwood.webp`, gradient: 'from-orange-800 to-amber-950' },
  { id: 'g3', slug: 'nile-cash', name: 'Nile Cash', provider: 'Push Gaming', category: 'slots', rtp: 96.5, isOriginal: false, isNew: false, isHot: false, maxWin: '30,000×', tags: ['cluster pays'], imageUrl: `${SS}/pushgaming/jammin_jars.webp`, gradient: 'from-blue-900 to-teal-950' },
  { id: 'g4', slug: 'camel-rush-hold', name: 'Wild Rush Hold & Win', provider: 'Pragmatic Play', category: 'slots', rtp: 96.47, isOriginal: false, isNew: true, isHot: false, maxWin: '25,000×', tags: ['hold and win', 'respins'], imageUrl: `${SS}/pragmaticplay/vs20trsbox.webp`, gradient: 'from-yellow-800 to-orange-900' },
  { id: 'g5', slug: 'midnight-oasis', name: 'Midnight Glow', provider: 'Relax Gaming', category: 'slots', rtp: 96.1, isOriginal: false, isNew: false, isHot: true, maxWin: '20,000×', tags: ['expanding wilds', 'free spins'], imageUrl: `${SS}/netent/starburst.webp`, gradient: 'from-indigo-900 to-blue-950' },
  { id: 'g6', slug: 'pharaoh-fortune', name: "Pharaoh's Fortune", provider: 'NetEnt', category: 'slots', rtp: 96.5, isOriginal: false, isNew: false, isHot: false, maxWin: '10,000×', tags: ['classic', 'wilds'], imageUrl: `${SS}/pragmaticplay/vs10bookoftut.webp`, gradient: 'from-yellow-700 to-amber-900' },
  { id: 'g7', slug: 'fire-of-egypt', name: 'Fire of Egypt', provider: 'Push Gaming', category: 'slots', rtp: 96.5, isOriginal: false, isNew: false, isHot: true, maxWin: '150,000×', tags: ['hold & spin', 'hot shot'], imageUrl: `${SS}/playngo/fire_joker.webp`, gradient: 'from-red-800 to-orange-950' },
  { id: 'g8', slug: 'sand-princess', name: 'Crystal Princess', provider: 'Red Tiger', category: 'slots', rtp: 96.05, isOriginal: false, isNew: true, isHot: false, maxWin: '5,000×', tags: ['princess', 'free spins'], imageUrl: `${SS}/pragmaticplay/vs20starlight.webp`, gradient: 'from-pink-800 to-rose-950' },
  { id: 'g9', slug: 'dunes-of-gold', name: 'Peaks of Gold Megaways', provider: 'Big Time Gaming', category: 'megaways', rtp: 96.4, isOriginal: false, isNew: false, isHot: true, maxWin: '30,000×', tags: ['megaways', 'cascades'], imageUrl: `${SS}/bigtimegaming/bonanza_megaways.webp`, gradient: 'from-amber-600 to-yellow-800' },
  { id: 'g10', slug: 'arabian-nights-deluxe', name: 'Arabian Nights Deluxe', provider: 'Thunderkick', category: 'slots', rtp: 96.6, isOriginal: false, isNew: false, isHot: false, maxWin: '8,000×', tags: ['wilds', 'respins'], imageUrl: `${SS}/thunderkick/1429_uncharted_seas.webp`, gradient: 'from-purple-900 to-indigo-950' },
  { id: 'g11', slug: 'sultan-riches', name: 'Sultan Riches', provider: 'Pragmatic Play', category: 'slots', rtp: 96.47, isOriginal: false, isNew: true, isHot: true, maxWin: '25,000×', tags: ['tumbling', 'multipliers'], imageUrl: `${SS}/pragmaticplay/vs20olympgate.webp`, gradient: 'from-emerald-800 to-green-950' },
  { id: 'g12', slug: 'bazaar-bonanza', name: 'Bazaar Bonanza', provider: 'NoLimit City', category: 'slots', rtp: 96.06, isOriginal: false, isNew: false, isHot: false, maxWin: '60,000×', tags: ['xpays', 'bonus spins'], imageUrl: `${SS}/pragmaticplay/vs20midas.webp`, gradient: 'from-teal-800 to-cyan-950' },
  { id: 'g13', slug: 'lost-city-riches', name: 'Lost City Riches', provider: 'Hacksaw Gaming', category: 'slots', rtp: 96.36, isOriginal: false, isNew: true, isHot: false, maxWin: '20,000×', tags: ['feature drop', 'multipliers'], imageUrl: `${SS}/hacksawgaming/wanted_dead_or_a_wild.webp`, gradient: 'from-stone-700 to-amber-900' },
  { id: 'g14', slug: 'camel-quest', name: 'Quest for Gold Megaways', provider: 'Relax Gaming', category: 'megaways', rtp: 96.2, isOriginal: false, isNew: false, isHot: true, maxWin: '40,000×', tags: ['megaways', 'bonus'], imageUrl: `${SS}/relaxgaming/temple_tumble_megaways.webp`, gradient: 'from-orange-700 to-red-900' },
  { id: 'g15', slug: 'jewels-of-cairo', name: 'Jewels of Cairo', provider: 'Push Gaming', category: 'slots', rtp: 96.8, isOriginal: false, isNew: false, isHot: false, maxWin: '15,000×', tags: ['grid slot', 'jewels'], imageUrl: `${SS}/pushgaming/jammin_jars_2.webp`, gradient: 'from-blue-800 to-purple-950' },
  { id: 'g16', slug: 'falcon-fury', name: 'Falcon Fury', provider: 'Big Time Gaming', category: 'megaways', rtp: 96.4, isOriginal: false, isNew: true, isHot: true, maxWin: '50,000×', tags: ['megaways', 'reactions'], imageUrl: `${SS}/bigtimegaming/white_rabbit_megaways.webp`, gradient: 'from-sky-800 to-blue-950' },
];

const TABLE_GAMES: Game[] = [
  { id: 'tg1', slug: 'royal-baccarat', name: 'Royal Baccarat', provider: 'Yala Studios', category: 'table', rtp: 98.94, isOriginal: false, isNew: false, isHot: true, maxWin: '8×', tags: ['baccarat', 'classic'], imageUrl: `${SS}/evolution/BaccaratA.webp`, gradient: 'from-green-900 to-emerald-950' },
  { id: 'tg2', slug: 'desert-baccarat', name: 'Desert Point Baccarat', provider: 'Yala Studios', category: 'table', rtp: 98.76, isOriginal: false, isNew: false, isHot: false, maxWin: '11×', tags: ['baccarat', 'side bets'], imageUrl: `${SS}/evolution/BaccaratNoCommission.webp`, gradient: 'from-amber-900 to-green-950' },
  { id: 'tg3', slug: 'oasis-poker', name: 'Oasis Poker', provider: 'Yala Studios', category: 'table', rtp: 99.0, isOriginal: false, isNew: true, isHot: false, maxWin: '100×', tags: ['poker', 'caribbean'], imageUrl: `${SS}/evolution/CasinoHoldem.webp`, gradient: 'from-teal-900 to-emerald-950' },
  { id: 'tg4', slug: 'sand-dune-craps', name: 'Classic Craps', provider: 'Yala Studios', category: 'table', rtp: 98.6, isOriginal: false, isNew: false, isHot: false, maxWin: '30×', tags: ['craps', 'dice'], imageUrl: `${SS}/evolution/Craps.webp`, gradient: 'from-stone-800 to-amber-950' },
];

const LIVE_GAMES: Game[] = [
  { id: 'lg1', slug: 'live-roulette-vip', name: 'VIP Roulette Live', provider: 'Evolution', category: 'live', rtp: 97.3, isOriginal: false, isNew: false, isHot: true, maxWin: '35×', tags: ['live', 'roulette', 'vip'], imageUrl: `${SS}/evolution/Roulette.webp`, gradient: 'from-red-900 to-rose-950' },
  { id: 'lg2', slug: 'live-blackjack-private', name: 'Private Suite Blackjack', provider: 'Evolution', category: 'live', rtp: 99.5, isOriginal: false, isNew: false, isHot: true, maxWin: '3×', tags: ['live', 'blackjack', 'exclusive'], imageUrl: `${SS}/evolution/BlackjackVIP_A.webp`, gradient: 'from-slate-800 to-indigo-950' },
  { id: 'lg3', slug: 'live-baccarat-gold', name: 'Gold Salon Baccarat', provider: 'Evolution', category: 'live', rtp: 98.94, isOriginal: false, isNew: true, isHot: false, maxWin: '8×', tags: ['live', 'baccarat'], imageUrl: `${SS}/evolution/GoldenWealthBaccarat.webp`, gradient: 'from-yellow-900 to-amber-950' },
  { id: 'lg4', slug: 'live-crazy-time', name: 'Fortune Wheel Live', provider: 'Evolution', category: 'live', rtp: 96.08, isOriginal: false, isNew: false, isHot: true, maxWin: '20,000×', tags: ['live', 'game show'], imageUrl: `${SS}/evolution/CrazyTime.webp`, gradient: 'from-purple-800 to-pink-950' },
];

const GAMESHOW_GAMES: Game[] = [
  { id: 'gs1', slug: 'wheel-of-gold', name: 'Wheel of Gold Live', provider: 'Evolution', category: 'gameshows', rtp: 96.5, isOriginal: false, isNew: false, isHot: true, maxWin: '500×', tags: ['game show', 'wheel'], imageUrl: `${SS}/evolution/DreamCatcher.webp`, gradient: 'from-yellow-700 to-orange-900' },
  { id: 'gs2', slug: 'lightning-storm', name: 'Lightning Storm Roulette', provider: 'Evolution', category: 'gameshows', rtp: 97.1, isOriginal: false, isNew: true, isHot: true, maxWin: '500×', tags: ['game show', 'lightning'], imageUrl: `${SS}/evolution/LightningRoulette.webp`, gradient: 'from-blue-700 to-purple-900' },
  { id: 'gs3', slug: 'sahara-deal', name: 'Deal or No Deal Live', provider: 'Evolution', category: 'gameshows', rtp: 95.5, isOriginal: false, isNew: false, isHot: false, maxWin: '500,000×', tags: ['game show', 'deal'], imageUrl: `${SS}/evolution/DealOrNoDeal.webp`, gradient: 'from-green-800 to-teal-950' },
];

const SCRATCH_GAMES: Game[] = [
  { id: 'sc1', slug: 'golden-sands-scratch', name: 'Gold Rush Scratch', provider: 'Hacksaw Gaming', category: 'scratch', rtp: 95.0, isOriginal: false, isNew: false, isHot: false, maxWin: '1,000×', tags: ['scratch', 'instant win'], imageUrl: `${SS}/hacksawgaming/chaos_crew_2.webp`, gradient: 'from-yellow-600 to-amber-800' },
  { id: 'sc2', slug: 'oasis-treasures', name: 'Oasis Treasures Scratch', provider: 'Relax Gaming', category: 'scratch', rtp: 96.0, isOriginal: false, isNew: true, isHot: false, maxWin: '500×', tags: ['scratch', 'instant'], imageUrl: `${SS}/relaxgaming/money_train_2.webp`, gradient: 'from-green-700 to-emerald-900' },
];

const FISH_GAMES: Game[] = [
  { id: 'fg1', slug: 'desert-hunter', name: "Hunter's Gold", provider: 'Pragmatic Play', category: 'fish', rtp: 96.0, isOriginal: false, isNew: false, isHot: true, maxWin: '1,000×', tags: ['fish', 'shooting', 'arcade'], imageUrl: `${SS}/pragmaticplay/vs15godsofwar.webp`, gradient: 'from-blue-800 to-teal-900' },
  { id: 'fg2', slug: 'nile-fishing', name: 'Nile Fishing Frenzy', provider: 'Red Tiger', category: 'fish', rtp: 96.5, isOriginal: false, isNew: true, isHot: false, maxWin: '800×', tags: ['fish', 'casual', 'arcade'], imageUrl: `${SS}/pragmaticplay/vs20rhinoluxe.webp`, gradient: 'from-cyan-800 to-blue-950' },
];

const CASUAL_GAMES: Game[] = [
  { id: 'cg1', slug: 'sand-road', name: 'Sky Crash Aviator', provider: 'Yala Studios', category: 'casual', rtp: 97.0, isOriginal: false, isNew: false, isHot: true, maxWin: '∞', tags: ['casual', 'crash'], imageUrl: `${SS}/spribe/aviator.webp`, gradient: 'from-orange-700 to-red-900' },
  { id: 'cg2', slug: 'caravan-joust', name: 'Caravan Joust', provider: 'Hacksaw Gaming', category: 'casual', rtp: 96.0, isOriginal: false, isNew: true, isHot: false, maxWin: '2,000×', tags: ['casual', 'grid'], imageUrl: `${SS}/hacksawgaming/chaos_crew.webp`, gradient: 'from-amber-700 to-stone-900' },
];

export const ALL_GAMES: Game[] = [
  ...SLOT_GAMES,
  ...TABLE_GAMES,
  ...LIVE_GAMES,
  ...GAMESHOW_GAMES,
  ...SCRATCH_GAMES,
  ...FISH_GAMES,
  ...CASUAL_GAMES,
];

export const ALL_PROVIDERS = [
  { name: 'NoLimit City', slug: 'nolimit-city', count: 48 },
  { name: 'Pragmatic Play', slug: 'pragmatic-play', count: 120 },
  { name: 'Evolution', slug: 'evolution', count: 80 },
  { name: 'Push Gaming', slug: 'push-gaming', count: 35 },
  { name: 'Hacksaw Gaming', slug: 'hacksaw-gaming', count: 55 },
  { name: 'Relax Gaming', slug: 'relax-gaming', count: 40 },
  { name: 'NetEnt', slug: 'netent', count: 90 },
  { name: 'Red Tiger', slug: 'red-tiger', count: 70 },
  { name: 'Big Time Gaming', slug: 'big-time-gaming', count: 25 },
  { name: 'Thunderkick', slug: 'thunderkick', count: 30 },
  { name: 'Yala Studios', slug: 'yala-studios', count: 12 },
  { name: 'Play\'n GO', slug: 'playngo', count: 85 },
];
