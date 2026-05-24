'use client';
/**
 * YALA Referral Card — 10 design variants.
 *
 * Ported from the YALA Cards Claude Design bundle (yala-cards-1-5.jsx +
 * yala-cards-6-10.jsx + yala-cards.css). Each variant is rendered in a
 * 4:5 portrait at whatever container size, with a small `displayName`
 * applied on variant 8 (the foil card, which has a member line).
 *
 * variant 'rotate' cycles 1→10 every 4s.
 */
import { useEffect, useState, useMemo } from 'react';
import type { CardVariant } from '@/lib/store/auth';

interface Props {
  code: string;
  displayName?: string;
  variant: CardVariant;
  /** Optional CSS width — anything inside; height is derived 5:4 */
  className?: string;
}

const COPY = {
  eyebrow: 'YALA SOCIAL CASINO',
  subhead: "Sign up with your friend's code and play instantly",
};

export function YalaReferralCard({ code, displayName, variant, className }: Props) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (variant !== 'rotate') return;
    const id = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(id);
  }, [variant]);
  const v: number = variant === 'rotate' ? ((tick % 10) + 1) : variant;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4 / 5',
        borderRadius: 24,
        overflow: 'hidden',
        background: v === 10 ? '#f4eee1' : '#060E0A',
        fontFamily: 'Manrope, system-ui, sans-serif',
        color: '#F5F7F2',
        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(240,178,50,0.18)',
        containerType: 'inline-size',
      }}
    >
      {v === 1  && <Card1  code={code} />}
      {v === 2  && <Card2  code={code} />}
      {v === 3  && <Card3  code={code} />}
      {v === 4  && <Card4  code={code} />}
      {v === 5  && <Card5  code={code} />}
      {v === 6  && <Card6  code={code} />}
      {v === 7  && <Card7  code={code} />}
      {v === 8  && <Card8  code={code} displayName={displayName} />}
      {v === 9  && <Card9  code={code} />}
      {v === 10 && <Card10 code={code} />}
    </div>
  );
}

// ── Shared helpers ───────────────────────────────────────────────────────────
const GOLD_TEXT: React.CSSProperties = {
  background: 'linear-gradient(180deg, #FFE9A8 0%, #FFD56B 35%, #F0B232 70%, #C68A1C 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  filter: 'drop-shadow(0 0 18px rgba(240, 178, 50, 0.3))',
};

const goldFrame: React.CSSProperties = {
  position: 'absolute', inset: '2cqi', borderRadius: 18,
  border: '1px solid rgba(240,178,50,0.32)',
  boxShadow: 'inset 0 0 40px rgba(240,178,50,0.06)',
  pointerEvents: 'none', zIndex: 20,
};

