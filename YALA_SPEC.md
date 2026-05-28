# YALA — Full Implementation Spec
*Premium Desert Sweepstakes Social Casino*
*Generated: 2026-05-21*

---

## 1. Brand Identity

**Name:** Yala  
**Positioning:** Luxury desert sweepstakes casino — the private resort where the dunes meet the jackpot.  
**Tone:** Abu Dhabi desert luxury meets deep product gamification. Serious, premium, confident.  
**Feel:** Obsidian nights, gold dust, emerald oasis glow. Not cartoonish. Not "Arabian nights" cosplay. Think: architecture, candlelight, weight.

### Color System
```css
--obsidian: #050505;    /* main bg */
--charcoal: #101010;    /* panels/cards */
--sand: #B9915A;        /* borders, secondary accent */
--light-sand: #E3C78A;  /* highlights */
--gold: #D6A84F;        /* GC mode primary accent */
--emerald: #10B981;     /* SC mode primary / wins */
--dark-emerald: #064E3B;
--bone: #F5E8C8;        /* light text */
--muted: #9CA3AF;       /* muted text */
--panel: #111111;       /* glassmorphism base */
```

### Typography
- Headings: `font-display` → system serif with letter-spacing (Playfair Display via Google Fonts)
- Body: `font-sans` → Inter
- Numbers/data: `font-mono` → JetBrains Mono

### Currency Color Rules
| Currency | Icon | Color | Mode Accent |
|---|---|---|---|
| Gold Coins (GC) | ◈ | #D6A84F gold | Yellow/gold UI |
| Sweep Coins (SC) | ◇ | #10B981 emerald | Green UI |
| Bonus Balance | ⊕ | #F59E0B orange | — |
| Rakeback | ↩ | #8B5CF6 purple | feeds Bonus |
| XP Points | ★ | #6366F1 indigo | — |
| Vault | 🏛 | #3B82F6 blue | — |

---

## 2. Sitemap

```
/                          Landing page (logged out hero)
/casino                    Casino lobby (main home when logged in)
/casino/[provider]         Provider filtered lobby
/originals                 Yala Originals hub
/originals/[slug]          Individual original game page
/sportsbook                Sportsbook placeholder
/wallet                    Wallet overview
/wallet/buy                Buy coins flow
/wallet/redeem             Redeem SC flow (KYC gated)
/wallet/crypto             Crypto deposit/withdraw placeholder
/vault                     Vault (lock GC for interest)
/vip                       VIP Club page
/rakeback                  Rakeback calculator + claim
/rewards                   Rewards hub
/daily-bonus               Daily bonus + wheel
/missions                  Missions & quests
/leaderboards              Leaderboards
/promotions                Promotions listing
/affiliate                 Affiliate & creator codes dashboard
/rooms                     Rooms / play together hub
/rooms/[id]                Individual room
/profile                   User profile
/profile/transactions      Transaction history
/responsible-gaming        Responsible gaming tools
/kyc                       KYC / verification flow
/providers                 Game providers directory
/support                   Help center
/terms                     Terms of Service
/privacy                   Privacy Policy
/sweepstakes-rules         Official Sweepstakes Rules
```

---

## 3. VIP Tier System (Desert Themed)

| Tier | Name | XP Required | Rakeback | Color |
|---|---|---|---|---|
| 1 | Wanderer | 0 | 5% | Bronze #CD7F32 |
| 2 | Nomad | 10,000 | 8% | Silver #C0C0C0 |
| 3 | Oasis Seeker | 50,000 | 12% | Gold #D6A84F |
| 4 | Caravan Lord | 200,000 | 16% | Platinum #E5E4E2 |
| 5 | Desert Prince | 750,000 | 20% | Emerald #10B981 |
| 6 | Sheikh | 2,000,000+ | 25% | Obsidian/Gold #050505+#D6A84F |

---

## 4. Yala Originals

| Slug | Name | Type | Icon/Theme |
|---|---|---|---|
| mirage-crash | Mirage Crash | Crash | heat-shimmer desert |
| oasis-plinko | Oasis Plinko | Plinko | waterfall/oasis |
| dune-mines | Dune Mines | Mines | sand dune grid |
| golden-dice | Golden Dice | Dice | gold faceted dice |
| sandstorm-limbo | Sandstorm Limbo | Limbo | storm multiplier |
| emerald-wheel | Emerald Wheel | Wheel | emerald fortune wheel |
| caravan-keno | Caravan Keno | Keno | desert caravan map |
| night-bazaar-blackjack | Night Bazaar Blackjack | Blackjack | midnight market |
| pharaoh-towers | Pharaoh Towers | Tower | pyramid levels |
| oasis-hi-lo | Oasis Hi-Lo | Hi-Lo | high card desert |
| desert-roulette | Desert Roulette | Roulette | sand-dusted wheel |
| scorpion-cases | Scorpion Cases | Cases | case-opening |

