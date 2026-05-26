/**
 * YALA Custom Icon Library
 * Source: YALA Asset Pack (Claude Design handoff)
 * All icons are inline SVG — no external deps, no ID conflicts.
 */

import { cn } from '@/lib/utils';

export type YalaIconName =
  // Brand marks
  | 'y-coin' | 'y-tile' | 'pyramid' | 'pyramid-ring' | 'wordmark'
  // Currency
  | 'coin' | 'coin-stack' | 'chip-green' | 'chip-gold' | 'diamond' | 'wallet-icon'
  // Sweeps (new — green sweepstakes currency, cash-bill style)
  | 'sweeps-coin' | 'sweeps-stack' | 'cash-bill' | 'cash-wad'
  // Game symbols
  | 'star' | 'sparkle' | 'lightning' | 'dice' | 'slot-reels' | 'crown' | 'clover' | 'wish'
  | 'sports-ball'
  // Rewards & luck
  | 'gift' | 'trophy' | 'badge-star' | 'ticket' | 'daily-star' | 'jackpot'
  // UI & status
  | 'lock' | 'clock-icon' | 'plus-icon' | 'arrow' | 'check' | 'x-mark' | 'activity' | 'shield';

interface YalaIconProps {
  name: YalaIconName;
  size?: number;
  className?: string;
}

// Shared gradient defs — inlined per SVG; browsers handle duplicate ids gracefully
// since they're identical across all instances.
const DEFS = `<defs>
  <radialGradient id="yi-gold" cx="0.35" cy="0.3" r="0.85">
    <stop offset="0%" stop-color="#FFF4D0"/>
    <stop offset="22%" stop-color="#FFE08A"/>
    <stop offset="55%" stop-color="#F0B232"/>
    <stop offset="100%" stop-color="#8a5a14"/>
  </radialGradient>
  <radialGradient id="yi-goldFlat" cx="0.5" cy="0.3" r="0.9">
    <stop offset="0%" stop-color="#FFE9A8"/>
    <stop offset="55%" stop-color="#F0B232"/>
    <stop offset="100%" stop-color="#8a5a14"/>
  </radialGradient>
  <radialGradient id="yi-teal" cx="0.35" cy="0.3" r="0.9">
    <stop offset="0%" stop-color="#B0F7D0"/>
    <stop offset="55%" stop-color="#2DC97A"/>
    <stop offset="100%" stop-color="#0d4a2a"/>
  </radialGradient>
  <radialGradient id="yi-sweeps" cx="0.35" cy="0.28" r="0.88">
    <stop offset="0%" stop-color="#D6FFE7"/>
    <stop offset="22%" stop-color="#8AF0B6"/>
    <stop offset="55%" stop-color="#2DC97A"/>
    <stop offset="100%" stop-color="#0a3a22"/>
  </radialGradient>
  <radialGradient id="yi-sweepsFlat" cx="0.5" cy="0.3" r="0.9">
    <stop offset="0%" stop-color="#8AF0B6"/>
    <stop offset="55%" stop-color="#2DC97A"/>
    <stop offset="100%" stop-color="#0a3a22"/>
  </radialGradient>
</defs>`;

