'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC } from '@/lib/utils';
import {
  Copy, CheckCircle2, Users, TrendingUp, Link as LinkIcon,
  Layers, MousePointer, ShoppingCart, Zap, Share2, Download,
  ChevronRight, Star, ExternalLink
} from 'lucide-react';

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
  { tier: 'Starter',   refs: '1–4',   rate: '5,000 GC / referral', bonus: null,          color: '#8FA899' },
  { tier: 'Silver',    refs: '5–19',  rate: '5,000 GC + 1% wager', bonus: '10K GC bonus', color: '#C0C0C0' },
  { tier: 'Gold',      refs: '20–49', rate: '5,000 GC + 2% wager', bonus: '50K GC bonus', color: '#F0B232' },
  { tier: 'Platinum',  refs: '50+',   rate: '5,000 GC + 3% wager', bonus: 'Custom deal',  color: '#A78BFA' },
];

// Inline sharing card component
function SharingCard({
  code,
  url,
  earned,
  refs,
}: {
  code: string;
  url: string;
  earned: number;
  refs: number;
}) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden select-none"
      style={{
        background: 'linear-gradient(135deg, #060E0A 0%, #0C1812 50%, #071510 100%)',
        border: '1px solid rgba(240,178,50,0.3)',
        boxShadow: '0 16px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(240,178,50,0.08)',
        aspectRatio: '1.85 / 1',
        maxWidth: '480px',
        padding: '28px 32px',
      }}
    >
      {/* BG glow blobs */}
      <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #2DC97A, transparent)', filter: 'blur(30px)' }} />
      <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F0B232, transparent)', filter: 'blur(40px)' }} />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(255,255,255,1) 19px,rgba(255,255,255,1) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(255,255,255,1) 19px,rgba(255,255,255,1) 20px)' }} />

      {/* Watermark pyramid */}
      <div className="absolute right-4 top-4 opacity-[0.07] pointer-events-none">
        <CardPyramid size={80} />
      </div>

      {/* YALA header row */}
      <div className="relative z-10 flex items-center gap-2 mb-5">
        <CardPyramid size={20} />
        <span
          className="font-display font-black text-lg tracking-widest"
          style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          YALA
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#4A6A55' }}>Casino</span>
        <div className="flex-1" />
        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(45,201,122,0.1)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.2)' }}>
          INVITE
        </span>
      </div>

      {/* Headline */}
      <p className="relative z-10 text-xs mb-4" style={{ color: '#8FA899' }}>
        You&apos;ve been personally invited to join
      </p>

      {/* Big code box */}
      <div
        className="relative z-10 flex items-center justify-between px-5 py-3 rounded-xl mb-4"
        style={{
          background: 'linear-gradient(135deg, rgba(240,178,50,0.1), rgba(240,178,50,0.05))',
          border: '1px solid rgba(240,178,50,0.35)',
        }}
      >
        <div>
          <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: '#8FA899' }}>Your Invite Code</p>
          <p className="font-mono font-black text-2xl tracking-widest" style={{ color: '#F0B232', letterSpacing: '0.15em' }}>{code}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: '#8FA899' }}>Free Coins</p>
          <p className="font-black text-base" style={{ color: '#2DC97A' }}>250K GC</p>
        </div>
      </div>

      {/* URL */}
      <p className="relative z-10 text-[10px] font-mono mb-4" style={{ color: '#4A6A55' }}>{url}</p>

      {/* Stats row */}
      <div className="relative z-10 flex items-center gap-4">
        <div>
          <p className="font-black text-sm number-display" style={{ color: '#2DC97A' }}>{refs}</p>
          <p className="text-[9px] uppercase tracking-wide" style={{ color: '#4A6A55' }}>Players</p>
        </div>
        <div className="w-px h-6" style={{ background: '#1A2E22' }} />
        <div>
          <p className="font-black text-sm number-display" style={{ color: '#F0B232' }}>{formatGC(earned)}</p>
          <p className="text-[9px] uppercase tracking-wide" style={{ color: '#4A6A55' }}>GC Earned</p>
        </div>
        <div className="w-px h-6" style={{ background: '#1A2E22' }} />
        <div>
          <p className="font-black text-sm" style={{ color: '#A78BFA' }}>FREE</p>
          <p className="text-[9px] uppercase tracking-wide" style={{ color: '#4A6A55' }}>To Join</p>
        </div>
        <div className="flex-1 text-right">
          <p className="text-[8px]" style={{ color: '#2A3E30' }}>No purchase necessary</p>
          <p className="text-[8px]" style={{ color: '#2A3E30' }}>18+ · Void where prohibited</p>
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
        <p className="text-xs font-semibold mb-1" style={{ color: '#8FA899' }}>Choose your referral link name</p>
        <p className="text-[11px]" style={{ color: '#4A6A55' }}>
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
                : '1px solid #1A2E22',
            background: '#0F1A14',
          }}
        >
          <span className="px-3 text-xs font-mono font-semibold flex-shrink-0 whitespace-nowrap" style={{ color: '#4A6A55' }}>
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
          style={{ background: '#1A2E22', color: '#8FA899', border: '1px solid #1A2E22' }}
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
              style={{ background: 'linear-gradient(135deg, #2DC97A, #10B981)', color: '#060E0A' }}
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
        <span className="text-[10px]" style={{ color: '#4A6A55' }}>Current code:</span>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(240,178,50,0.1)', color: '#F0B232' }}>
          {currentCode}
        </span>
      </div>
    </div>
  );
}

