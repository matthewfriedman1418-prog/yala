# Yala

US sweepstakes social casino. Dual-currency model: **Gold Coins (GC)** for play, **Sweep Coins (SC)** redeemable for cash prizes in eligible states. Built as a Next.js frontend prototype — the backend is still to be designed.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build + deploy

```bash
npm run build              # production build
npx vercel deploy --prod   # ship
```

## What works today

This is currently a **frontend prototype with no backend**. All persistence is `localStorage` via Zustand stores in `src/lib/store/`. That means:

- **Real interactions:** wallet deductions/credits, settings toggles, notifications inbox, chat block list, sportsbook bet placement, profile privacy, KYC wizard, responsible-gaming limits, daily bonus claims, missions, rakeback claims.
- **Mock-only:** all randomness is client-side (any game's RNG is rerollable from devtools), no real auth, no real payments, no cross-user effects (your tip doesn't reach the recipient), no real-time chat or odds.

See `AGENTS.md` for important constraints when modifying code.

## Playable Originals

Three Yala Originals are end-to-end playable (UI + wallet wiring + persisted local history):

| Game | Route | Mechanic |
|---|---|---|
| **Trail** | `/originals/trail` | Adjacent-tile path on a 6×6 grid. Cash out before you hit a hazard. 99% RTP. |
| **Caravan Cross** | `/originals/caravan-cross` | Side-scrolling crash. Sandstorm appears ~1.5s before bust as a visible warning. 99% RTP. |
| **Mirage Auction** | `/originals/mirage-auction` | 4-round hidden-info auction vs 3 AI personalities (Greedy / Cautious / Bluffer). 99% RTP (simulation-verified at K=4.5). |

The other 9 originals at `/originals/*` use the generic landing template and aren't playable yet — they're waiting on the backend RNG decision (we don't want to keep building client-rolled games that will be rewritten when RNG moves server-side).

## Project layout

```
src/
├─ app/(app)/             # all authenticated routes — casino, sportsbook,
│                         #   wallet, profile, settings, kyc, originals/*, etc.
├─ components/
│  ├─ layout/             # AppShell, Sidebar, Header, mobile nav
│  ├─ modals/             # AuthModal, BuyCoinsModal, NotificationsModal, etc.
│  ├─ social/             # GlobalChat, ChatPopovers, ChatActionModals, RainBanner
│  └─ ui/                 # YalaAvatar, YalaIcon
├─ lib/
│  ├─ store/              # Zustand stores: auth, wallet, ui, notifications,
│  │                      #   settings, chat, sportsbook
│  ├─ mock-data/          # seeded mock data: chat, games, users, transactions,
│  │                      #   promotions, sportsbook
│  ├─ i18n.ts             # tiny translation helper (en/es/pt/fr/de)
│  └─ utils.ts            # formatGC/SC/XP, VIP color helpers
└─ ...
```

## Brand

Dark, desert-warm palette. Primary tokens:

| Token        | Color    | Usage |
|---|---|---|
| Page bg      | `#060E0A` | Outer shell |
| Card bg      | `#0F1A14` | Panels, modals |
| Border       | `#1A2E22` | Hairline dividers |
| GC accent    | `#F0B232` → `#FFD166` | Gold Coins, primary CTAs |
| SC accent    | `#2DC97A` → `#34D399` | Sweep Coins, success states |
| Ink          | `#F5E8C8` | Primary text |
| Muted        | `#8FA899` | Secondary text |
| Dim          | `#4A6A55` | Tertiary / labels |

## Onboarding for new contributors

1. **Read `AGENTS.md` first** — the Next.js version here has breaking changes from training data. Consult `node_modules/next/dist/docs/` when in doubt.
2. **The wallet and game RNG are mock.** Don't build new client-rolled games. The 3 playable Originals are the cap until backend.
3. **Don't add new dependencies** without discussing first.
4. **No `--no-verify` on git commits.** Hook failures mean something's wrong.

## Where we are on the backend

There is no backend. The current frontend is in good shape for wiring later — clean Zustand store boundaries, TypeScript everywhere, no tangled state. Estimated 6–7 weeks of integration work once backend endpoints exist (auth, wallet, server-RNG games, chat, KYC vendor, payment processor, GeoComply, real-time leaderboard).

The backend stack hasn't been chosen yet.

---

Not a real-money casino. Sweepstakes-based, 18+ only, void where prohibited.