const PATHS: Record<YalaIconName, string> = {
  // ── Brand marks ──────────────────────────────────────────────────────────
  'y-coin': `<circle cx="50" cy="50" r="46" fill="url(#yi-gold)" stroke="#6B4910" stroke-width="2.5"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#6B4910" stroke-width="1.2" stroke-dasharray="3 3"/>
    <text x="50" y="68" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="48" fill="#6B4910">Y</text>`,

  'y-tile': `<rect x="14" y="14" width="72" height="72" rx="14" fill="url(#yi-goldFlat)" stroke="#6B4910" stroke-width="2.5"/>
    <text x="50" y="69" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="56" fill="#6B4910">Y</text>`,

  'pyramid': `<polygon points="50,10 92,86 8,86" fill="url(#yi-goldFlat)" stroke="#6B4910" stroke-width="2.5" stroke-linejoin="miter"/>
    <polygon points="50,30 78,80 22,80" fill="none" stroke="#6B4910" stroke-width="1.3"/>
    <polygon points="50,50 64,76 36,76" fill="none" stroke="#6B4910" stroke-width="1"/>
    <line x1="50" y1="10" x2="50" y2="86" stroke="#6B4910" stroke-width="1" opacity="0.5"/>`,

  'pyramid-ring': `<circle cx="50" cy="50" r="46" fill="#040814" stroke="#F0B232" stroke-width="2.5"/>
    <polygon points="50,26 76,68 24,68" fill="none" stroke="#F0B232" stroke-width="2.5"/>
    <polygon points="50,40 65,62 35,62" fill="none" stroke="#F0B232" stroke-width="1.4"/>`,

  'wordmark': `<text x="65" y="40" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="42" fill="#F0B232" letter-spacing="2">YALA</text>`,

  // ── Currency ──────────────────────────────────────────────────────────────
  'coin': `<circle cx="50" cy="50" r="42" fill="url(#yi-gold)" stroke="#6B4910" stroke-width="3"/>
    <circle cx="50" cy="50" r="34" fill="none" stroke="#6B4910" stroke-width="1.2"/>
    <text x="50" y="66" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="40" fill="#6B4910">Y</text>`,

  'coin-stack': `<ellipse cx="50" cy="78" rx="38" ry="10" fill="url(#yi-goldFlat)" stroke="#6B4910" stroke-width="2"/>
    <ellipse cx="50" cy="62" rx="38" ry="10" fill="url(#yi-goldFlat)" stroke="#6B4910" stroke-width="2"/>
    <ellipse cx="50" cy="46" rx="38" ry="10" fill="url(#yi-goldFlat)" stroke="#6B4910" stroke-width="2"/>
    <ellipse cx="50" cy="30" rx="38" ry="10" fill="url(#yi-gold)" stroke="#6B4910" stroke-width="2"/>
    <text x="50" y="35" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="11" fill="#6B4910">Y</text>`,

  'chip-green': `<circle cx="50" cy="50" r="44" fill="#2DC97A"/>
    <g fill="#0A1828">
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(0 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(45 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(90 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(135 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(180 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(225 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(270 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(315 50 50)"/>
    </g>
    <circle cx="50" cy="50" r="24" fill="#fef4c9" stroke="#6B4910" stroke-width="1.5"/>
    <text x="50" y="61" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="22" fill="#6B4910">Y</text>`,

  'chip-gold': `<circle cx="50" cy="50" r="44" fill="#F0B232"/>
    <g fill="#2a1a08">
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(0 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(45 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(90 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(135 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(180 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(225 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(270 50 50)"/>
      <rect x="47.5" y="6" width="5" height="14" transform="rotate(315 50 50)"/>
    </g>
    <circle cx="50" cy="50" r="24" fill="#fef4c9" stroke="#6B4910" stroke-width="1.5"/>
    <text x="50" y="61" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="22" fill="#6B4910">Y</text>`,

  'diamond': `<polygon points="50,12 82,42 50,90 18,42" fill="url(#yi-teal)" stroke="#0a3a22" stroke-width="2"/>
    <polygon points="50,12 30,42 50,52 70,42" fill="#B0F7D0" opacity="0.55"/>
    <line x1="18" y1="42" x2="82" y2="42" stroke="#0a3a22" stroke-width="1.5"/>`,

  'wallet-icon': `<rect x="14" y="28" width="72" height="52" rx="8" fill="none" stroke="#F0B232" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 40 H 86" stroke="#F0B232" stroke-width="3" fill="none"/>
    <circle cx="72" cy="56" r="4" fill="#F0B232"/>`,

  // ── Sweeps currency (green sweepstakes coins + cash bills) ────────────────
  'sweeps-coin': `<circle cx="50" cy="50" r="42" fill="url(#yi-sweeps)" stroke="#0a3a22" stroke-width="3"/>
    <circle cx="50" cy="50" r="34" fill="none" stroke="#0a3a22" stroke-width="1.2"/>
    <text x="50" y="68" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="44" fill="#0a3a22">$</text>`,

  'sweeps-stack': `<ellipse cx="50" cy="78" rx="38" ry="10" fill="url(#yi-sweepsFlat)" stroke="#0a3a22" stroke-width="2"/>
    <ellipse cx="50" cy="62" rx="38" ry="10" fill="url(#yi-sweepsFlat)" stroke="#0a3a22" stroke-width="2"/>
    <ellipse cx="50" cy="46" rx="38" ry="10" fill="url(#yi-sweepsFlat)" stroke="#0a3a22" stroke-width="2"/>
    <ellipse cx="50" cy="30" rx="38" ry="10" fill="url(#yi-sweeps)" stroke="#0a3a22" stroke-width="2"/>
    <text x="50" y="35.5" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="12" fill="#0a3a22">$</text>`,

  'cash-bill': `<g transform="translate(-5 7) rotate(-10 50 50)">
      <rect x="8" y="28" width="84" height="44" rx="4" fill="#1e6b46" stroke="#0a3a22" stroke-width="2.5"/>
    </g>
    <g transform="translate(2 -2) rotate(6 50 50)">
      <rect x="8" y="28" width="84" height="44" rx="4" fill="#3fa86a" stroke="#0a3a22" stroke-width="2.5"/>
    </g>
    <g transform="rotate(-3 50 50)">
      <rect x="8" y="28" width="84" height="44" rx="4" fill="#5ed68c" stroke="#0a3a22" stroke-width="3"/>
      <rect x="12" y="32" width="76" height="36" rx="2" fill="none" stroke="#0a3a22" stroke-width="1.2"/>
      <circle cx="50" cy="50" r="13" fill="#a8f0c2" stroke="#0a3a22" stroke-width="2"/>
      <text x="50" y="58" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="18" fill="#0a3a22">Y</text>
      <text x="19" y="44" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="10" fill="#0a3a22">Y</text>
      <text x="81" y="62" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="10" fill="#0a3a22">Y</text>
    </g>`,

  'cash-wad': `<rect x="10" y="28" width="80" height="46" rx="3" fill="#1e6b46" stroke="#0a3a22" stroke-width="2.5"/>
    <rect x="10" y="28" width="80" height="40" rx="3" fill="#3fa86a" stroke="#0a3a22" stroke-width="2.5"/>
    <rect x="10" y="28" width="80" height="34" rx="3" fill="#5ed68c" stroke="#0a3a22" stroke-width="3"/>
    <rect x="14" y="32" width="72" height="26" rx="2" fill="none" stroke="#0a3a22" stroke-width="1"/>
    <text x="50" y="54" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="18" fill="#0a3a22">Y</text>
    <rect x="40" y="22" width="20" height="58" fill="#F0B232" stroke="#6B4910" stroke-width="2.5"/>
    <line x1="40" y1="28" x2="60" y2="28" stroke="#6B4910" stroke-width="1"/>
    <line x1="40" y1="74" x2="60" y2="74" stroke="#6B4910" stroke-width="1"/>
    <text x="50" y="55" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="12" fill="#6B4910" transform="rotate(-90 50 51)">100</text>`,

  // ── Game symbols ──────────────────────────────────────────────────────────
  'star': `<polygon points="50,6 59.9,36.4 91.8,36.4 66,55.2 75.9,85.6 50,66.8 24.1,85.6 34,55.2 8.2,36.4 40.1,36.4" fill="url(#yi-gold)" stroke="#6B4910" stroke-width="2.5"/>`,

  'sparkle': `<polygon points="50,6 56,44 94,50 56,56 50,94 44,56 6,50 44,44" fill="url(#yi-gold)" stroke="#6B4910" stroke-width="2"/>`,

  'lightning': `<polygon points="60,6 26,52 46,52 38,94 76,42 54,42 64,6" fill="url(#yi-goldFlat)" stroke="#6B4910" stroke-width="2.5" stroke-linejoin="round"/>`,

  'dice': `<rect x="14" y="14" width="72" height="72" rx="14" fill="url(#yi-goldFlat)" stroke="#6B4910" stroke-width="2.5"/>
    <circle cx="32" cy="32" r="5" fill="#6B4910"/>
    <circle cx="68" cy="32" r="5" fill="#6B4910"/>
    <circle cx="50" cy="50" r="5" fill="#6B4910"/>
    <circle cx="32" cy="68" r="5" fill="#6B4910"/>
    <circle cx="68" cy="68" r="5" fill="#6B4910"/>`,

  'slot-reels': `<rect x="14" y="22" width="72" height="56" rx="10" fill="#0A101C" stroke="#F0B232" stroke-width="2.5"/>
    <line x1="36" y1="22" x2="36" y2="78" stroke="#F0B232" stroke-width="2"/>
    <line x1="64" y1="22" x2="64" y2="78" stroke="#F0B232" stroke-width="2"/>
    <text x="25" y="58" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="22" fill="#F0B232">Y</text>
    <text x="50" y="58" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="22" fill="#F0B232">Y</text>
    <text x="75" y="58" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="22" fill="#F0B232">Y</text>`,

  'crown': `<polygon points="14,76 24,30 36,54 50,18 64,54 76,30 86,76 86,84 14,84" fill="url(#yi-goldFlat)" stroke="#6B4910" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="24" cy="30" r="4" fill="#6B4910"/>
    <circle cx="50" cy="18" r="5" fill="#6B4910"/>
    <circle cx="76" cy="30" r="4" fill="#6B4910"/>`,

  'clover': `<circle cx="50" cy="30" r="20" fill="#2DC97A"/>
    <circle cx="70" cy="50" r="20" fill="#2DC97A"/>
    <circle cx="50" cy="70" r="20" fill="#2DC97A"/>
    <circle cx="30" cy="50" r="20" fill="#2DC97A"/>
    <circle cx="50" cy="50" r="6" fill="#0a3a22"/>
    <rect x="48" y="50" width="4" height="36" fill="#0a3a22"/>`,

  'wish': `<circle cx="50" cy="50" r="30" fill="none" stroke="#F0B232" stroke-width="3"/>
    <polygon points="50,30 54.5,43.9 69,43.8 57.2,52.4 61.8,66.2 50,57.6 38.2,66.2 42.8,52.4 31,43.8 45.5,43.9" fill="#F0B232"/>
    <circle cx="20" cy="22" r="3" fill="#F0B232"/>
    <circle cx="82" cy="28" r="2.5" fill="#F0B232"/>
    <circle cx="14" cy="64" r="2" fill="#F0B232"/>
    <circle cx="86" cy="74" r="3" fill="#F0B232"/>`,

  // ── Sports ────────────────────────────────────────────────────────────────
  'sports-ball': `<circle cx="50" cy="50" r="42" fill="url(#yi-gold)" stroke="#6B4910" stroke-width="3"/>
    <line x1="8" y1="50" x2="92" y2="50" stroke="#6B4910" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="50" y1="8" x2="50" y2="92" stroke="#6B4910" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 17 21 Q 50 50 17 79" fill="none" stroke="#6B4910" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 83 21 Q 50 50 83 79" fill="none" stroke="#6B4910" stroke-width="2.5" stroke-linecap="round"/>`,

  // ── Rewards & luck ────────────────────────────────────────────────────────
  'gift': `<rect x="14" y="38" width="72" height="50" rx="4" fill="url(#yi-goldFlat)" stroke="#6B4910" stroke-width="2.5"/>
    <rect x="42" y="38" width="16" height="50" fill="#B8801E"/>
    <rect x="14" y="38" width="72" height="12" fill="#B8801E" stroke="#6B4910" stroke-width="2.5"/>
    <circle cx="36" cy="26" r="10" fill="#F0B232" stroke="#6B4910" stroke-width="2.5"/>
    <circle cx="64" cy="26" r="10" fill="#F0B232" stroke="#6B4910" stroke-width="2.5"/>
    <rect x="46" y="22" width="8" height="18" fill="#F0B232" stroke="#6B4910" stroke-width="2.5"/>`,

  'trophy': `<rect x="36" y="60" width="28" height="14" fill="#6B4910"/>
    <rect x="28" y="74" width="44" height="10" rx="2" fill="#6B4910"/>
    <path d="M 30 16 L 30 40 a 20 20 0 0 0 40 0 L 70 16 Z" fill="url(#yi-gold)" stroke="#6B4910" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="20" cy="28" r="9" fill="none" stroke="#6B4910" stroke-width="2.5"/>
    <circle cx="80" cy="28" r="9" fill="none" stroke="#6B4910" stroke-width="2.5"/>
    <text x="50" y="42" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="22" fill="#6B4910">Y</text>`,

  'badge-star': `<circle cx="50" cy="50" r="40" fill="none" stroke="#F0B232" stroke-width="3"/>
    <polygon points="50,28 54.9,40.2 70.9,40.2 58,49.6 62.9,64.8 50,55.4 37.1,64.8 42,49.6 29.1,40.2 45.1,40.2" fill="#F0B232"/>`,

  'ticket': `<defs><clipPath id="yi-tc"><rect x="10" y="22" width="80" height="56" rx="8"/></clipPath></defs>
    <g clip-path="url(#yi-tc)">
      <rect x="10" y="22" width="80" height="56" fill="url(#yi-goldFlat)"/>
      <circle cx="10" cy="50" r="7" fill="#040814"/>
      <circle cx="90" cy="50" r="7" fill="#040814"/>
    </g>
    <rect x="10" y="22" width="80" height="56" rx="8" fill="none" stroke="#6B4910" stroke-width="2.5"/>
    <line x1="50" y1="30" x2="50" y2="70" stroke="#6B4910" stroke-width="1.5" stroke-dasharray="3 4"/>
    <text x="30" y="56" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="22" fill="#6B4910">Y</text>
    <text x="70" y="56" text-anchor="middle" font-family="Geist Mono,monospace" font-size="11" fill="#6B4910" letter-spacing="2">001</text>`,

  'daily-star': `<circle cx="50" cy="50" r="44" fill="none" stroke="#F0B232" stroke-width="3" stroke-dasharray="4 4"/>
    <polygon points="50,22 56.3,41.3 76.6,41.3 60.2,53.3 66.5,72.7 50,60.7 33.5,72.7 39.8,53.3 23.4,41.3 43.7,41.3" fill="url(#yi-gold)" stroke="#6B4910" stroke-width="2"/>`,

  'jackpot': `<circle cx="50" cy="50" r="42" fill="url(#yi-gold)" stroke="#6B4910" stroke-width="2.5"/>
    <text x="50" y="64" text-anchor="middle" font-family="Archivo Black,sans-serif" font-size="34" fill="#6B4910">7</text>
    <text x="50" y="36" text-anchor="middle" font-family="Geist Mono,monospace" font-size="9" letter-spacing="3" fill="#6B4910">JACKPOT</text>`,

  // ── UI & status ───────────────────────────────────────────────────────────
  'lock': `<circle cx="50" cy="40" r="18" fill="none" stroke="#F0B232" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="20" y="40" width="60" height="46" rx="6" fill="none" stroke="#F0B232" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="50" cy="62" r="5" fill="#F0B232"/>
    <line x1="50" y1="62" x2="50" y2="74" stroke="#F0B232" stroke-width="4" stroke-linecap="round"/>`,

  'clock-icon': `<circle cx="50" cy="50" r="38" fill="none" stroke="#F0B232" stroke-width="4" stroke-linecap="round"/>
    <path d="M50 30 V 50 L 64 60" fill="none" stroke="#F0B232" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,

  'plus-icon': `<path d="M50 14 V 86 M14 50 H 86" fill="none" stroke="#F0B232" stroke-width="4" stroke-linecap="round"/>`,

  'arrow': `<path d="M22 50 H 78 M58 30 L 78 50 L 58 70" fill="none" stroke="#F0B232" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,

  'check': `<path d="M22 52 L 42 72 L 78 32" fill="none" stroke="#2DC97A" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`,

  'x-mark': `<path d="M26 26 L 74 74 M74 26 L 26 74" fill="none" stroke="#F0B232" stroke-width="4" stroke-linecap="round"/>`,

  'activity': `<circle cx="50" cy="50" r="36" fill="none" stroke="#F0B232" stroke-width="4" stroke-linecap="round"/>
    <path d="M50 32 V 52 L 62 60" fill="none" stroke="#F0B232" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="3" fill="#F0B232"/>`,

  'shield': `<path d="M50 14 L 86 30 V 54 c 0 18 -16 30 -36 36 c -20 -6 -36 -18 -36 -36 V 30 Z" fill="none" stroke="#F0B232" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M38 50 L 46 58 L 62 42" fill="none" stroke="#F0B232" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
};

const VIEWBOXES: Partial<Record<YalaIconName, string>> = {
  'wordmark': '0 0 130 50',
};

export function YalaIcon({ name, size = 24, className }: YalaIconProps) {
  const viewBox = VIEWBOXES[name] ?? '0 0 100 100';
  const paths = PATHS[name] ?? '';
  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      className={cn('inline-block flex-shrink-0', className)}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: DEFS + paths }}
    />
  );
}

// Convenience wrappers for the most common usage spots
export function GoldCoinIcon({ size = 20, className }: { size?: number; className?: string }) {
  return <YalaIcon name="coin" size={size} className={className} />;
}
export function SweepCoinIcon({ size = 20, className }: { size?: number; className?: string }) {
  // Sweeps now uses the cartoon cash bill from the YALA Asset Pack v2
  return <YalaIcon name="cash-bill" size={size} className={className} />;
}
export function CrownIcon({ size = 20, className }: { size?: number; className?: string }) {
  return <YalaIcon name="crown" size={size} className={className} />;
}
export function PyramidIcon({ size = 20, className }: { size?: number; className?: string }) {
  return <YalaIcon name="pyramid" size={size} className={className} />;
}
