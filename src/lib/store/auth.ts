'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CardVariant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'rotate';

export interface User {
  id: string;
  username: string;
  /** Public-facing display name (shown on profile card, referral card, leaderboards). Editable. */
  displayName: string;
  avatar: string;
  email: string;
  vipTier: number; // 1-6
  vipName: string;
  xp: number;
  xpToNext: number;
  joinDate: string;
  isVerified: boolean;
  country: string;
  referralCode: string;
  totalWagered: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalBonusReceived: number;
  /** User's chosen referral card style. 'rotate' cycles through all 10. Default = 8 (the Foil Card). */
  cardVariant: CardVariant;
}

const MOCK_USER: User = {
  id: 'usr_7a9f3d',
  username: 'DesertFox88',
  displayName: 'DesertFox88',
  avatar: 'DF',
  email: 'player@yala.com',
  vipTier: 5,
  vipName: 'Desert Prince',
  xp: 312_450,
  xpToNext: 750_000,
  joinDate: '2025-01-14',
  isVerified: true,
  country: 'US',
  referralCode: 'DESERT88',
  totalWagered: 4_280_000,
  totalDeposited: 645_000,
  totalWithdrawn: 285_000,
  totalBonusReceived: 142_500,
  cardVariant: 8,
};

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: { username: string; email: string; password: string }) => Promise<void>;
  updateDisplayName: (name: string) => void;
  setCardVariant: (v: CardVariant) => void;
}

/**
 * Auth store. Persisted to localStorage so a hard refresh keeps the user
 * signed in (this is a mock — real auth will be httpOnly cookies + JWT).
 *
 * `skipHydration: true` prevents the SSR/CSR mismatch warning. The
 * <StoreHydration /> component in AppShell triggers rehydration after mount.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      login: async (_username, _password) => {
        await new Promise((r) => setTimeout(r, 800));
        set({ user: MOCK_USER, isLoggedIn: true });
      },

      logout: () => set({ user: null, isLoggedIn: false }),

      register: async (_data) => {
        await new Promise((r) => setTimeout(r, 1000));
        set({ user: { ...MOCK_USER, username: _data.username, displayName: _data.username, email: _data.email }, isLoggedIn: true });
      },

      updateDisplayName: (name) =>
        set((s) => (s.user ? { user: { ...s.user, displayName: name.trim() || s.user.username } } : {})),

      setCardVariant: (v) =>
        set((s) => (s.user ? { user: { ...s.user, cardVariant: v } } : {})),
    }),
    {
      name: 'yala-auth',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ user: s.user, isLoggedIn: s.isLoggedIn }),
    },
  ),
);
