'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useNotificationsStore } from '@/lib/store/notifications';
import { useSettingsStore } from '@/lib/store/settings';
import { useChatStore } from '@/lib/store/chat';
import { useSportsbookStore } from '@/lib/store/sportsbook';
import { useRewardsStore } from '@/lib/store/rewards';

/**
 * Mount-once component that triggers Zustand persist rehydration.
 * Required because our persisted stores use `skipHydration: true` to avoid
 * SSR/CSR mismatch warnings — we have to manually rehydrate on the client
 * after mount.
 */
export function StoreHydration() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useWalletStore.persist.rehydrate();
    useNotificationsStore.persist.rehydrate();
    useSettingsStore.persist.rehydrate();
    useChatStore.persist.rehydrate();
    useSportsbookStore.persist.rehydrate();
    useRewardsStore.persist.rehydrate();
  }, []);
  return null;
}