export default function AffiliatePage() {
  const { isLoggedIn, user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState(user?.referralCode || 'YALA88');
  const cardRef = useRef<HTMLDivElement>(null);

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
    <div className="space-y-8 max-w-4xl">

      {/* ── HERO ── */}
      <div
        className="relative rounded-2xl overflow-hidden p-7"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(45,201,122,0.1) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(240,178,50,0.08) 0%, transparent 55%), #080F0A',
          border: '1px solid #1A2E22',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4" style={{ color: '#2DC97A' }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#2DC97A' }}>Affiliate Program</span>
        </div>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Grow with Yala</h1>
        <p className="text-sm max-w-lg" style={{ color: '#8FA899' }}>
          Share your link. Earn Gold Coins every time a friend signs up and plays. The more friends you bring, the more you earn.
        </p>

        {!isLoggedIn && (
          <button
            onClick={() => openAuthModal('register')}
            className="mt-5 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #10B981, #2DC97A)', color: '#060E0A' }}
          >
            <Zap className="w-4 h-4" />
            Join & Start Earning
          </button>
        )}
      </div>

      {isLoggedIn ? (
        <>
          {/* ── STATS GRID ── */}
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
                  style={{ background: '#0F1A14', border: `1px solid ${stat.color}18` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}12` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                    </div>
                    <p className="text-[10px] font-medium" style={{ color: '#6B8F7B' }}>{stat.label}</p>
                  </div>
                  <p className="font-black text-xl number-display" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: '#4A6A55' }}>{stat.sub}</p>
                </motion.div>
              );
            })}
          </div>

          {/* ── MAIN CONTENT: Sharing + Code Picker ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* LEFT: Sharing Graphic */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4" style={{ color: '#F0B232' }} />
                <h2 className="font-bold text-sm" style={{ color: '#F5E8C8' }}>Your Invite Card</h2>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase" style={{ background: 'rgba(240,178,50,0.12)', color: '#F0B232' }}>
                  Share This
                </span>
              </div>

              {/* The card */}
              <div ref={cardRef}>
                <SharingCard
                  code={referralCode}
                  url={referralUrl}
                  earned={totalEarned}
                  refs={activeRefs.length}
                />
              </div>

              {/* Share action buttons */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => copyText(referralUrl, 'link')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95"
                  style={{
                    background: copiedField === 'link' ? 'rgba(45,201,122,0.2)' : 'linear-gradient(135deg, #10B981, #2DC97A)',
                    color: copiedField === 'link' ? '#2DC97A' : '#060E0A',
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
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#8FA899', border: '1px solid #1A2E22' }}
                  title="Screenshot this card to share on social"
                >
                  <Download className="w-3.5 h-3.5" />
                  Screenshot
                </button>
              </div>

              <p className="text-[10px]" style={{ color: '#4A6A55' }}>
                Tip: screenshot the invite card above and post it on social media or Discord with your code.
              </p>
            </div>

            {/* RIGHT: Code picker + How it works */}
            <div className="space-y-5">

              {/* Custom code picker */}
              <div
                className="rounded-2xl p-5"
                style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
              >
                <CodePicker currentCode={referralCode} onCodeSet={setReferralCode} />
              </div>

              {/* How it works */}
              <div
                className="rounded-2xl p-5 space-y-3"
                style={{ background: 'rgba(240,178,50,0.04)', border: '1px solid rgba(240,178,50,0.15)' }}
              >
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F0B232' }}>How it works</p>
                {[
                  { n: 1, text: 'Share your code or link anywhere',               color: '#2DC97A' },
                  { n: 2, text: 'Friend signs up using your code',                color: '#F0B232' },
                  { n: 3, text: 'They get 250K GC free — you get 5,000 GC',      color: '#A78BFA' },
                  { n: 4, text: 'Earn more as they keep playing',                 color: '#60A5FA' },
                ].map((step) => (
                  <div key={step.n} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-black flex-shrink-0 mt-0.5"
                      style={{ background: step.color }}
                    >
                      {step.n}
                    </div>
                    <p className="text-xs" style={{ color: '#8FA899' }}>{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
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
                  <p className="text-[10px] mb-2" style={{ color: '#6B8F7B' }}>{tier.refs} referrals</p>
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
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1A2E22' }}>
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ background: '#0F1A14', borderBottom: '1px solid #1A2E22' }}
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
                style={{ borderColor: '#1A2E22' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-black flex-shrink-0"
                  style={{ background: ref.status === 'active' ? 'linear-gradient(135deg, #2DC97A, #10B981)' : '#1A2E22' }}
                >
                  {ref.username[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#F5E8C8' }}>{ref.username}</p>
                  <p className="text-[10px]" style={{ color: '#4A6A55' }}>Joined {ref.joinDate}</p>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-[10px]" style={{ color: '#4A6A55' }}>Wagered</p>
                  <p className="text-xs font-bold number-display" style={{ color: '#8FA899' }}>
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
                  <p className="text-sm font-black number-display" style={{ color: ref.earned > 0 ? '#F0B232' : '#4A6A55' }}>
                    {ref.earned > 0 ? `+${formatGC(ref.earned)} GC` : 'Pending'}
                  </p>
                </div>
              </motion.div>
            ))}

            <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#0F1A14' }}>
              <p className="text-xs" style={{ color: '#4A6A55' }}>Showing {MOCK_REFERRALS.length} of {MOCK_REFERRALS.length} referrals</p>
              <button className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity" style={{ color: '#F0B232' }}>
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
              <p className="text-sm" style={{ color: '#8FA899' }}>
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
        <div className="rounded-2xl p-10 text-center" style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}>
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: '#F0B232' }} />
          <h2 className="font-display text-xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Join to access your affiliate dashboard</h2>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: '#8FA899' }}>
            Sign up free and start earning 5,000 GC for every friend who joins and plays.
          </p>
          <button
            onClick={() => openAuthModal('register')}
            className="px-7 py-3 rounded-xl font-black text-sm transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #10B981, #2DC97A)', color: '#060E0A' }}
          >
            Sign Up Free
          </button>
        </div>
      )}

      <div className="text-center pt-2">
        <p className="text-[10px]" style={{ color: '#4A6A55' }}>
          18+ · Free to play · No real money · Max 50 referrals per account · Void where prohibited
        </p>
      </div>
    </div>
  );
}
