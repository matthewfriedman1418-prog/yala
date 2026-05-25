'use client';

/**
 * Notifications store — backs both the dropdown modal and the /notifications
 * inbox page. Real read/unread state persisted to localStorage so the bell
 * badge actually decrements when you read something.
 *
 * In a real backend these would be pushed via SSE/WebSocket. Here we seed with
 * a fixed mock list on first hydration.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type NotifKind = 'race' | 'mission' | 'level' | 'promo' | 'rain' | 'win' | 'system' | 'tip';

export interface Notification {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  /** ISO timestamp — used to group by Today / Yesterday / Earlier. */
  ts: string;
  unread: boolean;
  href?: string;
}

const NOW = Date.now();
const MINUTES = (n: number) => 60 * 1000 * n;
const HOURS   = (n: number) => 60 * 60 * 1000 * n;
const DAYS    = (n: number) => 24 * 60 * 60 * 1000 * n;

const SEED: Notification[] = [
  { id: 'n01', kind: 'race',    title: 'You climbed to #47 in the Daily Race', body: 'Wager 879K GC more to break into the prize tier.',                         ts: new Date(NOW - MINUTES(4)).toISOString(),  unread: true,  href: '/leaderboards' },
  { id: 'n02', kind: 'win',     title: 'Big win on Trail',                      body: 'You cashed out 240 GC at 12.0× on Reckless mode.',                          ts: new Date(NOW - MINUTES(32)).toISOString(), unread: true,  href: '/originals/trail' },
  { id: 'n03', kind: 'mission', title: 'Mission complete · Triple Threat',     body: '+25 SC and 500 XP have been added to your balance.',                       ts: new Date(NOW - HOURS(1)).toISOString(),    unread: true,  href: '/missions' },
  { id: 'n04', kind: 'level',   title: 'Level up · Sahara Sheikh II',          body: 'Your rakeback rate increased to 8% and unlocked Diamond Tier perks.',     ts: new Date(NOW - HOURS(6)).toISOString(),    unread: false, href: '/vip' },
  { id: 'n05', kind: 'tip',     title: 'You received a tip',                    body: 'GoldDuneKing tipped you 500 GC in chat.',                                  ts: new Date(NOW - HOURS(9)).toISOString(),    unread: false },
  { id: 'n06', kind: 'promo',   title: '3 new promotions just dropped',        body: 'Weekend Reload, Lucky 13 Free Spins, Refer-a-Friend bonus.',              ts: new Date(NOW - DAYS(1)).toISOString(),     unread: false, href: '/rewards' },
  { id: 'n07', kind: 'rain',    title: 'PyramidKing made it rain in chat',    body: 'You received 1,250 GC from the rain drop.',                                 ts: new Date(NOW - DAYS(2)).toISOString(),     unread: false },
  { id: 'n08', kind: 'system',  title: 'KYC reminder',                          body: 'Verify your account to unlock withdrawals up to 10,000 SC/month.',         ts: new Date(NOW - DAYS(3)).toISOString(),     unread: false, href: '/kyc' },
  { id: 'n09', kind: 'win',     title: 'Cashed out on Mirage Crash',           body: '+82 GC at 1.64×',                                                           ts: new Date(NOW - DAYS(4)).toISOString(),     unread: false, href: '/originals/mirage-crash' },
  { id: 'n10', kind: 'promo',   title: 'Daily bonus available',                 body: 'Day 4 of your streak. Claim 5,000 GC + 1.50 SC.',                          ts: new Date(NOW - DAYS(5)).toISOString(),     unread: false, href: '/daily-bonus' },
];

interface NotificationsState {
  items: Notification[];
  /** True once the seed has been merged in (avoids reseeding on every reload). */
  seeded: boolean;

  /** Returns count of unread notifications. */
  unreadCount: () => number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
  /** Push a new notification (used by in-app events like a Trail jackpot). */
  add: (notif: Omit<Notification, 'id' | 'ts' | 'unread'> & { unread?: boolean }) => void;
  /** Re-seed the mock list (used by /settings "Reset notifications" button). */
  reseed: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      items: [],
      seeded: false,

      unreadCount: () => get().items.filter((n) => n.unread).length,

      markRead: (id) =>
        set((s) => ({ items: s.items.map((n) => (n.id === id ? { ...n, unread: false } : n)) })),

      markAllRead: () =>
        set((s) => ({ items: s.items.map((n) => ({ ...n, unread: false })) })),

      remove: (id) => set((s) => ({ items: s.items.filter((n) => n.id !== id) })),

      clearAll: () => set({ items: [] }),

      add: (notif) =>
        set((s) => ({
          items: [
            {
              id: `n_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`,
              ts: new Date().toISOString(),
              unread: notif.unread ?? true,
              ...notif,
            },
            ...s.items,
          ].slice(0, 100),
        })),

      reseed: () => set({ items: SEED, seeded: true }),
    }),
    {
      name: 'yala-notifications',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        // First load → seed the mock list so the page isn't empty.
        if (state && !state.seeded) {
          state.items = SEED;
          state.seeded = true;
        }
      },
    },
  ),
);
