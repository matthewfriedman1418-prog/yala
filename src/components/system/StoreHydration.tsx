'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';

/**
 * Mount-once component that triggers Zustand persist rehydration.
 * Required because the auth + wallet stores use `skipHydration: true`
 * to avoid SSR/CSR mismatch warnings — we have to manually rehydrate
 * on the client after mount.
 */
export function StoreHydration() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
    useWalletStore.persist.rehydrate();
  }, []);
  return null;
}
