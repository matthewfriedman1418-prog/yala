'use client';

/**
 * Minimal i18n helper. We don't ship a full translation framework yet — this
 * just demonstrates the wiring is live so the Settings language switcher does
 * something visible. A few key strings have translations; everything else
 * falls back to English.
 *
 * Real i18n (next-intl, react-i18next, or LinguiJS) is a backend-era decision
 * once we know which markets we're licensed for.
 */

import { useSettingsStore, type Language } from '@/lib/store/settings';

type Dict = Record<Language, string>;

export const TRANSLATIONS = {
  // Header / shell
  searchPlaceholder: { en: 'Search games…',           es: 'Buscar juegos…',         pt: 'Buscar jogos…',          fr: 'Rechercher des jeux…',  de: 'Spiele suchen…' } as Dict,
  signIn:            { en: 'Sign in',                 es: 'Iniciar sesión',         pt: 'Entrar',                 fr: 'Se connecter',          de: 'Anmelden' } as Dict,
  register:          { en: 'Register',                es: 'Registrarse',            pt: 'Cadastrar',              fr: 'S\'inscrire',           de: 'Registrieren' } as Dict,
  buyCoins:          { en: 'Buy coins',               es: 'Comprar monedas',        pt: 'Comprar moedas',         fr: 'Acheter des jetons',    de: 'Münzen kaufen' } as Dict,

  // Chat
  chatLive:          { en: 'Live Chat',               es: 'Chat en vivo',           pt: 'Bate-papo ao vivo',      fr: 'Chat en direct',        de: 'Live-Chat' } as Dict,
  chatSay:           { en: 'Say something…',          es: 'Di algo…',                pt: 'Diga algo…',             fr: 'Dis quelque chose…',    de: 'Sag etwas…' } as Dict,
  chatSignInToChat:  { en: 'Sign in to chat',         es: 'Inicia sesión para chatear', pt: 'Entre para conversar', fr: 'Connecte-toi pour chatter', de: 'Anmelden zum Chatten' } as Dict,
  chatBeCool:        { en: 'Enter to send · Be cool', es: 'Enter para enviar · Sé cool', pt: 'Enter para enviar · Seja legal', fr: 'Entrée pour envoyer · Reste cool', de: 'Enter zum Senden · Bleib cool' } as Dict,

  // Common buttons
  cashOut:           { en: 'Cash out',                es: 'Retirar',                pt: 'Sacar',                  fr: 'Encaisser',             de: 'Auszahlen' } as Dict,
  bet:               { en: 'Bet',                     es: 'Apostar',                pt: 'Apostar',                fr: 'Parier',                de: 'Wetten' } as Dict,
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS;

/** Lookup a translated string for the current user language. */
export function t(key: TranslationKey, lang: Language): string {
  const entry = TRANSLATIONS[key];
  return entry[lang] ?? entry.en;
}

/** Hook variant — re-renders when the language preference changes. */
export function useT(): (key: TranslationKey) => string {
  const lang = useSettingsStore((s) => s.display.language);
  return (key: TranslationKey) => t(key, lang);
}
