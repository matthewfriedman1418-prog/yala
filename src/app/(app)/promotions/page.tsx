'use client';

/**
 * /promotions — the canonical "all current offers" page.
 *
 * Structure mirrors common patterns across Stake / Roobet / Rainbet / Chumba:
 *   1. Hero featuring the most valuable offer right now
 *   2. Promo code redemption strip (always-visible above the fold)
 *   3. Filter pills by promo type
 *   4. Personalized "For you" row (gated on VIP tier)
 *   5. The full grid, filtered by the active pill
 *   6. Email opt-in mock (where competitors collect interest in future drops)
 */

import { useMemo, useState } from 'react';
import { Gift, Sparkles, Mail, Check, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useWalletStore } from '@/lib/store/wallet';
import { PROMOTIONS, type Promotion } from '@/lib/mock-data/promotions';
import { PromoCard, PROMO_TYPE_META } from '@/components/rewards/PromoCard';
import { formatGC } from '@/lib/utils';

type FilterId = 'all' | Promotion['type'];

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all',         label: 'All' },
  { id: 'welcome',     label: 'Welcome' },
  { id: 'daily',       label: 'Daily' },
  { id: 'reload',      label: 'Reload' },
  { id: 'cashback',    label: 'Cashback' },
  { id: 'race',        label: 'Races' },
  { id: 'tournament',  label: 'Tournaments' },
  { id: 'vip',         label: 'VIP' },
  { id: 'referral',    label: 'Referrals' },
];

