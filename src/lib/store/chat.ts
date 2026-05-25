'use client';

/**
 * Chat store — small persisted store for client-side chat preferences that
 * survive across reloads. Currently holds the block list; eventually will
 * also hold pinned conversations, mute states, etc.
 *
 * NOTE: We deliberately do NOT persist the chat MESSAGES themselves. With no
 * backend, persisting messages would create the worst-of-both UX: your own
 * messages stick on your screen, but no one else ever sees them. Better to
 * lose them on refresh until real chat backend (WebSocket + server-side
 * persistence) lands.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ChatState {
  /** User IDs the current user has blocked. Messages from these users are hidden. */
  blocked: string[];
  block: (userId: string) => void;
  unblock: (userId: string) => void;
  isBlocked: (userId: string) => boolean;
  clearBlocks: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      blocked: [],
      block: (userId) =>
        set((s) => (s.blocked.includes(userId) ? s : { blocked: [...s.blocked, userId] })),
      unblock: (userId) =>
        set((s) => ({ blocked: s.blocked.filter((id) => id !== userId) })),
      isBlocked: (userId) => get().blocked.includes(userId),
      clearBlocks: () => set({ blocked: [] }),
    }),
    {
      name: 'yala-chat',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
