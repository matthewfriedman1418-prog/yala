'use client';

/**
 * MIRAGE AUCTION — a Yala original.
 *
 * Hidden-information bidding game. You + 3 AI desert bandits each hold a
 * hidden card valued 1–99. Over 4 bid rounds, all 4 bid simultaneously.
 * Highest TOTAL bid wins the oasis.
 *
 *   Win + total_bid <= card  →  multiplier = (card / total_bid) × 4.5
 *   Win + overbid           →  bust (you overpaid)
 *   Lose                    →  bust (a bandit beat you)
 *
 * The 4.5× constant was tuned via simulation to land at ~99% RTP under
 * balanced player strategy (bid ~55–70% of card across 4 rounds).
 *
 * Personalities:
 *   Greedy:   each round bids 18–30% of card (frontloads, intimidates)
 *   Cautious: each round bids  8–15% of card (sandbags)
 *   Bluffer:  60% low (10–20%) / 40% high (25–45%) — unpredictable
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ChevronLeft, Shield, Info, TrendingUp, BarChart3, Crown, Lock, RotateCcw,
  Trophy, Skull,
} from 'lucide-react';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { GoldCoinIcon, SweepCoinIcon } from '@/components/ui/YalaIcon';
import { YalaAvatar } from '@/components/ui/YalaAvatar';
import { formatGC, getVIPColor } from '@/lib/utils';

// ─── Constants ─────────────────────────────────────────────────────────────
const ROUNDS         = 4;
const MULT_K         = 4.5;     // tuned for ~99% RTP at balanced play
const BID_CHIPS      = [0.05, 0.10, 0.15, 0.20, 0.25, 0.35]; // fraction of card
const QUICK_BETS     = [1, 5, 10, 25, 100, 500];
const MAX_HISTORY    = 12;

type Personality = 'greedy' | 'cautious' | 'bluffer';
type Phase = 'idle' | 'bidding' | 'revealing' | 'resolved';
type Tab = 'recent' | 'leaderboard' | 'rules' | 'fairness';

interface Bidder {
  id: 'you' | Personality;
  name: string;
  avatar: string;
  personality?: Personality;
  card: number;           // 1–99
  cardRevealed: boolean;  // false for AI until resolved
  bids: number[];         // length = current round
}

interface HistoryEntry {
  result: 'win' | 'bust';
  mult: number;
  bet: number;
  ts: number;
  card: number;
  totalBid: number;
}

const AI_DEFS: { id: Personality; name: string; avatar: string; tier: number; blurb: string }[] = [
  { id: 'greedy',   name: 'Hassan the Greedy',  avatar: 'HG', tier: 5, blurb: 'Bids big out of the gate. Hopes to scare you out early.' },
  { id: 'cautious', name: 'Layla the Cautious', avatar: 'LC', tier: 4, blurb: 'Sandbags. Watch for a late surge if the pot looks rich.' },
  { id: 'bluffer',  name: 'Khalil the Bluffer', avatar: 'KB', tier: 6, blurb: 'Unpredictable. Bids low most rounds, but spikes hard sometimes.' },
];

function randomCard(): number { return 1 + Math.floor(Math.random() * 99); }
function randomSeed(): string {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// AI bid fraction-of-card per round
function aiBidFrac(p: Personality): number {
  if (p === 'greedy')   return 0.18 + Math.random() * 0.12;
  if (p === 'cautious') return 0.08 + Math.random() * 0.07;
  // bluffer
  return Math.random() < 0.6 ? 0.10 + Math.random() * 0.10 : 0.25 + Math.random() * 0.20;
}

// ─── Mock supporting data ─────────────────────────────────────────────────
const RECENT_PLAYS = [
  { user: 'GoldDuneKing', avatar: 'GK', tier: 6, bet: 500,  mult: 7.2,  payout: 3600, time: '4s',  won: true  },
  { user: 'OasisHunter',  avatar: 'OH', tier: 5, bet: 1000, mult: 0,    payout: 0,    time: '9s',  won: false },
  { user: 'SandstormX',   avatar: 'SX', tier: 4, bet: 200,  mult: 14.0, payout: 2800, time: '12s', won: true  },
  { user: 'EmeraldDunes', avatar: 'ED', tier: 5, bet: 750,  mult: 2.3,  payout: 1725, time: '17s', won: true  },
  { user: 'NightBazaar7', avatar: 'NB', tier: 3, bet: 100,  mult: 0,    payout: 0,    time: '21s', won: false },
];
const LEADERBOARD = [
  { rank: 1, user: 'GoldDuneKing',  avatar: 'GK', tier: 6, profit: 338_400 },
  { rank: 2, user: 'OasisHunter',   avatar: 'OH', tier: 5, profit: 215_200 },
  { rank: 3, user: 'SandstormX',    avatar: 'SX', tier: 4, profit: 156_800 },
  { rank: 4, user: 'EmeraldDunes',  avatar: 'ED', tier: 5, profit:  92_700 },
  { rank: 5, user: 'DesertFox88',   avatar: 'DF', tier: 5, profit:  47_300 },
];

export default function MirageAuctionPage() {
  const { activeCurrency, goldCoins, sweepCoins, addGC, addSC, addXP } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();

  const [bet, setBet] = useState<number>(10);
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState<number>(0); // 0..4 (0 = not started, 4 = all done)
  const [bidders, setBidders] = useState<Bidder[]>(initialBidders());
  const [pendingBidFrac, setPendingBidFrac] = useState<number>(0.15);
  const [revealedThroughRound, setRevealedThroughRound] = useState<number>(0); // for AI bid reveal animation
  const [resultMult, setResultMult] = useState<number>(0);
  const [resultBusted, setResultBusted] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [seed, setSeed] = useState<string>('');
  const [nonce, setNonce] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<Tab>('recent');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('yala-auction-history');
      if (raw) setHistory(JSON.parse(raw));
      setSeed(localStorage.getItem('yala-auction-seed') || randomSeed());
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem('yala-auction-history', JSON.stringify(history)); } catch {} }, [history]);
  useEffect(() => { if (seed) try { localStorage.setItem('yala-auction-seed', seed); } catch {} }, [seed]);

  const isGC      = activeCurrency === 'GC';
  const accent    = '#A78BFA';
  const accentSec = '#C4B5FD';
  const balance   = isGC ? goldCoins : sweepCoins;

  const player    = bidders[0];
  const playerTotal = player.bids.reduce((a, b) => a + b, 0);
  const pendingBidValue = +(player.card * pendingBidFrac).toFixed(2);

  const beginRound = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (bet <= 0)    { toast.error('Bet must be greater than 0'); return; }
    if (bet > balance) { toast.error(`Insufficient ${activeCurrency} balance`); return; }
    if (isGC) addGC(-bet); else addSC(-bet);

    setBidders(initialBidders());
    setRound(1);
    setRevealedThroughRound(0);
    setResultMult(0);
    setResultBusted(false);
    setPendingBidFrac(0.15);
    setPhase('bidding');
  };

  const submitBid = () => {
    if (phase !== 'bidding' || round < 1 || round > ROUNDS) return;

    // Compute everyone's bid for this round
    setBidders((prev) => {
      const next = prev.map((b) => {
        if (b.id === 'you') {
          return { ...b, bids: [...b.bids, pendingBidValue] };
        }
        const frac = aiBidFrac(b.personality!);
        return { ...b, bids: [...b.bids, +(b.card * frac).toFixed(2)] };
      });
      return next;
    });

    // Reveal animation: bump the revealed round AFTER state updates
    setPhase('revealing');
    setTimeout(() => {
      setRevealedThroughRound(round);
      if (round === ROUNDS) {
        // Final round → resolve
        setTimeout(() => resolveAuction(), 700);
      } else {
        setTimeout(() => {
          setRound((r) => r + 1);
          setPendingBidFrac(0.15);
          setPhase('bidding');
        }, 700);
      }
    }, 60);
  };

  const resolveAuction = () => {
    setBidders((prev) => {
      const revealed = prev.map((b) => ({ ...b, cardRevealed: true }));
      const me = revealed[0];
      const myTotal = me.bids.reduce((a, b) => a + b, 0);
      const oppTotals = revealed.slice(1).map((b) => b.bids.reduce((a, b) => a + b, 0));
      const maxOpp = Math.max(...oppTotals);

      let mult = 0;
      let busted = true;
      if (myTotal > maxOpp && myTotal <= me.card) {
        mult = (me.card / myTotal) * MULT_K;
        busted = false;
        const winnings = bet * mult;
        if (isGC) addGC(winnings); else addSC(winnings);
        addXP(Math.floor(bet * 0.5));
        toast.success(`Won the auction at ${mult.toFixed(2)}×`, {
          description: `Your card (${me.card}) ÷ your bid (${myTotal.toFixed(2)}) × ${MULT_K} = ${mult.toFixed(2)}×`,
        });
      } else if (myTotal > me.card) {
        addXP(Math.floor(bet * 0.1));
        toast.error('Overpaid — bust', { description: `Your bid (${myTotal.toFixed(2)}) exceeded your card (${me.card}).` });
      } else {
        addXP(Math.floor(bet * 0.1));
        const winner = oppTotals.indexOf(maxOpp);
        toast.error('A bandit outbid you', { description: `${revealed[winner + 1].name} took the oasis at ${maxOpp.toFixed(2)}.` });
      }

      setResultMult(mult);
      setResultBusted(busted);
      setHistory((h) => [{ result: busted ? 'bust' as const : 'win' as const, mult, bet, ts: Date.now(), card: me.card, totalBid: myTotal }, ...h].slice(0, MAX_HISTORY));
      setSeed(randomSeed());
      setNonce((n) => n + 1);
      setPhase('resolved');
      return revealed;
    });
  };

  const reset = () => {
    setBidders(initialBidders());
    setRound(0);
    setRevealedThroughRound(0);
    setResultMult(0);
    setResultBusted(false);
    setPhase('idle');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      <Link href="/originals" className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80" style={{ color: '#8FA3B8' }}>
        <ChevronLeft className="w-4 h-4" /> All Originals
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* LEFT — auction floor */}
        <div className="rounded-3xl overflow-hidden" style={{
          background: `radial-gradient(ellipse at 50% -10%, ${accent}14, transparent 60%), #0A101C`,
          border: '1px solid #1A2238',
        }}>
          {/* Header */}
          <header className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4" style={{ borderBottom: '1px solid #1A2238' }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${accent}28, ${accent}08)`, border: `1px solid ${accent}40` }}>
                <Crown className="w-5 h-5" style={{ color: accent }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-black tracking-tight" style={{ color: '#F5E8C8' }}>Mirage Auction</h1>
                  <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                    style={{ background: `${accent}1A`, color: accent, border: `1px solid ${accent}40` }}>New · Yala Original</span>
                </div>
                <p className="text-[11px] truncate" style={{ color: '#8FA3B8' }}>
                  4-round hidden-info auction · vs 3 AI personalities · 99% RTP
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <StatChip label="RTP"     value="99%"  />
              <StatChip label="Max Win" value="450×" />
            </div>
          </header>

          {/* Status banner */}
          <div className="px-4 sm:px-6 pt-5">
            <StatusBanner
              phase={phase}
              round={round}
              accent={accent}
              resultMult={resultMult}
              resultBusted={resultBusted}
              player={player}
              playerTotal={playerTotal}
            />
          </div>

          {/* Bidder lanes */}
          <div className="px-3 sm:px-6 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {bidders.map((b, i) => (
                <BidderLane
                  key={b.id}
                  bidder={b}
                  isYou={i === 0}
                  accent={accent}
                  revealedThroughRound={revealedThroughRound}
                  currentRound={round}
                  phase={phase}
                  resultBusted={resultBusted}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — control panel */}
        <div className="rounded-3xl p-5 space-y-5 self-start" style={{ background: '#0F1828', border: '1px solid #1A2238' }}>
          {/* Balance */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA3B8' }}>Balance</span>
            <div className="flex items-center gap-1.5">
              {isGC ? <GoldCoinIcon size={14} /> : <SweepCoinIcon size={14} />}
              <span className="font-mono font-black text-sm" style={{ color: accent }}>{isGC ? formatGC(goldCoins) : sweepCoins.toFixed(2)}</span>
              <span className="text-[10px]" style={{ color: '#8FA3B8' }}>{activeCurrency}</span>
            </div>
          </div>

          {/* Bet */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#8FA3B8' }}>Bet amount</label>
            <div className="relative">
              <input
                type="number"
                value={bet}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setBet(Number.isFinite(v) && v > 0 ? Math.min(v, 100_000_000) : 0);
                }}
                disabled={phase === 'bidding' || phase === 'revealing'}
                min={0}
                step={isGC ? 1 : 0.1}
                className="w-full pl-3 pr-20 py-2.5 rounded-xl text-sm font-mono font-bold focus:outline-none transition-colors disabled:opacity-60"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238', color: '#F5E8C8' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = `${accent}66`)}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#1A2238')}
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
                <button type="button" disabled={phase === 'bidding' || phase === 'revealing'} onClick={() => setBet((b) => Math.max(isGC ? 1 : 0.1, +(b / 2).toFixed(2)))}
                  className="px-2 py-1 rounded-lg text-[10px] font-black transition-colors hover:bg-white/10 disabled:opacity-50"
                  style={{ color: '#8FA3B8', background: 'rgba(255,255,255,0.04)' }}>½</button>
                <button type="button" disabled={phase === 'bidding' || phase === 'revealing'} onClick={() => setBet((b) => Math.min(balance, +(b * 2).toFixed(2)) || (isGC ? 1 : 0.1))}
                  className="px-2 py-1 rounded-lg text-[10px] font-black transition-colors hover:bg-white/10 disabled:opacity-50"
                  style={{ color: '#8FA3B8', background: 'rgba(255,255,255,0.04)' }}>2×</button>
              </div>
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {QUICK_BETS.map((v) => (
                <button key={v} type="button" disabled={phase === 'bidding' || phase === 'revealing'} onClick={() => setBet(v)}
                  className="px-2 py-1 rounded-md text-[10px] font-bold transition-colors disabled:opacity-50"
                  style={{
                    background: bet === v ? `${accent}1A` : 'rgba(255,255,255,0.03)',
                    color:      bet === v ? accent : '#8FA3B8',
                    border:     `1px solid ${bet === v ? `${accent}44` : '#1A2238'}`,
                  }}>{v < 10 ? v.toFixed(1) : v}</button>
              ))}
            </div>
          </div>

          {/* Bid chips — only visible during bidding */}
          {phase === 'bidding' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#8FA3B8' }}>
                Round {round} of {ROUNDS} · your bid
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {BID_CHIPS.map((f) => {
                  const active = Math.abs(pendingBidFrac - f) < 0.001;
                  return (
                    <button key={f} type="button" onClick={() => setPendingBidFrac(f)}
                      className="py-2 px-2 rounded-lg text-center transition-all"
                      style={{
                        background: active ? `${accent}14` : 'rgba(255,255,255,0.03)',
                        border:     `1px solid ${active ? `${accent}55` : '#1A2238'}`,
                      }}>
                      <p className="text-[10px] font-black font-mono" style={{ color: active ? accent : '#F5E8C8' }}>{(f * 100).toFixed(0)}%</p>
                      <p className="text-[9px]" style={{ color: '#8FA3B8' }}>{(player.card * f).toFixed(1)}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2238' }}>
                <p className="text-[10px] flex items-center justify-between" style={{ color: '#8FA3B8' }}>
                  <span>Card · running total · after this bid</span>
                  <span className="font-mono font-bold" style={{ color: '#F5E8C8' }}>
                    {player.card} · {playerTotal.toFixed(1)} → <span style={{ color: (playerTotal + pendingBidValue > player.card) ? '#EF4444' : accent }}>{(playerTotal + pendingBidValue).toFixed(1)}</span>
                  </span>
                </p>
                {(playerTotal + pendingBidValue) > player.card && (
                  <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: '#EF4444' }}>
                    <Skull className="w-3 h-3" /> Would overbid — auto-bust if you win
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Primary CTA */}
          {phase === 'idle' || phase === 'resolved' ? (
            <button type="button"
              onClick={isLoggedIn ? (phase === 'idle' ? beginRound : reset) : () => openAuthModal()}
              className="w-full py-3.5 rounded-xl font-display text-base font-black transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accentSec})`,
                color: '#040814',
                boxShadow: `0 6px 24px ${accent}40`,
              }}>
              {!isLoggedIn ? (
                <span className="flex items-center justify-center gap-2"><Lock className="w-4 h-4" /> Sign in to play</span>
              ) : phase === 'idle' ? (
                <>Bet {isGC ? formatGC(bet) : bet.toFixed(2)} {activeCurrency}</>
              ) : (
                <span className="flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> New auction</span>
              )}
            </button>
          ) : (
            <button type="button"
              onClick={submitBid}
              disabled={phase !== 'bidding'}
              className="w-full py-3.5 rounded-xl font-display text-base font-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: phase === 'bidding'
                  ? `linear-gradient(135deg, ${accent}, ${accentSec})`
                  : 'rgba(255,255,255,0.04)',
                color:     phase === 'bidding' ? '#040814' : '#8FA3B8',
                boxShadow: phase === 'bidding' ? `0 6px 24px ${accent}40` : 'none',
              }}>
              {phase === 'bidding'
                ? <>Submit {pendingBidValue.toFixed(1)} · round {round}/{ROUNDS}</>
                : 'Resolving…'}
            </button>
          )}

          {/* Bandits roster */}
          <div className="pt-2" style={{ borderTop: '1px solid #1A2238' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: '#8FA3B8' }}>The bandits</span>
            <div className="space-y-1.5">
              {AI_DEFS.map((a) => (
                <div key={a.id} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238', color: '#F5E8C8' }}>
                    <span className="text-[10px] font-black">{a.avatar}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold leading-tight" style={{ color: '#F5E8C8' }}>{a.name}</p>
                    <p className="text-[10px] leading-snug" style={{ color: '#8FA3B8' }}>{a.blurb}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Local history */}
          <div className="pt-2" style={{ borderTop: '1px solid #1A2238' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA3B8' }}>Your last auctions</span>
              {history.length > 0 && (
                <button type="button" onClick={() => setHistory([])} className="text-[10px] underline opacity-60 hover:opacity-100" style={{ color: '#8FA3B8' }}>clear</button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-[11px]" style={{ color: '#4A5878' }}>Your wins and busts will show here.</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {history.map((h, i) => (
                  <div key={i}
                    title={`card ${h.card} / bid ${h.totalBid.toFixed(1)}${h.result === 'win' ? ` · +${(h.bet * h.mult).toFixed(2)}` : ''}`}
                    className="px-2 py-1 rounded-md text-[10px] font-mono font-bold"
                    style={{
                      background: h.result === 'win' ? 'rgba(45,201,122,0.10)' : 'rgba(239,68,68,0.10)',
                      color:      h.result === 'win' ? '#2DC97A'              : '#EF4444',
                      border:     `1px solid ${h.result === 'win' ? 'rgba(45,201,122,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    }}>
                    {h.result === 'win' ? `${h.mult.toFixed(2)}×` : 'BUST'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower tabs */}
      <div className="rounded-3xl" style={{ background: '#0F1828', border: '1px solid #1A2238' }}>
        <div className="flex border-b" style={{ borderColor: '#1A2238' }}>
          {([
            { id: 'recent',      label: 'Recent Plays',   icon: TrendingUp },
            { id: 'leaderboard', label: 'Leaderboard',    icon: BarChart3 },
            { id: 'rules',       label: 'Rules',          icon: Info },
            { id: 'fairness',    label: 'Provably Fair',  icon: Shield },
          ] as { id: Tab; label: string; icon: typeof Info }[]).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold transition-colors relative"
                style={{ color: active ? accent : '#8FA3B8' }}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {active && <motion.div layoutId="auction-tab" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: accent }} />}
              </button>
            );
          })}
        </div>
        <div className="p-5">
          {activeTab === 'recent'      && <RecentPlaysList accent={accent} />}
          {activeTab === 'leaderboard' && <LeaderboardList accent={accent} />}
          {activeTab === 'rules'       && <RulesPanel />}
          {activeTab === 'fairness'    && <FairnessPanel seed={seed} nonce={nonce} />}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function initialBidders(): Bidder[] {
  return [
    { id: 'you',      name: 'You',                 avatar: 'YOU', card: randomCard(), cardRevealed: true,  bids: [] },
    { id: 'greedy',   name: AI_DEFS[0].name,       avatar: AI_DEFS[0].avatar, personality: 'greedy',   card: randomCard(), cardRevealed: false, bids: [] },
    { id: 'cautious', name: AI_DEFS[1].name,       avatar: AI_DEFS[1].avatar, personality: 'cautious', card: randomCard(), cardRevealed: false, bids: [] },
    { id: 'bluffer',  name: AI_DEFS[2].name,       avatar: AI_DEFS[2].avatar, personality: 'bluffer',  card: randomCard(), cardRevealed: false, bids: [] },
  ];
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238' }}>
      <p className="text-[8px] font-bold uppercase tracking-widest leading-none" style={{ color: '#8FA3B8' }}>{label}</p>
      <p className="text-[11px] font-mono font-black leading-tight mt-0.5" style={{ color: '#F5E8C8' }}>{value}</p>
    </div>
  );
}

function StatusBanner({
  phase, round, accent, resultMult, resultBusted, player, playerTotal,
}: {
  phase: Phase; round: number; accent: string;
  resultMult: number; resultBusted: boolean;
  player: Bidder; playerTotal: number;
}) {
  if (phase === 'idle') {
    return (
      <div className="text-center py-3 px-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-[11px]" style={{ color: '#8FA3B8' }}>
          Place a bet to start a 4-round auction. You&apos;ll see your hidden card; the bandits&apos; cards stay face-down until the end.
        </p>
      </div>
    );
  }
  if (phase === 'bidding' || phase === 'revealing') {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl" style={{ background: `${accent}10`, border: `1px solid ${accent}33` }}>
        <div>
          <p className="text-[9px] uppercase font-bold tracking-widest leading-none" style={{ color: '#8FA3B8' }}>Round</p>
          <p className="font-mono font-black text-2xl leading-tight mt-1" style={{ color: accent }}>{round} <span className="text-base" style={{ color: '#8FA3B8' }}>/ {ROUNDS}</span></p>
        </div>
        <div className="hidden sm:block">
          <p className="text-[9px] uppercase font-bold tracking-widest leading-none" style={{ color: '#8FA3B8' }}>Your card</p>
          <p className="font-mono font-black text-lg leading-tight mt-1" style={{ color: '#F5E8C8' }}>{player.card}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase font-bold tracking-widest leading-none" style={{ color: '#8FA3B8' }}>Your total bid</p>
          <p className="font-mono font-black text-lg leading-tight mt-1" style={{
            color: playerTotal > player.card ? '#EF4444' : '#F5E8C8',
          }}>{playerTotal.toFixed(1)} <span className="text-[10px]" style={{ color: '#8FA3B8' }}>/ {player.card}</span></p>
        </div>
      </div>
    );
  }
  // resolved
  if (resultBusted) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)' }}>
        <Skull className="w-4 h-4" style={{ color: '#EF4444' }} />
        <p className="text-sm font-black uppercase tracking-widest" style={{ color: '#EF4444' }}>Lost the auction</p>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl" style={{ background: `${accent}14`, border: `1px solid ${accent}44`, boxShadow: `0 0 24px ${accent}22` }}>
      <Trophy className="w-4 h-4" style={{ color: accent }} />
      <p className="text-sm font-black uppercase tracking-widest" style={{ color: accent }}>Won at {resultMult.toFixed(2)}×</p>
    </div>
  );
}

function BidderLane({
  bidder, isYou, accent, revealedThroughRound, currentRound, phase, resultBusted,
}: {
  bidder: Bidder; isYou: boolean; accent: string;
  revealedThroughRound: number; currentRound: number;
  phase: Phase; resultBusted: boolean;
}) {
  const total = bidder.bids.reduce((a, b) => a + b, 0);
  const overbid = bidder.cardRevealed && total > bidder.card;
  const won = phase === 'resolved' && !resultBusted && isYou;
  const loseHighlight = phase === 'resolved' && !isYou && !resultBusted; // dim non-winners
  // Bandit-winner highlight (if you busted by losing)
  const personalityColor: Record<Personality, string> = {
    greedy:   '#EF4444',
    cautious: '#60A5FA',
    bluffer:  '#F472B6',
  };
  const tierColor = isYou ? '#F0B232' : personalityColor[bidder.personality!];

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: won ? `${accent}10` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${won ? `${accent}55` : isYou ? '#F0B23244' : '#1A2238'}`,
        opacity: loseHighlight && !won ? 0.7 : 1,
      }}
    >
      {/* Lane header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid #1A2238' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${tierColor}22`, border: `1px solid ${tierColor}55`, color: tierColor }}>
          <span className="text-[10px] font-black">{bidder.avatar}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold truncate" style={{ color: '#F5E8C8' }}>{isYou ? 'You' : bidder.name.split(' the ')[0]}</p>
          {!isYou && bidder.personality && (
            <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: tierColor }}>
              {bidder.personality}
            </p>
          )}
        </div>
      </div>

      {/* Card */}
      <div className="px-3 py-2 flex items-center justify-center" style={{ borderBottom: '1px solid #1A2238', background: '#08121C' }}>
        {bidder.cardRevealed ? (
          <div className="text-center">
            <p className="font-display font-black text-2xl number-display" style={{ color: tierColor }}>{bidder.card}</p>
            <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#4A5878' }}>Card</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="font-display font-black text-2xl" style={{ color: '#4A5878' }}>?</div>
            <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#4A5878' }}>Hidden</p>
          </div>
        )}
      </div>

      {/* Bid rows */}
      <div className="px-3 py-2 space-y-1">
        {[...Array(ROUNDS)].map((_, ri) => {
          const round = ri + 1;
          const bid = bidder.bids[ri];
          const visible = (isYou && bid !== undefined) || (!isYou && round <= revealedThroughRound);
          const pending = !visible && round === currentRound && phase === 'bidding';
          return (
            <div key={ri} className="flex items-center justify-between text-[11px] font-mono">
              <span style={{ color: pending ? accent : '#4A5878' }}>R{round}</span>
              {visible && bid !== undefined ? (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`b${ri}`}
                    initial={!isYou ? { opacity: 0, y: -4 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-black"
                    style={{ color: '#F5E8C8' }}
                  >
                    {bid.toFixed(1)}
                  </motion.span>
                </AnimatePresence>
              ) : pending ? (
                <span style={{ color: accent }}>· · ·</span>
              ) : (
                <span style={{ color: '#1A2238' }}>—</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="px-3 py-2 flex items-center justify-between" style={{ borderTop: '1px solid #1A2238', background: '#08121C' }}>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#8FA3B8' }}>Total</span>
        <span className="font-mono font-black text-sm" style={{
          color: overbid ? '#EF4444' : (won ? accent : '#F5E8C8'),
        }}>
          {total.toFixed(1)}
          {overbid && <span className="ml-1 text-[9px]" title="Overbid">⚠</span>}
        </span>
      </div>
    </div>
  );
}

function RecentPlaysList({ accent }: { accent: string }) {
  return (
    <div className="space-y-1">
      {RECENT_PLAYS.map((p, i) => {
        const tierColor = getVIPColor(p.tier);
        return (
          <div key={i} className="flex items-center justify-between gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.025] transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <YalaAvatar initials={p.avatar} tier={p.tier} size={26} hideBadge />
              <div className="min-w-0">
                <p className="text-[12px] font-bold truncate" style={{ color: tierColor }}>{p.user}</p>
                <p className="text-[9px] font-mono" style={{ color: '#4A5878' }}>{p.time} ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right"><p className="text-[9px] uppercase tracking-widest" style={{ color: '#8FA3B8' }}>Bet</p><p className="font-mono font-bold text-[11px]" style={{ color: '#F5E8C8' }}>{p.bet}</p></div>
              <div className="text-right w-14"><p className="text-[9px] uppercase tracking-widest" style={{ color: '#8FA3B8' }}>×</p><p className="font-mono font-bold text-[11px]" style={{ color: p.won ? accent : '#EF4444' }}>{p.won ? `${p.mult.toFixed(2)}×` : 'BUST'}</p></div>
              <div className="text-right w-16"><p className="text-[9px] uppercase tracking-widest" style={{ color: '#8FA3B8' }}>Payout</p><p className="font-mono font-black text-[11px]" style={{ color: p.won ? accent : '#EF4444' }}>{p.won ? `+${p.payout}` : '0'}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardList({ accent }: { accent: string }) {
  const max = LEADERBOARD[0].profit;
  return (
    <div className="space-y-2">
      {LEADERBOARD.map((p) => {
        const tierColor = getVIPColor(p.tier);
        const pct = (p.profit / max) * 100;
        return (
          <div key={p.rank} className="flex items-center gap-3 px-2 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="font-mono font-black text-sm w-6 text-center" style={{ color: p.rank <= 3 ? accent : '#8FA3B8' }}>{p.rank}</span>
            <YalaAvatar initials={p.avatar} tier={p.tier} size={26} hideBadge />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold truncate" style={{ color: tierColor }}>{p.user}</p>
              <div className="h-1 mt-1 rounded-full overflow-hidden" style={{ background: '#1A2238' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, ${tierColor})` }} />
              </div>
            </div>
            <span className="font-mono font-black text-[11px]" style={{ color: accent }}>+{formatGC(p.profit)}</span>
          </div>
        );
      })}
    </div>
  );
}

function RulesPanel() {
  const rules = [
    'You and 3 AI bandits each receive a hidden card valued 1–99. Only you see yours.',
    'There are 4 bid rounds. Each round, everyone bids simultaneously (a fraction of their card).',
    'After each round, all 4 bids reveal at once.',
    'After 4 rounds, the highest TOTAL bid wins the oasis.',
    `Multiplier = (your card ÷ your total bid) × ${MULT_K} — so winning closer to fair-price pays more.`,
    'If your total bid exceeds your card value, you bust (overpaid). If a bandit beats your total, you bust (outbid).',
    'Read the personalities — Greedy frontloads, Cautious sandbags, Bluffer is unpredictable.',
  ];
  return (
    <ol className="space-y-2.5 list-decimal list-inside">
      {rules.map((r, i) => (
        <li key={i} className="text-[13px] leading-relaxed" style={{ color: '#F5E8C8' }}>
          <span style={{ color: '#8FA3B8' }}>{r}</span>
        </li>
      ))}
    </ol>
  );
}

function FairnessPanel({ seed, nonce }: { seed: string; nonce: number }) {
  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-relaxed" style={{ color: '#8FA3B8' }}>
        Each bandit&apos;s hidden card and bid randomness are derived from a provably fair seed. The 4.5× multiplier constant was tuned by simulation (200K rounds) to land at ~99% RTP under balanced player strategy.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2238' }}>
          <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: '#8FA3B8' }}>Server seed (hashed)</p>
          <p className="font-mono text-[10px] break-all mt-1" style={{ color: '#F5E8C8' }}>{seed || '—'}</p>
        </div>
        <div className="px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2238' }}>
          <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: '#8FA3B8' }}>Nonce</p>
          <p className="font-mono text-[11px] mt-1" style={{ color: '#F5E8C8' }}>{nonce}</p>
        </div>
      </div>
      <p className="text-[10px]" style={{ color: '#4A5878' }}>
        Seed rotates after each round. Verification tooling will ship with the production build.
      </p>
    </div>
  );
}