export default function PromotionsPage() {
  const { isLoggedIn, user }              = useAuthStore();
  const { openAuthModal, openBuyCoins }   = useUIStore();
  const { addGC, addSC }                  = useWalletStore();

  const [filter, setFilter]         = useState<FilterId>('all');
  const [emailDraft, setEmailDraft] = useState('');
  const [emailSent, setEmailSent]   = useState(false);

  const vipTier = user?.vipTier ?? 0;

  // Personalized row — promos most relevant to the current user
  const featured = useMemo(() => PROMOTIONS[0], []); // Welcome Pack
  const personalized = useMemo(() => {
    if (!isLoggedIn) return [];
    const out: Promotion[] = [];
    // Daily login is always relevant
    const daily = PROMOTIONS.find((p) => p.type === 'daily'); if (daily) out.push(daily);
    // Cashback always relevant
    const cashback = PROMOTIONS.find((p) => p.type === 'cashback'); if (cashback) out.push(cashback);
    // VIP boost only if you qualify
    if (vipTier >= 4) {
      const vip = PROMOTIONS.find((p) => p.type === 'vip'); if (vip) out.push(vip);
    }
    return out;
  }, [isLoggedIn, vipTier]);

  const filtered = useMemo(
    () => (filter === 'all' ? PROMOTIONS : PROMOTIONS.filter((p) => p.type === filter)),
    [filter],
  );

  const handleClaim = (promo: Promotion) => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (promo.type === 'welcome' || promo.type === 'reload') {
      openBuyCoins();
      return;
    }
    if (promo.type === 'daily' || promo.type === 'cashback' || promo.type === 'vip') {
      if (promo.gcBonus) addGC(promo.gcBonus);
      if (promo.scBonus) addSC(promo.scBonus);
      toast.success(`Claimed: ${promo.title}`, {
        description: `${promo.gcBonus ? `+${formatGC(promo.gcBonus)} GC ` : ''}${promo.scBonus ? `+${promo.scBonus} SC` : ''}`.trim() || 'Credited.',
      });
      return;
    }
    if (promo.type === 'race' || promo.type === 'tournament') {
      window.location.href = '/leaderboards';
      return;
    }
    if (promo.type === 'referral') {
      window.location.href = '/affiliate';
      return;
    }
  };

  const handleEmailOptIn = () => {
    if (!emailDraft.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailDraft)) {
      toast.error('Enter a valid email');
      return;
    }
    setEmailSent(true);
    toast.success("You're on the list", { description: "We'll email you when new promotions drop." });
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* ── HERO ────────────────────────────────────────────── */}
      <section
        className="relative rounded-3xl overflow-hidden p-6 sm:p-8"
        style={{
          background: `
            radial-gradient(ellipse at 20% 0%, rgba(45,201,122,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 100%, rgba(240,178,50,0.15) 0%, transparent 50%),
            #0C1812
          `,
          border: '1px solid rgba(240,178,50,0.25)',
        }}
      >
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4" style={{ color: '#F0B232' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#F0B232' }}>Promotions</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight mb-2" style={{ color: '#F5E8C8' }}>
            Every offer · in one place
          </h1>
          <p className="text-sm sm:text-base mb-5" style={{ color: '#8FA899' }}>
            Daily drops, weekly cashback, reload bonuses, VIP-only perks, races, tournaments. Browse, claim, and redeem promo codes — everything currently active is listed below.
          </p>

          {/* Featured promo inline */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(45,201,122,0.10)', border: '1px solid rgba(45,201,122,0.30)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(45,201,122,0.20)', border: '1px solid rgba(45,201,122,0.40)' }}
              >
                <Sparkles className="w-5 h-5" style={{ color: '#2DC97A' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#2DC97A' }}>Most popular</p>
                <p className="text-sm font-bold leading-snug" style={{ color: '#F5E8C8' }}>{featured.title}</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#8FA899' }}>{featured.subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => isLoggedIn ? openBuyCoins() : openAuthModal('register')}
              className="px-5 py-3 rounded-xl text-sm font-black transition-all hover:brightness-110 active:scale-[0.98] flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #2DC97A, #F0B232)',
                color: '#060E0A',
                boxShadow: '0 4px 16px rgba(45,201,122,0.35)',
              }}
            >
              {isLoggedIn ? 'Buy Coins' : 'Sign Up & Claim'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── PERSONALIZED ROW ────────────────────────────── */}
      {personalized.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, #A78BFA, #F472B6)' }} />
            <h2 className="font-display text-lg font-bold" style={{ color: '#F5E8C8' }}>For you</h2>
            <span className="text-[10px] font-bold" style={{ color: '#8FA899' }}>
              · based on your VIP tier
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {personalized.map((p, i) => (
              <PromoCard key={`pf_${p.id}`} promo={p} index={i} ready onClaim={handleClaim} />
            ))}
          </div>
        </section>
      )}

      {/* ── FILTER PILLS ────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            const count = f.id === 'all'
              ? PROMOTIONS.length
              : PROMOTIONS.filter((p) => p.type === f.id).length;
            const accent = f.id === 'all' ? '#F0B232' : (PROMO_TYPE_META[f.id as Promotion['type']]?.accent ?? '#F0B232');
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={
                  active
                    ? { background: `${accent}1A`, color: accent, border: `1px solid ${accent}55` }
                    : { color: '#8FA899', border: '1px solid #1A2E22', background: 'rgba(255,255,255,0.02)' }
                }
              >
                {f.label}
                {count > 0 && (
                  <span
                    className="text-[9px] font-mono font-black px-1 rounded"
                    style={{
                      background: active ? `${accent}26` : 'rgba(255,255,255,0.04)',
                      color:      active ? accent : '#4A6A55',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── PROMO GRID ──────────────────────────────────── */}
      <section>
        {filtered.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: '#0F1A14', border: '1px solid #1A2E22' }}
          >
            <p className="text-sm font-bold mb-1" style={{ color: '#F5E8C8' }}>No {FILTERS.find((f) => f.id === filter)?.label.toLowerCase()} promotions right now</p>
            <p className="text-[12px]" style={{ color: '#8FA899' }}>Check back soon — we drop new offers weekly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((p, i) => (
              <PromoCard key={p.id} promo={p} index={i} onClaim={handleClaim} />
            ))}
          </div>
        )}
      </section>

      {/* ── EMAIL OPT-IN ────────────────────────────────── */}
      <section
        className="rounded-2xl p-5"
        style={{ background: '#0A1410', border: '1px solid #1A2E22' }}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Mail className="w-5 h-5 flex-shrink-0" style={{ color: '#F0B232' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Get new promotions first</p>
              <p className="text-[11px]" style={{ color: '#8FA899' }}>
                We&apos;ll email you when limited-time drops go live. Unsubscribe anytime.
              </p>
            </div>
          </div>
          {emailSent ? (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(45,201,122,0.10)', border: '1px solid rgba(45,201,122,0.30)' }}
            >
              <Check className="w-4 h-4" style={{ color: '#2DC97A' }} />
              <span className="text-sm font-bold" style={{ color: '#2DC97A' }}>Subscribed</span>
            </div>
          ) : (
            <div className="flex items-stretch gap-2 sm:w-[360px]">
              <input
                type="email"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEmailOptIn(); }}
                placeholder="you@example.com"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid #1A2E22',
                  color: '#F5E8C8',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(240,178,50,0.45)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#1A2E22')}
              />
              <button
                onClick={handleEmailOptIn}
                className="px-4 py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
              >
                Subscribe
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Legal ────────────────────────────────────────── */}
      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-[11px]" style={{ color: 'rgba(143,168,153,0.5)' }}>
          18+ · No Purchase Necessary · Void Where Prohibited · Play Responsibly · All promotions subject to full terms. Gold Coins have no cash value.
        </p>
      </div>
    </div>
  );
}