Each originals page includes:
- Game hero (gradient art, name, tagline, RTP badge)
- Mode toggle: GC / SC (changes accent color)
- Disabled "Play" button with "Coming Soon" overlay
- Recent plays table (mock data, avatars, amounts)
- Leaderboard sidebar (mock ranked players)
- Rules tab (game rules text)
- Fairness/Provably Fair tab (placeholder hash/seed display)
- Stats card (RTP, max win, min bet, house edge)
- Coming Soon modal (email capture style)

---

## 5. Data Models

### User
```ts
interface User {
  id: string;
  username: string;
  avatar: string;
  email: string;
  vipTier: VIPTier; // 1-6
  xp: number;
  xpToNext: number;
  joinDate: string;
  isVerified: boolean; // KYC
  country: string;
}
```

### Wallet
```ts
interface Wallet {
  goldCoins: number;       // GC balance
  sweepCoins: number;      // SC balance
  bonusBalance: number;    // bonus (from rakeback etc)
  rakebackBalance: number; // unclaimed rakeback
  xp: number;
  vaultBalance: number;    // locked GC in vault
  vaultInterestRate: number; // e.g. 0.05 = 5%/day
  activeCurrency: 'GC' | 'SC';
}
```

### Game
```ts
interface Game {
  id: string;
  slug: string;
  name: string;
  provider: string;
  category: GameCategory;
  thumbnail: string;
  rtp: number;
  isOriginal: boolean;
  isNew: boolean;
  isHot: boolean;
  tags: string[];
}
```

### Transaction
```ts
interface Transaction {
  id: string;
  type: 'buy' | 'redeem' | 'bonus' | 'rakeback' | 'vault_deposit' | 'vault_withdraw' | 'bet' | 'win' | 'rain' | 'tip';
  currency: 'GC' | 'SC' | 'bonus';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
}
```

### Promotion
```ts
interface Promotion {
  id: string;
  title: string;
  description: string;
  type: 'welcome' | 'daily' | 'reload' | 'race' | 'vip' | 'seasonal';
  badge: string;
  expiresAt: string;
  terms: string;
}
```

---

## 6. Component Architecture

### Layout Components
- `AppShell` — main layout wrapper (sidebar + header + content)
- `Sidebar` — left nav (desktop: 240px, mobile: hidden/drawer)
- `Header` — top bar (wallet toggle, balances, notifications, profile)
- `MobileBottomNav` — mobile bottom navigation (5 tabs)
- `Footer` — thin footer with legal links + age/legal copy

### Wallet Components
- `WalletToggle` — GC/SC switch with color animation
- `BalanceDisplay` — shows all balances with icons
- `CurrencyBadge` — inline currency pill
- `BuyCoinsModal` — coin purchase packages
- `RedeemModal` — SC redemption flow

### Game Components
- `GameCard` — thumbnail, name, provider, new/hot badge
- `GameGrid` — responsive grid with category filter
- `CategoryTabs` — scrollable horizontal category tabs
- `GameSearchBar` — search with live filter
- `ProvidersGrid` — logo grid for game providers
- `OriginalGameHero` — full-width game hero for originals
- `RecentPlaysTable` — live feed of plays
- `GameLeaderboard` — ranked players for a game

### VIP Components
- `VIPTierCard` — tier display with progress
- `VIPProgressBar` — XP progress to next tier
- `TierBenefitList` — benefits per tier
- `RakebackCalculator` — interactive rakeback calc

### Social Components
- `GlobalChat` — slide-in chat drawer
- `ChatMessage` — individual message
- `RainModal` — rain/tip giveaway display
- `RoomCard` — play-together room card
- `LeaderboardTable` — ranked list with avatars

### Promotion Components
- `PromoCard` — promotion card
- `DailyBonusWheel` — spin wheel animation
- `MissionCard` — mission with progress
- `AchievementBadge` — achievement display

### Auth Components
- `LoginModal` — username/password + social
- `RegisterModal` — multi-step registration
- `GeoBlockModal` — geolocation restriction notice
- `AgeVerificationBanner` — 18+ banner

---

## 7. Mock Data Files

### `/lib/mock-data/games.ts`
- 60+ games across categories: Slots, Table Games, Live, Game Shows, Megaways, Scratch, Fish, Casual
- 12 Yala Originals
- 8+ providers: NoLimit City, Pragmatic Play, Evolution, Push Gaming, Hacksaw, Relax, Playtech, Yala Studios

### `/lib/mock-data/users.ts`
- Mock logged-in user (Desert Prince tier)
- 20 mock leaderboard users with names/avatars/amounts

