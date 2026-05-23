'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  chatOpen: boolean;
  toggleChat: () => void;
  closeChat: () => void;

  authModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;

  comingSoonOpen: boolean;
  comingSoonGame: string;
  openComingSoon: (game?: string) => void;
  closeComingSoon: () => void;

  buyCoinsOpen: boolean;
  openBuyCoins: () => void;
  closeBuyCoins: () => void;

  redeemModalOpen: boolean;
  openRedeemModal: () => void;
  closeRedeemModal: () => void;

  promotionsDrawerOpen: boolean;
  openPromotionsDrawer: () => void;
  closePromotionsDrawer: () => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  rainActive: boolean;
  rainAmount: number;
  triggerRain: (amount: number) => void;
  dismissRain: () => void;

  onboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;

  notificationsOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;

  // Persisted preferences
  onboardingSeen: boolean;
  markOnboardingSeen: () => void;
  resetOnboardingSeen: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
  chatOpen: false,
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  closeChat: () => set({ chatOpen: false }),

  authModalOpen: false,
  authModalTab: 'login',
  openAuthModal: (tab = 'login') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),

  comingSoonOpen: false,
  comingSoonGame: '',
  openComingSoon: (game = 'This game') => set({ comingSoonOpen: true, comingSoonGame: game }),
  closeComingSoon: () => set({ comingSoonOpen: false, comingSoonGame: '' }),

  buyCoinsOpen: false,
  openBuyCoins: () => set({ buyCoinsOpen: true }),
  closeBuyCoins: () => set({ buyCoinsOpen: false }),

  redeemModalOpen: false,
  openRedeemModal: () => set({ redeemModalOpen: true }),
  closeRedeemModal: () => set({ redeemModalOpen: false }),

  promotionsDrawerOpen: false,
  openPromotionsDrawer: () => set({ promotionsDrawerOpen: true }),
  closePromotionsDrawer: () => set({ promotionsDrawerOpen: false }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  mobileMenuOpen: false,
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),

  rainActive: false,
  rainAmount: 0,
  triggerRain: (amount) => set({ rainActive: true, rainAmount: amount }),
  dismissRain: () => set({ rainActive: false, rainAmount: 0 }),

  onboardingOpen: false,
  openOnboarding: () => set({ onboardingOpen: true }),
  closeOnboarding: () => set({ onboardingOpen: false }),

  notificationsOpen: false,
  openNotifications: () => set({ notificationsOpen: true }),
  closeNotifications: () => set({ notificationsOpen: false }),

  onboardingSeen: false,
  markOnboardingSeen: () => set({ onboardingSeen: true }),
  resetOnboardingSeen: () => set({ onboardingSeen: false }),
    }),
    {
      name: 'yala-ui',
      storage: createJSONStorage(() => localStorage),
      // Only persist preferences, NOT ephemeral modal/drawer state
      partialize: (s) => ({
        onboardingSeen: s.onboardingSeen,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    },
  ),
);
