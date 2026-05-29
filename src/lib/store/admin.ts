'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ADMIN_ME, type AdminOperator } from '@/lib/mock-data/admin';

interface AdminUIState {
  /** Operator currently "signed in" to the back office (mock). */
  operator: AdminOperator;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebar: (v: boolean) => void;
}

/**
 * Back-office UI state. Sidebar collapse is persisted so it survives refreshes;
 * the operator identity is a fixed mock (real auth will replace it). Kept
 * entirely separate from the player-facing `useAuthStore`.
 */
export const useAdminStore = create<AdminUIState>()(
  persist(
    (set) => ({
      operator: ADMIN_ME,
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebar: (v) => set({ sidebarCollapsed: v }),
    }),
    {
      name: 'yala-admin-ui',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
);
