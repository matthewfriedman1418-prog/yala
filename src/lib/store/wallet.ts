'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Currency = 'GC' | 'SC';

interface WalletState {
  goldCoins: number;
  sweepCoins: number;
  bonusBalance: number;
  rakebackBalance: number;
  xp: number;
  vaultBalance: number;
  vaultInterestRate: number;
  activeCurrency: Currency;
  toggleCurrency: () => void;
  setCurrency: (c: Currency) => void;
  addGC: (n: number) => void;
  addSC: (n: number) => void;
  addBonus: (n: number) => void;
  addXP: (n: number) => void;
  claimRakeback: () => void;
  depositVault: (n: number) => void;
  withdrawVault: (n: number) => void;
  buyCoins: (gcAmount: number, scAmount: number) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
  goldCoins: 125_000,
  sweepCoins: 48.5,
  bonusBalance: 2_500,
  rakebackBalance: 1_840,
  xp: 312_450,
  vaultBalance: 25.50, // Vault now holds Sweep Coins
  vaultInterestRate: 0.05,
  activeCurrency: 'GC',

  toggleCurrency: () =>
    set((s) => ({ activeCurrency: s.activeCurrency === 'GC' ? 'SC' : 'GC' })),

  setCurrency: (c) => set({ activeCurrency: c }),

  addGC: (n) => set((s) => ({ goldCoins: s.goldCoins + n })),
  addSC: (n) => set((s) => ({ sweepCoins: s.sweepCoins + n })),
  addBonus: (n) => set((s) => ({ bonusBalance: s.bonusBalance + n })),
  addXP: (n) => set((s) => ({ xp: s.xp + n })),

  claimRakeback: () =>
    set((s) => ({
      bonusBalance: s.bonusBalance + s.rakebackBalance,
      rakebackBalance: 0,
    })),

  depositVault: (n) =>
    set((s) => ({
      sweepCoins: Math.max(0, s.sweepCoins - n),
      vaultBalance: s.vaultBalance + n,
    })),

  withdrawVault: (n) =>
    set((s) => ({
      vaultBalance: Math.max(0, s.vaultBalance - n),
      sweepCoins: s.sweepCoins + n,
    })),

  buyCoins: (gcAmount, scAmount) =>
    set((s) => ({
      goldCoins: s.goldCoins + gcAmount,
      sweepCoins: s.sweepCoins + scAmount,
    })),
    }),
    {
      name: 'yala-wallet',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        goldCoins: s.goldCoins,
        sweepCoins: s.sweepCoins,
        bonusBalance: s.bonusBalance,
        rakebackBalance: s.rakebackBalance,
        xp: s.xp,
        vaultBalance: s.vaultBalance,
        activeCurrency: s.activeCurrency,
      }),
    },
  ),
);