### `/lib/mock-data/transactions.ts`
- 30 mock transactions across all types

### `/lib/mock-data/promotions.ts`
- 8 promotions (welcome, daily, weekly race, VIP, etc.)

### `/lib/mock-data/chat.ts`
- 25 mock chat messages with users and rain events

---

## 8. State Management (Zustand)

### `useWalletStore`
```ts
{
  goldCoins: number,
  sweepCoins: number,
  bonusBalance: number,
  rakebackBalance: number,
  xp: number,
  vaultBalance: number,
  activeCurrency: 'GC' | 'SC',
  toggleCurrency: () => void,
  addGC: (n: number) => void,
  addSC: (n: number) => void,
  claimRakeback: () => void,
  depositVault: (n: number) => void,
  withdrawVault: (n: number) => void,
}
```

### `useAuthStore`
```ts
{
  user: User | null,
  isLoggedIn: boolean,
  login: (username: string, password: string) => void,
  logout: () => void,
  register: (data: RegisterData) => void,
}
```

### `useUIStore`
```ts
{
  chatOpen: boolean,
  toggleChat: () => void,
  authModalOpen: boolean,
  authModalTab: 'login' | 'register',
  openAuthModal: (tab?) => void,
  closeAuthModal: () => void,
  comingSoonModalOpen: boolean,
  openComingSoonModal: () => void,
  closeComingSoonModal: () => void,
}
```

---

## 9. Responsive Behavior

### Desktop (1280px+)
- Fixed left sidebar (240px) always visible
- Header: wallet toggle + balances visible in header
- Chat: persistent right panel or slide-in drawer
- Game grid: 5-6 columns

### Tablet (768–1279px)
- Collapsed sidebar (icon only, 64px)
- Header: balances shown as compact pills
- Game grid: 3-4 columns

### Mobile (< 768px)
- No sidebar — bottom nav bar (5 tabs: Casino, Originals, Sportsbook, Wallet, Menu)
- Header: logo + currency toggle + balance only
- Game grid: 2 columns
- Chat: full-screen drawer
- All modals: full-screen sheets

---

## 10. Legal Copy Requirements

Every page footer must contain:
- "18+ | Play Responsibly | Void Where Prohibited"
- "No Purchase Necessary. See Sweepstakes Rules for details."
- "Yala is a social casino. No real money gambling. Gold Coins have no cash value."

Dedicated pages:
- `/terms` — Full terms of service placeholder
- `/privacy` — Privacy policy placeholder  
- `/sweepstakes-rules` — Official sweepstakes rules with "No Purchase Necessary" prominently featured
- `/responsible-gaming` — Self-exclusion, limits, cool-off, problem gambling resources (NCPG hotline: 1-800-522-4700)

---

## 11. Key UX Rules

1. **Dual currency toggle** is always visible in the header — tapping it instantly shifts accent colors site-wide (gold ↔ emerald)
2. **GC mode**: gold/yellow button fills, progress bars, badges
3. **SC mode**: emerald/green button fills, progress bars, badges — sidebar gets a subtle emerald left-border glow
4. **Games are never playable** — clicking any game opens ComingSoonModal (except Originals which have their own coming-soon state)
5. **Vault** shows a locked-safe animation, GC earns interest (mock 5%/day display)
6. **Chat** is a slide-in panel from the right (desktop) or bottom-sheet (mobile) — contains mock messages, emoji reactions, rain events
7. **Daily Bonus Wheel** spins via Framer Motion — always awards mock amount
8. **Mission progress bars** animate on page load
9. **Leaderboard rows** cycle through positions with a subtle highlight on "you" row
10. **Geolocation modal** shown on landing if "blocked" state is simulated
11. **KYC** is a multi-step flow: identity → address → documents → review (all mocked)
12. **Crypto payment** shows a mock wallet address + QR code (static, not real)
13. **Affiliate dashboard** shows mock referral count, earnings, commission rate, creator code input

---

## 12. Acceptance Criteria

- [ ] All pages render without error
- [ ] TypeScript: zero type errors (`tsc --noEmit`)
- [ ] Lint: zero ESLint errors (`next lint`)
- [ ] Build: successful production build (`next build`)
- [ ] Mobile: all pages usable at 375px
- [ ] Desktop: all pages usable at 1440px
- [ ] Wallet toggle changes color scheme globally
- [ ] All originals pages load with correct game data
- [ ] Auth modal opens from any "Sign Up" / "Login" button
- [ ] Daily bonus wheel spins and shows reward
- [ ] Chat opens and shows mock messages
- [ ] No real URLs, payments, or gambling logic present
- [ ] Legal copy present on all pages
- [ ] Coming Soon modal on all game clicks

---

## END OF SPEC
