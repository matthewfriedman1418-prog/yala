'use client';

/**
 * User-controllable settings (preferences). Persisted to localStorage so the
 * /settings page is genuinely interactive: toggles stick across reloads.
 *
 * In production these would sync to the user record server-side.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'en' | 'es' | 'pt' | 'fr' | 'de';
export type Theme    = 'dark' | 'midnight';   // visual variant; dark is default
export type Density  = 'comfy' | 'compact';

export interface NotificationPrefs {
  wins:      boolean;
  promos:    boolean;
  missions:  boolean;
  levelUp:   boolean;
  rakeback:  boolean;
  rain:      boolean;
  tips:      boolean;
  system:    boolean;
  email:     boolean;
  push:      boolean;
}

export interface SoundPrefs {
  enabled: boolean;
  /** 0-100 */
  volume: number;
  gameEffects: boolean;
  uiClicks:    boolean;
  win:         boolean;
}

export interface DisplayPrefs {
  language:   Language;
  theme:      Theme;
  density:    Density;
  reduceMotion: boolean;
  compactChat:  boolean;
  showTimestamps: boolean;
}

export interface SecurityPrefs {
  twoFactorEnabled: boolean;
  hideBalances:     boolean;
  /** Mock fingerprint/device-bound session approval. */
  trustedDevices:   boolean;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current?: boolean;
}

interface SettingsState {
  notifications: NotificationPrefs;
  sound:         SoundPrefs;
  display:       DisplayPrefs;
  security:      SecurityPrefs;
  sessions:      Session[];

  setNotification: <K extends keyof NotificationPrefs>(key: K, v: NotificationPrefs[K]) => void;
  setSound:        <K extends keyof SoundPrefs>(key: K, v: SoundPrefs[K]) => void;
  setDisplay:      <K extends keyof DisplayPrefs>(key: K, v: DisplayPrefs[K]) => void;
  setSecurity:     <K extends keyof SecurityPrefs>(key: K, v: SecurityPrefs[K]) => void;

  endSession:      (id: string) => void;
  endAllOthers:    () => void;
  resetToDefaults: () => void;
}

const DEFAULT_NOTIFS: NotificationPrefs = {
  wins:      true,
  promos:    true,
  missions:  true,
  levelUp:   true,
  rakeback:  true,
  rain:      true,
  tips:      true,
  system:    true,
  email:     false,
  push:      false,
};

const DEFAULT_SOUND: SoundPrefs = {
  enabled:     true,
  volume:      60,
  gameEffects: true,
  uiClicks:    false,
  win:         true,
};

const DEFAULT_DISPLAY: DisplayPrefs = {
  language:       'en',
  theme:          'dark',
  density:        'comfy',
  reduceMotion:   false,
  compactChat:    false,
  showTimestamps: true,
};

const DEFAULT_SECURITY: SecurityPrefs = {
  twoFactorEnabled: false,
  hideBalances:     false,
  trustedDevices:   true,
};

const SEED_SESSIONS: Session[] = [
  { id: 's1', device: 'MacBook · Chrome 128',   location: 'Austin, TX · US', lastActive: 'Active now', current: true },
  { id: 's2', device: 'iPhone 15 · Yala iOS',   location: 'Austin, TX · US', lastActive: '2h ago' },
  { id: 's3', device: 'Windows · Firefox 130',  location: 'Dallas, TX · US', lastActive: 'Yesterday' },
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: DEFAULT_NOTIFS,
      sound:         DEFAULT_SOUND,
      display:       DEFAULT_DISPLAY,
      security:      DEFAULT_SECURITY,
      sessions:      SEED_SESSIONS,

      setNotification: (key, v) =>
        set((s) => ({ notifications: { ...s.notifications, [key]: v } })),
      setSound: (key, v) =>
        set((s) => ({ sound: { ...s.sound, [key]: v } })),
      setDisplay: (key, v) =>
        set((s) => ({ display: { ...s.display, [key]: v } })),
      setSecurity: (key, v) =>
        set((s) => ({ security: { ...s.security, [key]: v } })),

      endSession: (id) => set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id || x.current) })),
      endAllOthers: () => set((s) => ({ sessions: s.sessions.filter((x) => x.current) })),

      resetToDefaults: () =>
        set({
          notifications: DEFAULT_NOTIFS,
          sound:         DEFAULT_SOUND,
          display:       DEFAULT_DISPLAY,
          security:      DEFAULT_SECURITY,
        }),
    }),
    {
      name: 'yala-settings',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
