'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC } from '@/lib/utils';
import {
  Copy, CheckCircle2, Users, TrendingUp, Link as LinkIcon,
  MousePointer, ShoppingCart, Zap, Download,
  ChevronRight, Star, ExternalLink
} from 'lucide-react';
import { YalaReferralCard, CARD_OPTIONS } from '@/components/affiliate/YalaReferralCard';
import type { CardVariant } from '@/lib/store/auth';
import { toast } from 'sonner';

// Pyramid SVG (for the sharing card)
function CardPyramid({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 40 34" fill="none">
      <defs><clipPath id="pyr-aff"><polygon points="20,0 40,34 0,34" /></clipPath></defs>
      <rect x="0" y="0" width="40" height="8.5" fill="#F0B232" clipPath="url(#pyr-aff)" />
      <rect x="0" y="8.5" width="40" height="8.5" fill="#84CC16" clipPath="url(#pyr-aff)" />
      <rect x="0" y="17" width="40" height="8.5" fill="#2DC97A" clipPath="url(#pyr-aff)" />
      <rect x="0" y="25.5" width="40" height="8.5" fill="#1A5C8A" clipPath="url(#pyr-aff)" />
    </svg>
  );
}

const MOCK_REFERRALS = [
  { username: 'FastPlayer99',  joinDate: '2026-05-18', status: 'active',  earned: 5000, wagered: 48200 },
  { username: 'GoldHunterX',   joinDate: '2026-05-14', status: 'active',  earned: 5000, wagered: 32100 },
  { username: 'NightRider88',  joinDate: '2026-05-03', status: 'active',  earned: 5000, wagered: 21900 },
  { username: 'LuckyAce777',   joinDate: '2026-04-28', status: 'pending', earned: 0,    wagered: 0 },
  { username: 'StarPlayer_K',  joinDate: '2026-04-15', status: 'active',  earned: 5000, wagered: 18400 },
  { username: 'CoinMaster2k',  joinDate: '2026-04-01', status: 'active',  earned: 5000, wagered: 9700 },
];

const COMMISSION_TIERS = [
  { tier: 'Starter',   refs: '1–4',   rate: '5,000 GC / referral', bonus: null,          color: '#8FA3B8' },
  { tier: 'Silver',    refs: '5–19',  rate: '5,000 GC + 1% wager', bonus: '10K GC bonus', color: '#C0C0C0' },
  { tier: 'Gold',      refs: '20–49', rate: '5,000 GC + 2% wager', bonus: '50K GC bonus', color: '#F0B232' },
  { tier: 'Platinum',  refs: '50+',   rate: '5,000 GC + 3% wager', bonus: 'Custom deal',  color: '#A78BFA' },
];

