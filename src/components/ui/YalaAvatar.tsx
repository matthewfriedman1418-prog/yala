/**
 * YALA Avatar — tier-ringed user avatar
 * Source: YALA Asset Pack · Section 09 (Avatars)
 *
 * Tiers map to user.vipTier (1-based, but we treat 0 as guest):
 *   0      → Newbie  (dashed gray ring)
 *   1      → Bronze  (solid bronze ring)
 *   2-3    → Gold    (gradient gold ring + star badge)
 *   4-5    → Diamond (dashed green ring + diamond badge)
 *   6+     → Jackpot (green→gold gradient ring + "7" badge)
 */
'use client';
import { cn } from '@/lib/utils';

export type AvatarTier = 'newbie' | 'bronze' | 'gold' | 'diamond' | 'jackpot';

interface YalaAvatarProps {
  /** Single letter or short string to display when no photo (e.g. "DF") */
  initials: string;
  /** Tier band (also accepts a numeric VIP tier 0-100 and we map it) */
  tier?: AvatarTier | number;
  size?: number;
  /** Optional photo URL — if provided, displayed inside the ring */
  src?: string;
  className?: string;
  /** Hides the tier badge in the bottom-right corner */
  hideBadge?: boolean;
}

function tierFromVip(vip: number): AvatarTier {
  if (vip >= 6) return 'jackpot';
  if (vip >= 4) return 'diamond';
  if (vip >= 2) return 'gold';
  if (vip >= 1) return 'bronze';
  return 'newbie';
}

// Stable id suffix per instance to avoid SVG <defs> id collisions when many
// avatars render on the same page.
let _uid = 0;
function nextId() { return `ya${++_uid}`; }

export function YalaAvatar({
  initials,
  tier = 'newbie',
  size = 36,
  src,
  className,
  hideBadge = false,
}: YalaAvatarProps) {
  const resolved: AvatarTier = typeof tier === 'number' ? tierFromVip(tier) : tier;
  const uid = nextId();
  const badgeSize = Math.max(14, Math.round(size * 0.36));
  const inset = Math.max(3, Math.round(size * 0.10)); // gap between ring and photo
  const initial = (initials || 'U').slice(0, 2).toUpperCase();

  // Ring SVG per tier
  const Ring = () => {
    if (resolved === 'newbie') {
      return (
        <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
          <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(200,215,205,0.30)" strokeWidth="2" strokeDasharray="3 4" />
        </svg>
      );
    }
    if (resolved === 'bronze') {
      return (
        <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
          <circle cx="60" cy="60" r="56" fill="none" stroke="#8a5a14" strokeWidth="3" />
        </svg>
      );
    }
    if (resolved === 'gold') {
      return (
        <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id={`${uid}-g`} x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#FFE9A8" />
              <stop offset="0.5" stopColor="#F0B232" />
              <stop offset="1" stopColor="#8a5a14" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="56" fill="none" stroke={`url(#${uid}-g)`} strokeWidth="4" />
          <circle cx="60" cy="60" r="58" fill="none" stroke="rgba(240,178,50,0.25)" strokeWidth="1" />
        </svg>
      );
    }
    if (resolved === 'diamond') {
      return (
        <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
          <circle cx="60" cy="60" r="56" fill="none" stroke="#2DC97A" strokeWidth="4" strokeDasharray="12 6" />
        </svg>
      );
    }
    // jackpot
    return (
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={`${uid}-j`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0"   stopColor="#B0F7D0" />
            <stop offset="0.4" stopColor="#2DC97A" />
            <stop offset="0.7" stopColor="#FFE08A" />
            <stop offset="1"   stopColor="#F0B232" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="56" fill="none" stroke={`url(#${uid}-j)`} strokeWidth="5" />
      </svg>
    );
  };

  // Badge per tier (bottom-right gem indicator)
  const Badge = () => {
    if (hideBadge || resolved === 'newbie' || resolved === 'bronze') return null;

    const style: React.CSSProperties = {
      position: 'absolute',
      right: -Math.round(badgeSize * 0.15),
      bottom: -Math.round(badgeSize * 0.15),
      width: badgeSize,
      height: badgeSize,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid #0c1812',
    };

    if (resolved === 'gold') {
      return (
        <div style={{ ...style, background: 'linear-gradient(180deg, #FFE9A8, #F0B232 60%, #8a5a14)', boxShadow: '0 2px 8px rgba(240,178,50,0.4)' }}>
          <svg viewBox="0 0 100 100" style={{ width: badgeSize * 0.55, height: badgeSize * 0.55 }}>
            <polygon points="50,12 60,38 88,40 66,58 74,86 50,72 26,86 34,58 12,40 40,38" fill="#6B4910" />
          </svg>
        </div>
      );
    }
    if (resolved === 'diamond') {
      return (
        <div style={{ ...style, background: '#2DC97A' }}>
          <svg viewBox="0 0 100 100" style={{ width: badgeSize * 0.6, height: badgeSize * 0.6 }}>
            <polygon points="50,12 82,42 50,90 18,42" fill="#06120a" />
          </svg>
        </div>
      );
    }
    // jackpot
    return (
      <div style={{ ...style, background: '#0c1812', border: '2px solid #F0B232' }}>
        <span style={{ fontFamily: 'Archivo Black,sans-serif', fontSize: badgeSize * 0.55, color: '#F0B232', lineHeight: 1 }}>7</span>
      </div>
    );
  };

  return (
    <div
      className={cn('relative flex-shrink-0 inline-block', className)}
      style={{ width: size, height: size }}
      aria-label={`${initial} avatar, ${resolved} tier`}
    >
      <Ring />
      {/* Photo */}
      <div
        className="absolute rounded-full overflow-hidden flex items-center justify-center"
        style={{
          inset: inset,
          background: src ? undefined : 'radial-gradient(circle at 30% 30%, #1f3a2a 0%, #0a1a12 100%)',
          backgroundImage: src
            ? `url(${src})`
            : 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 6px, transparent 6px 12px), radial-gradient(circle at 30% 30%, #1f3a2a 0%, #0a1a12 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!src && (
          <span
            style={{
              fontFamily: 'Archivo Black,sans-serif',
              color: resolved === 'newbie' ? 'rgba(255,255,255,0.4)' :
                     resolved === 'bronze' ? '#FFE08A' :
                     resolved === 'gold'   ? '#FFE08A' :
                     resolved === 'diamond'? '#B0F7D0' :
                     '#FFE08A',
              fontSize: size * 0.36,
              lineHeight: 1,
              letterSpacing: '0.02em',
            }}
          >
            {initial}
          </span>
        )}
      </div>
      <Badge />
    </div>
  );
}