function Eyebrow({ color = '#2DC97A' }: { color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5cqi' }}>
      <span style={{ width: '0.7cqi', height: '0.7cqi', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
      <span style={{
        fontFamily: 'Geist Mono, ui-monospace, monospace',
        fontSize: '1.8cqi', letterSpacing: '0.34em',
        color, textShadow: `0 0 12px ${color}50`,
        textTransform: 'uppercase', fontWeight: 500,
      }}>
        {COPY.eyebrow}
      </span>
      <span style={{ width: '0.7cqi', height: '0.7cqi', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
    </div>
  );
}

function CodePill({ code, gold = true, accent = '#F0B232' }: { code: string; gold?: boolean; accent?: string }) {
  return (
    <div style={{
      position: 'relative', padding: '2.4cqi 4.4cqi 3cqi', borderRadius: 14,
      border: `1px solid ${accent}88`,
      background: 'linear-gradient(180deg,#060d09 0%,#030604 100%)',
      boxShadow: `0 0 28px ${accent}33, inset 0 0 20px rgba(0,0,0,0.7)`,
      textAlign: 'center', minWidth: '46cqi',
    }}>
      <div style={{
        fontFamily: 'Geist Mono, monospace', fontSize: '1.5cqi',
        letterSpacing: '0.38em', color: 'rgba(170,180,175,0.68)',
        textTransform: 'uppercase', marginBottom: '0.8cqi',
      }}>USE CODE</div>
      <div style={{
        fontFamily: 'Archivo Black, sans-serif', fontSize: '6.5cqi',
        letterSpacing: '0.12em', lineHeight: 1,
        ...(gold ? GOLD_TEXT : { color: accent }),
      }}>{code}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CARD 01 — Chip Fan
// ════════════════════════════════════════════════════════════════════════════
function PokerChip({ color, accent }: { color: string; accent: string }) {
  // containerType: inline-size makes `cqi` inside this chip resolve to the
  // CHIP's width, not the whole card. Without it, fontSize: 50cqi was
  // sizing the "Y" against the 720px card — hence the massive letters.
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '50%',
      filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.5))',
      containerType: 'inline-size',
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 50%), ${color}`,
        boxShadow: 'inset 0 0 0 6px rgba(0,0,0,0.25), inset 0 -8px 24px rgba(0,0,0,0.35), inset 0 6px 14px rgba(255,255,255,0.18)',
      }} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
        <div key={d} style={{
          position: 'absolute', left: '50%', top: 0, width: '13%', height: '50%',
          marginLeft: '-6.5%', transformOrigin: '50% 100%', transform: `rotate(${d}deg)`,
          background: `linear-gradient(180deg, ${accent} 0%, ${accent} 22%, transparent 22%)`,
        }} />
      ))}
      <div style={{
        position: 'absolute', inset: '22%', borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #fff9e4 0%, #fbf1c8 60%, #e7d090 100%)',
        boxShadow: 'inset 0 0 0 3px rgba(140,110,60,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Archivo Black, sans-serif', color: '#6B4910',
        fontSize: '38cqi', // now scales with the chip itself (~38% of chip width)
        lineHeight: 1,
      }}>Y</div>
    </div>
  );
}

function Card1({ code }: { code: string }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(45,201,122,0.18) 0%, transparent 70%), radial-gradient(ellipse 80% 60% at 50% 60%, #0d2418 0%, #060E0A 75%)' }} />
      <div style={goldFrame} />
      <div style={{ position: 'absolute', top: '8cqi', left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <Eyebrow />
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '11cqi', lineHeight: 0.92, letterSpacing: '-0.025em', margin: '2.5cqi 0 1.5cqi' }}>
          <span>GET </span><span style={GOLD_TEXT}>FREE</span><br />
          <span>COINS</span>
        </h1>
        <p style={{ fontSize: '2cqi', color: 'rgba(200,215,205,0.62)', margin: 0 }}>{COPY.subhead}</p>
      </div>
      {/* 3 chips */}
      <div style={{ position: 'absolute', left: '50%', top: '54%', transform: 'translateX(-50%)', width: '70%', height: '32%' }}>
        <div style={{ position: 'absolute', left: '5%', top: '20%', width: '36%', transform: 'rotate(-18deg)' }}>
          <PokerChip color="#2DC97A" accent="#0d2418" />
        </div>
        <div style={{ position: 'absolute', left: '50%', top: 0, width: '42%', transform: 'translateX(-50%) scale(1.05)', zIndex: 2 }}>
          <PokerChip color="#F0B232" accent="#3a2408" />
        </div>
        <div style={{ position: 'absolute', right: '5%', top: '20%', width: '36%', transform: 'rotate(18deg)' }}>
          <PokerChip color="#1E7A4A" accent="#0d2418" />
        </div>
      </div>
      <div style={{ position: 'absolute', left: '50%', bottom: '7cqi', transform: 'translateX(-50%)' }}>
        <CodePill code={code} />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CARD 02 — Medallion Seal
// ════════════════════════════════════════════════════════════════════════════
function Card2({ code }: { code: string }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle 50% at 50% 52%, rgba(240,178,50,0.22) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 50% 50%, #0d2418 0%, #060E0A 75%)' }} />
      <div style={goldFrame} />
      <div style={{ position: 'absolute', top: '7cqi', left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <Eyebrow />
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '9cqi', lineHeight: 0.92, letterSpacing: '-0.025em', margin: '2.5cqi 0 1.5cqi' }}>
          <span>GET </span><span style={GOLD_TEXT}>FREE</span> <span>COINS</span>
        </h1>
        <p style={{ fontSize: '1.9cqi', color: 'rgba(200,215,205,0.62)', margin: 0 }}>{COPY.subhead}</p>
      </div>
      <div style={{
        position: 'absolute', left: '50%', top: '38%', transform: 'translateX(-50%)',
        width: '48%', aspectRatio: '1', borderRadius: '50%',
        background: 'radial-gradient(circle at 32% 28%, #FFF4D0 0%, #FFE08A 16%, #FFD56B 32%, #F0B232 56%, #B8801E 84%, #6B4910 100%)',
        boxShadow: 'inset 0 0 0 6px rgba(80,50,5,0.55), inset 0 18px 32px rgba(255,240,180,0.45), inset 0 -20px 36px rgba(80,50,5,0.7), 0 30px 60px rgba(0,0,0,0.55), 0 0 50px rgba(240,178,50,0.35)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Archivo Black, sans-serif', color: '#6B4910', fontSize: '45cqi',
          textShadow: '0 1px 0 rgba(255,240,180,0.7), 0 -1px 0 rgba(40,25,0,0.55)',
        }}>Y</div>
      </div>
      <div style={{ position: 'absolute', left: '50%', bottom: '7cqi', transform: 'translateX(-50%)' }}>
        <CodePill code={code} />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CARD 03 — Pyramid Hologram
// ════════════════════════════════════════════════════════════════════════════
function Card3({ code }: { code: string }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 60%, rgba(45,201,122,0.25) 0%, transparent 70%), linear-gradient(180deg, #050d09 0%, #060E0A 100%)' }} />
      {/* grid floor */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '36%',
        background: 'linear-gradient(180deg, transparent 0%, #060E0A 100%), repeating-linear-gradient(0deg, transparent 0px, transparent 28px, rgba(45,201,122,0.18) 28px, rgba(45,201,122,0.18) 29px), repeating-linear-gradient(90deg, transparent 0px, transparent 36px, rgba(45,201,122,0.12) 36px, rgba(45,201,122,0.12) 37px)',
        transform: 'perspective(700px) rotateX(60deg)', transformOrigin: '50% 100%', opacity: 0.5,
      }} />
      <div style={{ ...goldFrame, borderColor: 'rgba(45,201,122,0.35)' }} />
      <div style={{ position: 'absolute', top: '7cqi', left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <Eyebrow />
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '10cqi', lineHeight: 0.92, letterSpacing: '-0.025em', margin: '2.5cqi 0 1.5cqi' }}>
          <span>GET </span><span style={GOLD_TEXT}>FREE</span><br />
          <span>COINS</span>
        </h1>
        <p style={{ fontSize: '2cqi', color: 'rgba(200,215,205,0.62)', margin: 0 }}>{COPY.subhead}</p>
      </div>
      <div style={{ position: 'absolute', left: '50%', top: '40%', transform: 'translateX(-50%)', width: '52%', aspectRatio: '1' }}>
        <svg viewBox="0 0 380 360" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 18px rgba(45,201,122,0.7)) drop-shadow(0 0 48px rgba(45,201,122,0.35))' }}>
          <defs>
            <linearGradient id="c3face" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#6FF2A8" stopOpacity="0.55"/><stop offset="1" stopColor="#2DC97A" stopOpacity="0.15"/></linearGradient>
            <linearGradient id="c3rface" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#2DC97A" stopOpacity="0.4"/><stop offset="1" stopColor="#0e3a22" stopOpacity="0.1"/></linearGradient>
            <linearGradient id="c3edge" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#B0F7D0"/><stop offset="1" stopColor="#2DC97A"/></linearGradient>
          </defs>
          <ellipse cx="190" cy="320" rx="160" ry="28" fill="#2DC97A" opacity="0.18"/>
          <polygon points="190,40 50,300 190,320" fill="url(#c3face)"/>
          <polygon points="190,40 330,300 190,320" fill="url(#c3rface)"/>
          <polyline points="190,40 50,300 190,320 330,300 190,40" fill="none" stroke="url(#c3edge)" strokeWidth="2.5" strokeLinejoin="miter"/>
          <line x1="190" y1="40" x2="190" y2="320" stroke="url(#c3edge)" strokeWidth="2.5" opacity="0.8"/>
          <polygon points="190,120 130,260 250,260" fill="none" stroke="#6FF2A8" strokeWidth="1" opacity="0.5"/>
          <circle cx="190" cy="40" r="6" fill="#B0F7D0"/>
          <circle cx="190" cy="40" r="14" fill="#B0F7D0" opacity="0.3"/>
          <text x="190" y="245" textAnchor="middle" fontFamily="Archivo Black, sans-serif" fontSize="64" fill="#B0F7D0" opacity="0.9">Y</text>
        </svg>
      </div>
      <div style={{ position: 'absolute', left: '50%', bottom: '7cqi', transform: 'translateX(-50%)' }}>
        <CodePill code={code} gold={false} accent="#2DC97A" />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CARD 04 — Marquee Bulbs
// ════════════════════════════════════════════════════════════════════════════
function Card4({ code }: { code: string }) {
  const bulbs = useMemo(() => {
    const arr: { left: string; top: string }[] = [];
    const stepPct = 4;
    for (let p = stepPct; p < 100; p += stepPct) {
      arr.push({ left: `${p}%`, top: '2%' });
      arr.push({ left: `${p}%`, top: '95%' });
    }
    for (let p = stepPct; p < 100; p += stepPct) {
      arr.push({ left: '2%', top: `${p}%` });
      arr.push({ left: '96%', top: `${p}%` });
    }
    return arr;
  }, []);
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(240,178,50,0.18) 0%, transparent 65%), radial-gradient(ellipse 90% 70% at 50% 50%, #1a0f04 0%, #0b0703 100%)' }} />
      <div style={{ position: 'absolute', inset: '2.5cqi', pointerEvents: 'none' }}>
        {bulbs.map((p, i) => (
          <div key={i} style={{
            position: 'absolute', left: p.left, top: p.top,
            width: '1.9cqi', height: '1.9cqi', borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #FFF1B0 0%, #FFD56B 40%, #C68A1C 100%)',
            boxShadow: '0 0 10px rgba(255,213,107,0.85), 0 0 22px rgba(255,213,107,0.4)',
          }} />
        ))}
      </div>
      <div style={{ position: 'absolute', top: '11cqi', left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <Eyebrow color="#FFD56B" />
        <h1 style={{
          fontFamily: 'Bebas Neue, sans-serif', fontSize: '24cqi', lineHeight: 0.85,
          letterSpacing: '0.04em', margin: '4cqi 0 1.5cqi',
          background: 'linear-gradient(180deg, #FFF1B0 0%, #FFD56B 40%, #F0B232 70%, #8a5a14 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 6px 18px rgba(255,213,107,0.45))',
        }}>777</h1>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '4cqi', letterSpacing: '0.18em', color: '#F5F7F2', marginBottom: '1cqi' }}>GET FREE COINS</div>
        <p style={{ fontSize: '1.9cqi', color: 'rgba(200,215,205,0.62)', margin: 0 }}>{COPY.subhead}</p>
      </div>
      <div style={{ position: 'absolute', left: '50%', bottom: '10cqi', transform: 'translateX(-50%)' }}>
        <CodePill code={code} gold={false} accent="#FFD56B" />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CARD 05 — Burst Type
// ════════════════════════════════════════════════════════════════════════════
function Card5({ code }: { code: string }) {
  const parts = useMemo(() => {
    const arr: { x: number; y: number; size: number; o: number; teal: boolean }[] = [];
    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 * i) / 60 + (Math.random() - 0.5) * 0.3;
      const r = 32 + Math.random() * 22;
      arr.push({
        x: 50 + Math.cos(angle) * r,
        y: 55 + Math.sin(angle) * r * 0.85,
        size: 0.3 + Math.random() * 0.45,
        o: 0.35 + Math.random() * 0.5,
        teal: Math.random() > 0.55,
      });
    }
    return arr;
  }, []);
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle 50% at 50% 50%, rgba(45,201,122,0.32) 0%, rgba(45,201,122,0.05) 50%, transparent 75%), #060E0A' }} />
      {parts.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: `${p.size}cqi`, height: `${p.size}cqi`, borderRadius: '50%', opacity: p.o,
          background: p.teal
            ? 'radial-gradient(circle, #B0F7D0 0%, rgba(45,201,122,0.6) 40%, rgba(45,201,122,0) 70%)'
            : 'radial-gradient(circle, #fff3cf 0%, rgba(255,224,138,0.7) 40%, rgba(240,178,50,0) 70%)',
          boxShadow: p.teal ? '0 0 4px rgba(45,201,122,0.7)' : '0 0 4px rgba(255,224,138,0.7)',
        }} />
      ))}
      <div style={goldFrame} />
      <div style={{ position: 'absolute', top: '11cqi', left: 0, right: 0, textAlign: 'center', zIndex: 5, padding: '0 6cqi' }}>
        <Eyebrow />
        <h1 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '3.5cqi', letterSpacing: '-0.01em', margin: '2.5cqi 0 1.2cqi', color: '#F5F7F2' }}>
          Get free coins. No catch.
        </h1>
        <p style={{ fontSize: '1.8cqi', color: 'rgba(200,215,205,0.62)', margin: '0 auto', maxWidth: '60cqi' }}>{COPY.subhead}</p>
      </div>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', padding: '0 4cqi', width: '100%' }}>
        <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '1.8cqi', letterSpacing: '0.42em', color: 'rgba(180,195,188,0.65)', textTransform: 'uppercase', marginBottom: '2cqi' }}>USE CODE</div>
        {/* clamp scales the hero code down on longer referral strings so it doesn't blow past the card edges */}
        <div style={{
          fontFamily: 'Archivo Black, sans-serif',
          fontSize: `clamp(6cqi, calc(72cqi / ${Math.max(code.length, 4)}), 14cqi)`,
          letterSpacing: '0.04em', lineHeight: 1, ...GOLD_TEXT,
        }}>{code}</div>
        <div style={{ width: '12cqi', height: '0.4cqi', margin: '3cqi auto 0', background: 'linear-gradient(90deg, transparent, #2DC97A, transparent)', boxShadow: '0 0 14px #2DC97A' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '9cqi', left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1.5cqi', fontFamily: 'Geist Mono, monospace', fontSize: '1.7cqi', color: 'rgba(200,215,205,0.62)', letterSpacing: '0.32em', textTransform: 'uppercase' }}>
          <span>4× MULTIPLIER</span><span style={{ color: '#2DC97A' }}>·</span><span>NO DEPOSIT</span><span style={{ color: '#2DC97A' }}>·</span><span>INSTANT</span>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CARD 06 — Slot Reels
// ════════════════════════════════════════════════════════════════════════════
function Card6({ code }: { code: string }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(45,201,122,0.18) 0%, transparent 65%), radial-gradient(ellipse 90% 80% at 50% 50%, #0e1b14 0%, #060E0A 80%)' }} />
      <div style={goldFrame} />
      <div style={{ position: 'absolute', top: '7cqi', left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <Eyebrow />
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '10cqi', lineHeight: 0.92, letterSpacing: '-0.025em', margin: '2.5cqi 0 1.5cqi' }}>
          <span>GET </span><span style={GOLD_TEXT}>FREE</span><br />
          <span>COINS</span>
        </h1>
        <p style={{ fontSize: '2cqi', color: 'rgba(200,215,205,0.62)', margin: 0 }}>{COPY.subhead}</p>
      </div>
      {/* badge */}
      <div style={{
        position: 'absolute', left: '50%', top: '38%', transform: 'translateX(-50%)',
        fontFamily: 'Geist Mono, monospace', fontSize: '1.6cqi', letterSpacing: '0.42em',
        padding: '0.6cqi 2cqi', borderRadius: 999, background: 'rgba(45,201,122,0.12)',
        border: '1px solid rgba(45,201,122,0.45)', color: '#2DC97A', textTransform: 'uppercase', zIndex: 6,
      }}>JACKPOT TRIPLE Y</div>
      {/* machine */}
      <div style={{
        position: 'absolute', left: '50%', top: '42%', transform: 'translateX(-50%)',
        width: '76%', aspectRatio: '2.1 / 1', padding: '3cqi', borderRadius: 20,
        background: 'linear-gradient(180deg, #1a0f04 0%, #0b0703 100%)',
        border: '2px solid rgba(240,178,50,0.55)',
        boxShadow: '0 0 40px rgba(240,178,50,0.2), inset 0 0 36px rgba(0,0,0,0.85)',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2cqi',
      }}>
        {['Y', 'Y', 'Y'].map((s, i) => (
          <div key={i} style={{
            position: 'relative', borderRadius: 10,
            background: 'linear-gradient(180deg, #fef8e0 0%, #fbe5a6 35%, #f0c853 65%, #c68a1c 100%)',
            boxShadow: 'inset 0 -8px 18px rgba(80,50,5,0.45), inset 0 6px 12px rgba(255,255,255,0.7), inset 0 0 0 2px rgba(120,75,10,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Archivo Black, sans-serif', fontSize: '14cqi', color: '#6B4910',
            textShadow: '0 2px 0 rgba(255,240,180,0.6), 0 -2px 0 rgba(40,25,0,0.5)',
          }}>{s}</div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: '50%', bottom: '8cqi', transform: 'translateX(-50%)' }}>
        <CodePill code={code} />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CARD 07 — Ticket Stub
// ════════════════════════════════════════════════════════════════════════════
function Card7({ code }: { code: string }) {
  const widths = useMemo(() => Array.from({ length: 36 }, (_, i) => 1 + (i % 4 === 0 ? 2 : Math.random() > 0.6 ? 2 : 1)), []);
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: '#050a07' }} />
      <div style={{
        position: 'absolute', inset: '5cqi', borderRadius: 6,
        background: 'linear-gradient(180deg, #f6efde 0%, #ece1c1 100%)',
        color: '#2a2218', display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 60px rgba(0,0,0,0.55)', overflow: 'hidden',
      }}>
        {/* head */}
        <div style={{ padding: '3.5cqi 5cqi 2.5cqi', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px dashed rgba(80,50,5,0.35)' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '5cqi', letterSpacing: '0.14em', lineHeight: 1 }}>
            ADMIT ONE
            <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '1.6cqi', letterSpacing: '0.36em', marginTop: '0.8cqi', color: 'rgba(60,45,20,0.6)' }}>YALA SOCIAL CASINO</div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'Geist Mono, monospace', fontSize: '1.4cqi', letterSpacing: '0.28em', color: 'rgba(60,45,20,0.6)' }}>
            NO. <div style={{ fontSize: '2cqi', color: '#2a2218', marginTop: '0.5cqi', letterSpacing: '0.18em' }}>A-2024-0481</div>
          </div>
        </div>
        {/* body */}
        <div style={{ padding: '4cqi 5cqi 2.5cqi', flex: 1 }}>
          <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '1.5cqi', letterSpacing: '0.4em', color: 'rgba(60,45,20,0.7)', textTransform: 'uppercase' }}>REFERRAL TICKET</div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '13cqi', lineHeight: 0.88, letterSpacing: '0.02em', margin: '2cqi 0', color: '#1c1a14' }}>
            GET <span style={{ background: 'linear-gradient(180deg, #d8a02a 0%, #9c6b0e 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FREE</span><br/>COINS
          </h1>
          <p style={{ color: 'rgba(60,45,20,0.7)', fontSize: '1.9cqi', margin: 0 }}>{COPY.subhead}</p>
        </div>
        {/* stub */}
        <div style={{ padding: '3cqi 5cqi 4cqi', borderTop: '1.5px dashed rgba(80,50,5,0.35)', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: '2cqi' }}>
          <div>
            <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '1.3cqi', letterSpacing: '0.4em', color: 'rgba(60,45,20,0.6)', textTransform: 'uppercase', marginBottom: '0.8cqi' }}>USE CODE</div>
            <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '6cqi', letterSpacing: '0.1em', color: '#1c1a14' }}>{code}</div>
          </div>
          <div style={{ display: 'flex', gap: 2, alignItems: 'end', height: '8cqi' }}>
            {widths.map((w, i) => <span key={i} style={{ display: 'block', width: w, height: '100%', background: '#1c1a14' }} />)}
          </div>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CARD 08 — Foil Card (has displayName)
// ════════════════════════════════════════════════════════════════════════════
function Card8({ code, displayName }: { code: string; displayName?: string }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 45%, #0d1b13 0%, #060E0A 80%)' }} />
      <div style={goldFrame} />
      <div style={{ position: 'absolute', top: '7cqi', left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <Eyebrow />
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '9cqi', lineHeight: 0.92, letterSpacing: '-0.025em', margin: '2.5cqi 0 1.5cqi' }}>
          <span>GET </span><span style={GOLD_TEXT}>FREE</span> <span>COINS</span>
        </h1>
        <p style={{ fontSize: '1.9cqi', color: 'rgba(200,215,205,0.62)', margin: 0 }}>{COPY.subhead}</p>
      </div>
      {/* foil card */}
      <div style={{
        position: 'absolute', left: '50%', top: '45%', transform: 'translateX(-50%) rotate(-3deg)',
        width: '78%', aspectRatio: '1.65 / 1', borderRadius: 22,
        background: 'linear-gradient(120deg, #B8801E 0%, #F0B232 18%, #FFE9A8 32%, #FFD56B 44%, #C68A1C 60%, #FFE9A8 74%, #F0B232 88%, #8a5a14 100%)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.55), 0 0 60px rgba(240,178,50,0.18), inset 0 0 0 1.5px rgba(80,50,5,0.5)',
        padding: '4cqi 4.5cqi', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        color: '#2a1a08',
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 22,
          background: 'repeating-linear-gradient(120deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 8px)',
          mixBlendMode: 'overlay', pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '4cqi', letterSpacing: '0.04em', color: '#2a1a08' }}>
            YALA
            <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '1.4cqi', letterSpacing: '0.32em', fontWeight: 500, marginTop: '0.5cqi' }}>SOCIAL · CASINO</div>
          </div>
          <div style={{
            width: '8cqi', height: '6cqi', borderRadius: 6,
            background: 'linear-gradient(135deg, #d8a022 0%, #ffd56b 50%, #8a5a14 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(80,50,5,0.5)',
          }} />
        </div>
        <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '8cqi', letterSpacing: '0.16em', color: '#2a1a08', textShadow: '0 1px 0 rgba(255,240,180,0.7)', position: 'relative' }}>{code}</div>
        <div style={{ display: 'flex', gap: '3cqi', alignItems: 'flex-end', position: 'relative' }}>
          <div>
            <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '1.2cqi', letterSpacing: '0.36em', color: 'rgba(60,30,5,0.7)', textTransform: 'uppercase', marginBottom: '0.5cqi' }}>MEMBER</div>
            <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '1.9cqi', letterSpacing: '0.14em', color: '#2a1a08', fontWeight: 600, textTransform: 'uppercase' }}>
              {(displayName || 'REFERRED').slice(0, 16)}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '7cqi', color: '#2a1a08', lineHeight: 1, textShadow: '0 1px 0 rgba(255,240,180,0.7)' }}>Y</div>
        </div>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: '7cqi', textAlign: 'center',
        fontFamily: 'Geist Mono, monospace', fontSize: '1.5cqi', letterSpacing: '0.4em',
        color: 'rgba(200,215,205,0.38)', textTransform: 'uppercase', zIndex: 5,
      }}>
        USE CODE <span style={{ color: '#2DC97A', margin: '0 1.5cqi' }}>·</span> AT SIGN-UP <span style={{ color: '#2DC97A', margin: '0 1.5cqi' }}>·</span> INSTANT REWARD
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CARD 09 — Y Pattern
// ════════════════════════════════════════════════════════════════════════════
function Card9({ code }: { code: string }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle 45% at 50% 50%, rgba(0,0,0,0.85) 0%, rgba(6,14,10,0.95) 50%, rgba(6,14,10,1) 100%), #060E0A' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridAutoRows: '16.66%', placeItems: 'center', opacity: 0.55 }}>
        {Array.from({ length: 36 }).map((_, i) => (
          <span key={i} style={{
            fontFamily: 'Archivo Black, sans-serif', fontSize: '10cqi',
            color: i % 5 === 0 ? 'rgba(45,201,122,0.10)' : 'rgba(240,178,50,0.16)',
            userSelect: 'none',
          }}>Y</span>
        ))}
      </div>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: '64%', aspectRatio: '1', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(45,201,122,0.32) 0%, rgba(45,201,122,0.08) 40%, transparent 70%)', filter: 'blur(8px)', zIndex: 2 }} />
      <div style={goldFrame} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8cqi' }}>
        <div style={{ marginBottom: '3cqi' }}><Eyebrow /></div>
        <h1 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '11cqi', lineHeight: 0.92, letterSpacing: '-0.025em', margin: '0 0 2.5cqi', textAlign: 'center' }}>
          <span>GET </span><span style={GOLD_TEXT}>FREE</span><br/>
          <span>COINS</span>
        </h1>
        <p style={{ fontSize: '2cqi', color: 'rgba(200,215,205,0.62)', margin: '0 0 5cqi', textAlign: 'center', maxWidth: '52cqi' }}>{COPY.subhead}</p>
        <CodePill code={code} />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CARD 10 — Editorial Cover (light)
// ════════════════════════════════════════════════════════════════════════════
function Card10({ code }: { code: string }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 40% at 50% 70%, rgba(45,201,122,0.18) 0%, transparent 60%), linear-gradient(180deg, #f4eee1 0%, #ebe2cd 100%)' }} />
      <div style={{ position: 'absolute', top: '5cqi', left: '7cqi', right: '7cqi', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Geist Mono, monospace', fontSize: '1.5cqi', letterSpacing: '0.32em', color: 'rgba(60,45,20,0.7)', textTransform: 'uppercase' }}>
        <div style={{ color: '#2DC97A' }}>YALA · SOCIAL CASINO</div>
        <div style={{ fontSize: '1.4cqi', color: 'rgba(60,45,20,0.5)' }}>ISSUE 001</div>
      </div>
      <div style={{ position: 'absolute', top: '14cqi', left: '7cqi', right: '7cqi', bottom: '7cqi', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: 'Anton, Bebas Neue, sans-serif', fontSize: '30cqi', lineHeight: 0.86, letterSpacing: '-0.01em', margin: 0, color: '#1c1a14', textTransform: 'uppercase' }}>
          GET
          <span style={{ display: 'block', marginLeft: '4cqi', fontStyle: 'italic', fontFamily: 'Playfair Display, serif', fontWeight: 900, background: 'linear-gradient(180deg, #d8a02a 0%, #9c6b0e 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>free</span>
          <span style={{ display: 'flex', alignItems: 'flex-end', gap: '2cqi' }}>
            <span style={{ lineHeight: 0.86 }}>COINS</span>
            <span style={{ width: '3.5cqi', height: '3.5cqi', borderRadius: '50%', background: '#2DC97A', marginBottom: '3.5cqi', boxShadow: '0 0 14px rgba(45,201,122,0.45)' }} />
          </span>
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '2cqi' }}>
          <p style={{ maxWidth: '34cqi', fontFamily: 'Manrope, sans-serif', fontWeight: 500, fontSize: '2cqi', color: 'rgba(40,30,18,0.78)', borderTop: '1.5px solid rgba(40,30,18,0.4)', paddingTop: '1.5cqi', margin: 0 }}>
            Sign up with a friend&apos;s code and play <em style={{ color: '#2DC97A', fontStyle: 'normal' }}>instantly</em>. The good kind of free.
          </p>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Geist Mono, monospace', fontSize: '1.5cqi', letterSpacing: '0.4em', color: 'rgba(60,45,20,0.6)', textTransform: 'uppercase', marginBottom: '0.5cqi' }}>USE CODE</div>
            <div style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: '8cqi', letterSpacing: '0.06em', color: '#1c1a14', borderBottom: '4px solid #2DC97A', paddingBottom: '0.5cqi' }}>{code}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export const CARD_OPTIONS: { id: CardVariant; label: string }[] = [
  { id: 8,  label: '08 · Foil Card (default)' },
  { id: 1,  label: '01 · Chip Fan' },
  { id: 2,  label: '02 · Medallion' },
  { id: 3,  label: '03 · Pyramid Hologram' },
  { id: 4,  label: '04 · Marquee 777' },
  { id: 5,  label: '05 · Burst Type' },
  { id: 6,  label: '06 · Slot Reels' },
  { id: 7,  label: '07 · Ticket Stub' },
  { id: 9,  label: '09 · Y Pattern' },
  { id: 10, label: '10 · Editorial Cover' },
  { id: 'rotate', label: '✦ Rotate (cycles all 10)' },
];
