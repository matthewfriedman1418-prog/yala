'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { useNotificationsStore } from '@/lib/store/notifications';
import { useSettingsStore } from '@/lib/store/settings';

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
  }, []);
  return null;
}