// ── Portrait invite card — matches HTML design ──────────────────────────────
function SharingCard({ code }: { code: string }) {
  return (
    <div
      className="relative overflow-hidden select-none w-full"
      style={{
        aspectRatio: '4 / 5',
        borderRadius: '24px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 55%, #0b2418 0%, #081610 45%, #040814 75%)',
        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(240,178,50,0.18), 0 0 40px rgba(45,201,122,0.06)',
        containerType: 'inline-size',
      }}
    >
      {/* Inner gold frame */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: '10px',
          borderRadius: '18px',
          border: '1px solid rgba(240,178,50,0.32)',
          boxShadow: 'inset 0 0 40px rgba(240,178,50,0.07), 0 0 24px rgba(240,178,50,0.1)',
          zIndex: 10,
        }}
      />

      {/* Corner glyphs */}
      {[
        { top: '22px', left: '22px',  borderRight: 'none', borderBottom: 'none' },
        { top: '22px', right: '22px', borderLeft:  'none', borderBottom: 'none' },
        { bottom: '22px', left: '22px',  borderRight: 'none', borderTop: 'none' },
        { bottom: '22px', right: '22px', borderLeft:  'none', borderTop: 'none' },
      ].map((s, i) => (
        <div key={i} className="absolute pointer-events-none" style={{ ...s, width: 14, height: 14, border: '1px solid rgba(240,178,50,0.4)', zIndex: 11 }} />
      ))}

      {/* Watermark pyramid */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.07, zIndex: 1 }}>
        <svg viewBox="0 0 200 200" width="75%" height="75%">
          <defs>
            <linearGradient id="pyrFillAff" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#FFE08A" stopOpacity="0.8" />
              <stop offset="1" stopColor="#F0B232" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <polygon points="100,16 184,176 16,176" fill="none" stroke="url(#pyrFillAff)" strokeWidth="1.2" />
          <polygon points="100,46 158,158 42,158" fill="none" stroke="url(#pyrFillAff)" strokeWidth="1" />
          <polygon points="100,76 132,140 68,140" fill="none" stroke="url(#pyrFillAff)" strokeWidth="0.8" />
          <line x1="100" y1="16" x2="100" y2="176" stroke="url(#pyrFillAff)" strokeWidth="0.6" opacity="0.5" />
        </svg>
      </div>

      {/* Green spotlight halo */}
      <div className="absolute pointer-events-none" style={{
        top: '35%', left: '50%', width: '90%', height: '60%',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(45,201,122,0.28) 0%, rgba(45,201,122,0.08) 35%, transparent 65%)',
        filter: 'blur(24px)', mixBlendMode: 'screen', zIndex: 2,
      }} />

      {/* Gold halo under coin area */}
      <div className="absolute pointer-events-none" style={{
        top: '62%', left: '50%', width: '70%', height: '45%',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(ellipse 55% 40% at 50% 50%, rgba(255,200,80,0.45) 0%, rgba(240,178,50,0.18) 35%, transparent 70%)',
        filter: 'blur(18px)', mixBlendMode: 'screen', zIndex: 3,
      }} />

      {/* Coin visual */}
      <div className="absolute pointer-events-none" style={{ top: '28%', left: '50%', width: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
        {/* Cylinder body */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1.5 / 1',
        }}>
          {/* Body */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '22%', bottom: '6%',
            borderRadius: '0 0 50% 50% / 0 0 36% 36%',
            background: 'linear-gradient(90deg, #5a3d0c 0%, #a8731a 14%, #f0b232 38%, #ffe08a 50%, #f0b232 62%, #a8731a 86%, #5a3d0c 100%)',
            boxShadow: 'inset 0 -14px 28px rgba(80,50,5,0.5), 0 12px 40px rgba(255,200,80,0.28)',
          }} />
          {/* Top face */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: '44%',
            borderRadius: '50% / 50%',
            background: 'radial-gradient(ellipse 30% 55% at 28% 32%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 65%), radial-gradient(ellipse 90% 100% at 50% 30%, #FFE9A8 0%, #FFD56B 22%, #F0B232 48%, #B8801E 78%, #6B4910 100%)',
            boxShadow: 'inset 0 0 0 2px rgba(120,75,10,0.6), inset 0 4px 8px rgba(255,240,180,0.5), 0 6px 28px rgba(255,200,80,0.4)',
            zIndex: 3,
          }} />
          {/* Y letter */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: '44%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'serif', fontWeight: 900, fontSize: '36%',
            color: '#6B4910', textShadow: '0 1px 0 rgba(255,240,180,0.8), 0 -1px 0 rgba(40,25,0,0.5)',
            zIndex: 4,
          }}>Y</div>
        </div>
      </div>

      {/* Content */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{ padding: 'clamp(20px,6%,40px)', zIndex: 9 }}
      >
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-2 mb-auto">
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2DC97A', display: 'inline-block', boxShadow: '0 0 8px #2DC97A' }} />
          <span style={{ fontFamily: 'monospace', fontSize: 'clamp(9px,1.3cqi,13px)', fontWeight: 600, letterSpacing: '0.3em', color: '#2DC97A', textTransform: 'uppercase' }}>YALA</span>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2DC97A', display: 'inline-block', boxShadow: '0 0 8px #2DC97A' }} />
        </div>

        {/* Headline */}
        <div className="text-center" style={{ marginTop: '52%' }}>
          <p style={{ fontFamily: 'serif', fontWeight: 900, fontSize: 'clamp(28px,8cqi,72px)', lineHeight: 0.9, letterSpacing: '-0.025em', color: '#F5E8C8', marginBottom: '0.15em' }}>GET FREE</p>
          <p style={{ fontFamily: 'serif', fontWeight: 900, fontSize: 'clamp(28px,8cqi,72px)', lineHeight: 0.9, letterSpacing: '-0.025em', background: 'linear-gradient(180deg,#FFE9A8 0%,#F0B232 55%,#C68A1C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>COINS</p>
          <p style={{ marginTop: 'clamp(8px,1.5cqi,14px)', fontSize: 'clamp(10px,1.6cqi,15px)', color: 'rgba(200,215,205,0.65)' }}>Sign up with your friend&apos;s code</p>
        </div>

        <div style={{ flex: 1 }} />

        {/* Code box */}
        <div style={{
          position: 'relative',
          marginTop: 'clamp(12px,2cqi,20px)',
          padding: 'clamp(12px,2cqi,18px) clamp(16px,3cqi,24px)',
          background: 'linear-gradient(180deg,#060d09 0%,#030604 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(240,178,50,0.5)',
          boxShadow: '0 0 24px rgba(240,178,50,0.18), inset 0 0 20px rgba(0,0,0,0.5)',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'monospace', fontSize: 'clamp(8px,1.1cqi,10px)', letterSpacing: '0.36em', color: 'rgba(170,180,175,0.7)', textTransform: 'uppercase', marginBottom: 'clamp(4px,0.8cqi,7px)' }}>USE CODE</p>
          <p style={{ fontFamily: 'serif', fontWeight: 900, fontSize: 'clamp(24px,5.5cqi,48px)', letterSpacing: '0.1em', background: 'linear-gradient(180deg,#FFE9A8 0%,#F0B232 55%,#C68A1C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>{code}</p>
        </div>
      </div>
    </div>
  );
}

// Custom code picker component
function CodePicker({ currentCode, onCodeSet }: { currentCode: string; onCodeSet: (code: string) => void }) {
  const [input, setInput] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const TAKEN = ['admin', 'yala', 'casino', 'test', 'support', 'official'];

  const checkAvailability = () => {
    if (!input || input.length < 3) return;
    setChecking(true);
    setAvailable(null);
    setTimeout(() => {
      setAvailable(!TAKEN.includes(input.toLowerCase()));
      setChecking(false);
    }, 700);
  };

  const claimCode = () => {
    if (available && input) {
      onCodeSet(input.toUpperCase());
      setInput('');
      setAvailable(null);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold mb-1" style={{ color: '#8FA3B8' }}>Choose your referral link name</p>
        <p className="text-[11px]" style={{ color: '#4A5878' }}>
          Pick a custom name for your referral link. Your friends will see this in the URL when they sign up.
        </p>
      </div>

      <div className="flex gap-2">
        {/* URL prefix + input */}
        <div
          className="flex-1 flex items-center rounded-xl overflow-hidden"
          style={{
            border: available === true
              ? '1px solid rgba(45,201,122,0.5)'
              : available === false
                ? '1px solid rgba(239,68,68,0.4)'
                : '1px solid #1A2238',
            background: '#0F1828',
          }}
        >
          <span className="px-3 text-xs font-mono font-semibold flex-shrink-0 whitespace-nowrap" style={{ color: '#4A5878' }}>
            yala.gg/r/
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toUpperCase().slice(0, 20));
              setAvailable(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && checkAvailability()}
            placeholder="YOURNAME"
            className="flex-1 bg-transparent py-3 pr-3 text-sm font-mono font-bold outline-none"
            style={{ color: '#F5E8C8' }}
          />
          {available === true && <CheckCircle2 className="w-4 h-4 flex-shrink-0 mr-3" style={{ color: '#2DC97A' }} />}
          {available === false && <span className="text-xs font-bold mr-3 flex-shrink-0" style={{ color: '#EF4444' }}>Taken</span>}
        </div>

        <button
          onClick={checkAvailability}
          disabled={checking || input.length < 3}
          className="px-4 py-3 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 flex-shrink-0"
          style={{ background: '#1A2238', color: '#8FA3B8', border: '1px solid #1A2238' }}
        >
          {checking ? '...' : 'Check'}
        </button>

        <AnimatePresence>
          {available === true && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={claimCode}
              className="px-4 py-3 rounded-xl text-xs font-black transition-all hover:brightness-110 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2DC97A, #10B981)', color: '#040814' }}
            >
              Claim It
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {available === true && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs" style={{ color: '#2DC97A' }}>
          ✓ &ldquo;{input}&rdquo; is available! Click &ldquo;Claim It&rdquo; to make it yours.
        </motion.p>
      )}
      {available === false && (
        <p className="text-xs" style={{ color: '#EF4444' }}>
          That name is already taken. Try a different one.
        </p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <span className="text-[10px]" style={{ color: '#4A5878' }}>Current code:</span>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(240,178,50,0.1)', color: '#F0B232' }}>
          {currentCode}
        </span>
      </div>
    </div>
  );
}

export default function AffiliatePage() {
  const { isLoggedIn, user, setCardVariant } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const cardVariant: CardVariant = user?.cardVariant ?? 8;
  const [referralCode, setReferralCode] = useState(user?.referralCode || 'JACKPOT');
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = () => {
    const w = window.open('', '_blank', 'width=540,height=720');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>YALA Invite Card</title>
    <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" rel="stylesheet">
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{background:#050805;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Archivo Black',serif}
      .card{position:relative;width:400px;aspect-ratio:4/5;background:radial-gradient(ellipse 80% 60% at 50% 55%,#0b2418 0%,#081610 45%,#040814 75%);border-radius:24px;overflow:hidden;box-shadow:0 0 0 1px rgba(240,178,50,.18),0 0 40px rgba(45,201,122,.06)}
      .frame{position:absolute;inset:10px;border-radius:18px;border:1px solid rgba(240,178,50,.32);pointer-events:none;z-index:10}
      .content{position:absolute;inset:0;display:flex;flex-direction:column;padding:36px;z-index:9}
      .eyebrow{text-align:center;font-family:monospace;font-size:11px;letter-spacing:.32em;color:#2DC97A;text-transform:uppercase;margin-bottom:auto}
      .headline{margin-top:52%;text-align:center}
      .h1{font-size:60px;line-height:.9;letter-spacing:-.025em;color:#F5E8C8}
      .h2{font-size:60px;line-height:.9;letter-spacing:-.025em;background:linear-gradient(180deg,#FFE9A8 0%,#F0B232 55%,#C68A1C 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
      .sub{margin-top:12px;font-size:13px;color:rgba(200,215,205,.65);font-family:sans-serif;font-weight:400}
      .spacer{flex:1}
      .codebox{margin-top:16px;padding:14px 22px;background:linear-gradient(180deg,#060d09 0%,#030604 100%);border-radius:12px;border:1px solid rgba(240,178,50,.5);box-shadow:0 0 24px rgba(240,178,50,.18);text-align:center}
      .codelabel{font-family:monospace;font-size:9px;letter-spacing:.36em;color:rgba(170,180,175,.7);text-transform:uppercase;margin-bottom:6px}
      .code{font-size:42px;letter-spacing:.1em;background:linear-gradient(180deg,#FFE9A8 0%,#F0B232 55%,#C68A1C 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1}
    </style>
    </head><body>
    <div class="card">
      <div class="frame"></div>
      <div class="content">
        <div class="eyebrow">• YALA •</div>
        <div class="headline">
          <div class="h1">GET FREE</div>
          <div class="h2">COINS</div>
          <div class="sub">Sign up with your friend's code</div>
        </div>
        <div class="spacer"></div>
        <div class="codebox">
          <div class="codelabel">USE CODE</div>
          <div class="code">${referralCode}</div>
        </div>
      </div>
    </div>
    <script>setTimeout(()=>window.print(),400)</script>
    </body></html>`);
    w.document.close();
  };

  const referralUrl = `https://yala.gg/r/${referralCode}`;
  const activeRefs = MOCK_REFERRALS.filter(r => r.status === 'active');
  const totalEarned = activeRefs.reduce((s, r) => s + r.earned, 0);
  const totalClicks = 847;
  const conversionRate = ((activeRefs.length / totalClicks) * 100).toFixed(1);

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const STATS = [
    { label: 'Link Clicks',       value: totalClicks.toLocaleString(),  sub: 'last 30 days',             icon: MousePointer, color: '#60A5FA' },
    { label: 'Signups',           value: MOCK_REFERRALS.length.toString(), sub: `${conversionRate}% conv.`, icon: Users,        color: '#2DC97A' },
    { label: 'First Purchases',   value: activeRefs.length.toString(),  sub: 'activated referrals',      icon: ShoppingCart, color: '#F0B232' },
    { label: 'GC Earned',         value: formatGC(totalEarned),         sub: 'total commissions',         icon: Zap,          color: '#A78BFA' },
  ];

  return (
    <div className="space-y-8 max-w-5xl">

      {/* ── PAGE TITLE (minimal) ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: '#F5E8C8' }}>Affiliate Program</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8FA3B8' }}>
            Share your code · earn coins every time a friend plays
          </p>
        </div>
        {!isLoggedIn && (
          <button
            onClick={() => openAuthModal('register')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #10B981, #2DC97A)', color: '#040814' }}
          >
            <Zap className="w-4 h-4" />
            Join Free
          </button>
        )}
      </div>

      {isLoggedIn ? (
        <>
          {/* ── HERO: Card (left) + Code Picker (right) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-start">

            {/* LEFT: Sharing Card */}
            <div className="space-y-3 lg:w-[340px] flex-shrink-0">
              <div ref={cardRef}>
                <YalaReferralCard
                  code={referralCode}
                  displayName={user?.displayName || user?.username}
                  variant={cardVariant}
                />
              </div>

              {/* Card style picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA3B8' }}>Card Style</p>
                  <span className="text-[10px] font-mono" style={{ color: '#4A5878' }}>
                    {cardVariant === 'rotate' ? 'cycles every 4s' : `#${String(cardVariant).padStart(2, '0')}`}
                  </span>
                </div>
                <select
                  value={String(cardVariant)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCardVariant(v === 'rotate' ? 'rotate' : (Number(v) as CardVariant));
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none transition-colors"
                  style={{
                    background: '#0F1828',
                    border: '1px solid #1A2238',
                    color: '#F5E8C8',
                  }}
                >
                  {CARD_OPTIONS.map((o) => (
                    <option key={String(o.id)} value={String(o.id)}>{o.label}</option>
                  ))}
                </select>
              </div>
              {/* Share buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => copyText(referralUrl, 'link')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95"
                  style={{
                    background: copiedField === 'link' ? 'rgba(45,201,122,0.15)' : 'linear-gradient(135deg, #10B981, #2DC97A)',
                    color: copiedField === 'link' ? '#2DC97A' : '#040814',
                    border: copiedField === 'link' ? '1px solid rgba(45,201,122,0.4)' : 'none',
                  }}
                >
                  {copiedField === 'link' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  {copiedField === 'link' ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => copyText(referralCode, 'code')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95"
                  style={{ background: 'rgba(240,178,50,0.1)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.25)' }}
                >
                  {copiedField === 'code' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'code' ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                  onClick={downloadCard}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#8FA3B8', border: '1px solid #1A2238' }}
                  title="Download / Print card"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* RIGHT: Code picker + how it works */}
            <div className="space-y-4">

              {/* Code picker — prominent */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: 'radial-gradient(ellipse at 80% 20%, rgba(240,178,50,0.06) 0%, transparent 55%), #0F1828',
                  border: '1px solid rgba(240,178,50,0.18)',
                }}
              >
                <p className="font-bold text-sm mb-1" style={{ color: '#F5E8C8' }}>Your Referral Link</p>
                <p className="text-xs mb-5" style={{ color: '#8FA3B8' }}>
                  Claim a custom name — your friends see it in the URL when they sign up.
                </p>
                <CodePicker currentCode={referralCode} onCodeSet={setReferralCode} />
              </div>

              {/* How it works */}
              <div
                className="rounded-2xl p-5"
                style={{ background: '#0A101C', border: '1px solid #1A2238' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#4A5878' }}>How it works</p>
                <div className="space-y-3">
                  {[
                    { step: '01', text: 'Share your link or code on social, Discord, or anywhere', color: '#2DC97A' },
                    { step: '02', text: 'Friend signs up using your link',                         color: '#F0B232' },
                    { step: '03', text: 'They get 250K GC free · you earn 5,000 GC instantly',   color: '#A78BFA' },
                    { step: '04', text: 'Keep earning as they wager — no cap',                    color: '#60A5FA' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center gap-3">
                      <span className="font-mono text-[11px] font-bold flex-shrink-0 w-6 text-right" style={{ color: s.color }}>{s.step}</span>
                      <div className="w-px h-3 flex-shrink-0" style={{ background: '#1A2238' }} />
                      <p className="text-xs" style={{ color: '#8FA3B8' }}>{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── STATS GRID (below hero) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl p-4"
                  style={{ background: '#0F1828', border: `1px solid ${stat.color}18` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}12` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                    </div>
                    <p className="text-[10px] font-medium" style={{ color: '#8FA3B8' }}>{stat.label}</p>
                  </div>
                  <p className="font-black text-2xl number-display" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: '#4A5878' }}>{stat.sub}</p>
                </motion.div>
              );
            })}
          </div>

          {/* ── COMMISSION TIERS ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4" style={{ color: '#F0B232' }} />
              <h2 className="font-bold text-sm" style={{ color: '#F5E8C8' }}>Commission Tiers</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {COMMISSION_TIERS.map((tier, i) => (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="rounded-xl p-4"
                  style={{
                    background: `linear-gradient(135deg, ${tier.color}08, transparent)`,
                    border: `1px solid ${tier.color}20`,
                  }}
                >
                  <p className="font-black text-sm mb-1" style={{ color: tier.color }}>{tier.tier}</p>
                  <p className="text-[10px] mb-2" style={{ color: '#8FA3B8' }}>{tier.refs} referrals</p>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: '#F5E8C8' }}>{tier.rate}</p>
                  {tier.bonus && (
                    <p className="text-[9px] font-bold px-1.5 py-0.5 rounded inline-block" style={{ background: `${tier.color}15`, color: tier.color }}>
                      +{tier.bonus}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── REFERRAL HISTORY TABLE ── */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1A2238' }}>
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ background: '#0F1828', borderBottom: '1px solid #1A2238' }}
            >
              <h2 className="font-bold text-sm" style={{ color: '#F5E8C8' }}>
                Your Referrals
                <span className="ml-2 text-[10px] font-normal px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,201,122,0.1)', color: '#2DC97A' }}>
                  {activeRefs.length} active
                </span>
              </h2>
              <TrendingUp className="w-4 h-4" style={{ color: '#2DC97A' }} />
            </div>

            {MOCK_REFERRALS.map((ref, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-4 px-5 py-3.5 border-b transition-colors hover:bg-white/[0.02]"
                style={{ borderColor: '#1A2238' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-black flex-shrink-0"
                  style={{ background: ref.status === 'active' ? 'linear-gradient(135deg, #2DC97A, #10B981)' : '#1A2238' }}
                >
                  {ref.username[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#F5E8C8' }}>{ref.username}</p>
                  <p className="text-[10px]" style={{ color: '#4A5878' }}>Joined {ref.joinDate}</p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-[10px]" style={{ color: '#4A5878' }}>Wagered</p>
                  <p className="text-xs font-bold number-display" style={{ color: '#8FA3B8' }}>
                    {ref.wagered > 0 ? formatGC(ref.wagered) : '—'}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                    ref.status === 'active' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'
                  }`}
                >
                  {ref.status === 'active' ? 'Active' : 'Pending'}
                </span>
                <div className="text-right flex-shrink-0 min-w-[80px]">
                  <p className="text-sm font-black number-display" style={{ color: ref.earned > 0 ? '#F0B232' : '#4A5878' }}>
                    {ref.earned > 0 ? `+${formatGC(ref.earned)} GC` : 'Pending'}
                  </p>
                </div>
              </motion.div>
            ))}

            <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#0F1828' }}>
              <p className="text-xs" style={{ color: '#4A5878' }}>Showing {MOCK_REFERRALS.length} of {MOCK_REFERRALS.length} referrals</p>
              <button
                type="button"
                onClick={() => toast('Full report exports as CSV', { description: 'Real download lands with the backend; this is a 5-row preview.' })}
                className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity"
                style={{ color: '#F0B232' }}
              >
                Full Report <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Creator Program */}
          <div
            className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
            style={{ background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.18)' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
              <ExternalLink className="w-5 h-5" style={{ color: '#A78BFA' }} />
            </div>
            <div className="flex-1">
              <p className="font-bold mb-1" style={{ color: '#F5E8C8' }}>Creator Program</p>
              <p className="text-sm" style={{ color: '#8FA3B8' }}>
                Streamers and content creators get higher commission rates, custom branding, and dedicated account managers. Apply to unlock creator-tier benefits.
              </p>
            </div>
            <button
              className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110"
              style={{ background: 'rgba(167,139,250,0.15)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.3)' }}
            >
              Apply Now
            </button>
          </div>
        </>
      ) : (
        /* Logged out state */
        <div className="rounded-2xl p-10 text-center" style={{ background: '#0F1828', border: '1px solid #1A2238' }}>
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: '#F0B232' }} />
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Join to access your affiliate dashboard</h2>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: '#8FA3B8' }}>
            Sign up free and start earning 5,000 GC for every friend who joins and plays.
          </p>
          <button
            onClick={() => openAuthModal('register')}
            className="px-7 py-3 rounded-xl font-black text-sm transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #10B981, #2DC97A)', color: '#040814' }}
          >
            Sign Up Free
          </button>
        </div>
      )}

      <div className="text-center pt-2">
        <p className="text-[10px]" style={{ color: '#4A5878' }}>
          18+ · Free to play · No real money · Max 50 referrals per account · Void where prohibited
        </p>
      </div>
    </div>
  );
}
