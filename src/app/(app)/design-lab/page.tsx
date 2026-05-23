'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import {
  Heart, Eye, X, Check, ChevronRight, Flame, Zap, Trophy,
  Users, Star, TrendingUp, Sparkles, MessageSquare, Copy,
  Clock, Crown, Lock, Gift, Diamond, Wallet, Award, Shield, Plus, ArrowRight, Activity,
} from 'lucide-react';
import { YalaIcon, type YalaIconName } from '@/components/ui/YalaIcon';

// ── Mock preview data ─────────────────────────────────────────────────────────
const GAME = {
  name: 'Gates of Olympus', provider: 'Pragmatic Play', rtp: 96.5,
  maxWin: '5,000×', isHot: true, isNew: false, playerCount: 1247,
  recentWin: '2,400,000 GC', tags: ['Megaways', 'Bonus Buy'],
  imageUrl: 'https://picsum.photos/seed/gates-olympus/300/450',
  gradient: 'linear-gradient(135deg, #1e3a8a, #4c1d95)',
};
const GAME2 = { ...GAME, name: 'Sweet Bonanza', provider: 'Pragmatic Play', isNew: true, isHot: false, imageUrl: 'https://picsum.photos/seed/sweet-bonanza/300/450', gradient: 'linear-gradient(135deg, #7f1d1d, #831843)' };
const GAME3 = { ...GAME, name: 'Book of Dead', provider: "Play'n GO", isHot: true, imageUrl: 'https://picsum.photos/seed/book-dead/300/450', gradient: 'linear-gradient(135deg, #78350f, #451a03)' };

const SPORT = {
  home: 'Kansas City Chiefs', homeAbbr: 'KC', homeLogo: 'https://a.espncdn.com/i/teamlogos/nfl/500-dark/kc.png', homeScore: 14,
  away: 'Philadelphia Eagles', awayAbbr: 'PHI', awayLogo: 'https://a.espncdn.com/i/teamlogos/nfl/500-dark/phi.png', awayScore: 10,
  league: 'NFL · Week 14', time: 'Q2 4:12', isLive: true,
  spread: -3.5, spreadOdds: -110, mlHome: -168, mlAway: +142, total: 47.5, overOdds: -110,
};

// ── Sections ──────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'gamecard', label: 'Game Cards', emoji: '🎮', count: 20 },
  { id: 'hero', label: 'Hero Banners', emoji: '🏆', count: 10 },
  { id: 'sportscard', label: 'Sports Cards', emoji: '🏈', count: 10 },
  { id: 'wallet', label: 'Wallet Widget', emoji: '💰', count: 8 },
  { id: 'icons', label: 'Icon Library', emoji: '✦', count: 33 },
];

// ── Icon picker data ──────────────────────────────────────────────────────────
const ICON_CATEGORIES: {
  id: string; label: string;
  icons: { name: YalaIconName; label: string; lucide: LucideIcon | null; lucideName: string | null }[];
}[] = [
  { id: 'brand', label: 'Brand & Logo', icons: [
    { name: 'y-coin',       label: 'Y Coin',       lucide: null,       lucideName: null },
    { name: 'y-tile',       label: 'Y Tile',        lucide: null,       lucideName: null },
    { name: 'pyramid',      label: 'Pyramid',       lucide: null,       lucideName: null },
    { name: 'pyramid-ring', label: 'Pyramid Ring',  lucide: null,       lucideName: null },
    { name: 'wordmark',     label: 'Wordmark',      lucide: null,       lucideName: null },
  ]},
  { id: 'currency', label: 'Currency', icons: [
    { name: 'coin',         label: 'Gold Coin',     lucide: null,       lucideName: null },
    { name: 'coin-stack',   label: 'Coin Stack',    lucide: null,       lucideName: null },
    { name: 'chip-green',   label: 'SC Chip',       lucide: null,       lucideName: null },
    { name: 'chip-gold',    label: 'GC Chip',       lucide: null,       lucideName: null },
    { name: 'diamond',      label: 'Diamond (SC)',  lucide: Diamond,    lucideName: 'Diamond' },
    { name: 'wallet-icon',  label: 'Wallet',        lucide: Wallet,     lucideName: 'Wallet' },
  ]},
  { id: 'game', label: 'Game Symbols', icons: [
    { name: 'star',         label: 'Star',          lucide: Star,       lucideName: 'Star' },
    { name: 'sparkle',      label: 'Sparkle',       lucide: Sparkles,   lucideName: 'Sparkles' },
    { name: 'lightning',    label: 'Lightning',     lucide: Zap,        lucideName: 'Zap' },
    { name: 'dice',         label: 'Dice',          lucide: null,       lucideName: null },
    { name: 'slot-reels',   label: 'Slot Reels',    lucide: null,       lucideName: null },
    { name: 'crown',        label: 'Crown',         lucide: Crown,      lucideName: 'Crown' },
    { name: 'clover',       label: 'Clover',        lucide: null,       lucideName: null },
    { name: 'wish',         label: 'Wishing Star',  lucide: null,       lucideName: null },
  ]},
  { id: 'rewards', label: 'Rewards & Luck', icons: [
    { name: 'gift',         label: 'Gift',          lucide: Gift,       lucideName: 'Gift' },
    { name: 'trophy',       label: 'Trophy',        lucide: Trophy,     lucideName: 'Trophy' },
    { name: 'badge-star',   label: 'Badge Star',    lucide: Award,      lucideName: 'Award' },
    { name: 'ticket',       label: 'Ticket',        lucide: null,       lucideName: null },
    { name: 'daily-star',   label: 'Daily Star',    lucide: null,       lucideName: null },
    { name: 'jackpot',      label: 'Jackpot 7',     lucide: null,       lucideName: null },
  ]},
  { id: 'ui', label: 'UI & Status', icons: [
    { name: 'lock',         label: 'Lock',          lucide: Lock,       lucideName: 'Lock' },
    { name: 'clock-icon',   label: 'Clock',         lucide: Clock,      lucideName: 'Clock' },
    { name: 'plus-icon',    label: 'Plus',          lucide: Plus,       lucideName: 'Plus' },
    { name: 'arrow',        label: 'Arrow Right',   lucide: ArrowRight, lucideName: 'ArrowRight' },
    { name: 'check',        label: 'Checkmark',     lucide: Check,      lucideName: 'Check' },
    { name: 'x-mark',       label: 'X / Close',     lucide: X,          lucideName: 'X' },
    { name: 'activity',     label: 'Activity',      lucide: Activity,   lucideName: 'Activity' },
    { name: 'shield',       label: 'Shield',        lucide: Shield,     lucideName: 'Shield' },
  ]},
];

function fmtOdds(n: number) { return n > 0 ? `+${n}` : `${n}`; }

// ── Shared helpers ────────────────────────────────────────────────────────────
function HotBadge() { return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/90 text-white uppercase tracking-wide">Hot</span>; }
function NewBadge() { return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/90 text-white uppercase tracking-wide">New</span>; }

// ═══════════════════════════════════════════════════════════════════════════════
//  GAME CARD VARIANTS  (20 total)
// ═══════════════════════════════════════════════════════════════════════════════

const GC_VARIANTS: { id: number; name: string; desc: string; component: React.FC }[] = [

  // 1 ─ Current baseline
  { id: 1, name: 'Current Style', desc: 'Baseline — what ships today', component: function GC1() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer" style={{ background: GAME.gradient }}>
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1"><HotBadge /></div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-xs font-semibold text-[#F5E8C8] truncate">{GAME.name}</p>
          <p className="text-[10px] text-[#9CA3AF]">{GAME.provider}</p>
        </div>
      </div>
    );
  }},

  // 2 ─ Frosted glass
  { id: 2, name: 'Frosted Glass', desc: 'Blur + glass panel, image subdued', component: function GC2() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer" style={{ background: '#0A1810', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover opacity-35 group-hover:opacity-50 transition-opacity duration-300 scale-110" unoptimized />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(6,14,10,0.96) 100%)' }} />
        <div className="absolute top-2 right-2 flex gap-1"><HotBadge /></div>
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
          <p className="text-sm font-bold text-white">{GAME.name}</p>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-white/50">{GAME.provider}</p>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(45,201,122,0.2)', color: '#2DC97A' }}>RTP {GAME.rtp}%</span>
          </div>
        </div>
      </div>
    );
  }},

  // 3 ─ Neon border glow
  { id: 3, name: 'Neon Glow', desc: 'Electric border, hover intensifies', component: function GC3() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer" style={{ background: '#060E0A', boxShadow: '0 0 0 1px rgba(45,201,122,0.3), 0 0 20px rgba(45,201,122,0.05)' }}>
        <div className="absolute inset-0 rounded-xl transition-all duration-300 group-hover:shadow-[0_0_0_1.5px_#2DC97A,0_0_30px_rgba(45,201,122,0.25)] pointer-events-none z-10" />
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-300" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        <div className="absolute top-2 left-2"><HotBadge /></div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-xs font-bold" style={{ color: '#2DC97A' }}>{GAME.name}</p>
          <p className="text-[10px] text-white/40">{GAME.provider}</p>
        </div>
      </div>
    );
  }},

  // 4 ─ Gradient only, no image
  { id: 4, name: 'Minimal Flat', desc: 'Pure gradient, no image noise', component: function GC4() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-transform duration-200 group-hover:scale-[1.02]" style={{ background: 'linear-gradient(145deg, #1e3a8a, #312e81, #0f172a)' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-14 h-14 rounded-2xl mb-3 flex items-center justify-center text-2xl" style={{ background: 'rgba(255,255,255,0.08)' }}>⚡</div>
          <p className="font-black text-sm text-white leading-tight">{GAME.name}</p>
          <p className="text-[10px] text-white/50 mt-1">{GAME.provider}</p>
        </div>
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <span className="text-[9px] font-bold px-2 py-1 rounded-full text-white/70" style={{ background: 'rgba(255,255,255,0.08)' }}>Max Win {GAME.maxWin}</span>
        </div>
        <div className="absolute top-2 left-2"><HotBadge /></div>
      </div>
    );
  }},

  // 5 ─ Data dense
  { id: 5, name: 'Data Dense', desc: 'RTP, max win, players, tags visible', component: function GC5() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer" style={{ background: '#0C1812', border: '1px solid #1A2E22' }}>
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover opacity-50 group-hover:opacity-65 transition-opacity" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060E0A] via-[#060E0A]/60 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1"><HotBadge /></div>
        <div className="absolute bottom-0 left-0 right-0 p-2.5 space-y-1.5">
          <p className="text-[11px] font-bold text-white truncate">{GAME.name}</p>
          <div className="grid grid-cols-2 gap-1">
            <div className="rounded px-1.5 py-1 text-center" style={{ background: 'rgba(240,178,50,0.1)' }}>
              <p className="text-[8px] text-[#F0B232]/70 uppercase tracking-wide">RTP</p>
              <p className="text-[10px] font-bold" style={{ color: '#F0B232' }}>{GAME.rtp}%</p>
            </div>
            <div className="rounded px-1.5 py-1 text-center" style={{ background: 'rgba(45,201,122,0.1)' }}>
              <p className="text-[8px] text-[#2DC97A]/70 uppercase tracking-wide">Max</p>
              <p className="text-[10px] font-bold" style={{ color: '#2DC97A' }}>{GAME.maxWin}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-2.5 h-2.5" style={{ color: '#8FA899' }} />
            <span className="text-[9px]" style={{ color: '#8FA899' }}>{GAME.playerCount.toLocaleString()} playing</span>
          </div>
        </div>
      </div>
    );
  }},

  // 6 ─ Horizontal landscape
  { id: 6, name: 'Horizontal Strip', desc: 'Landscape — image left, info right', component: function GC6() {
    return (
      <div className="group relative w-full rounded-xl overflow-hidden cursor-pointer flex" style={{ height: 80, background: '#0C1812', border: '1px solid #1A2E22' }}>
        <div className="relative w-20 flex-shrink-0">
          <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="80px" className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
        </div>
        <div className="flex-1 px-3 py-2 flex flex-col justify-center gap-1">
          <div className="flex items-start justify-between gap-1">
            <p className="text-xs font-bold text-white leading-tight">{GAME.name}</p>
            <HotBadge />
          </div>
          <p className="text-[10px]" style={{ color: '#8FA899' }}>{GAME.provider}</p>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold" style={{ color: '#F0B232' }}>Max {GAME.maxWin}</span>
            <span className="text-[9px]" style={{ color: '#4A6A55' }}>·</span>
            <span className="text-[9px]" style={{ color: '#4A6A55' }}>RTP {GAME.rtp}%</span>
          </div>
        </div>
      </div>
    );
  }},

  // 7 ─ Full image reveal on hover
  { id: 7, name: 'Hover Reveal', desc: 'Full image hidden until hover', component: function GC7() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer">
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover scale-110 group-hover:scale-100 transition-transform duration-700" unoptimized />
        <div className="absolute inset-0 bg-black/70 group-hover:bg-black/30 transition-colors duration-500" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 group-hover:opacity-0 transition-opacity duration-300">
          <p className="font-black text-lg text-white">{GAME.name}</p>
          <p className="text-xs text-white/60 mt-1">{GAME.provider}</p>
          <div className="mt-3 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(240,178,50,0.2)', border: '1px solid rgba(240,178,50,0.4)' }}>
            <Eye className="w-4 h-4" style={{ color: '#F0B232' }} />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="rounded-lg py-2 text-center text-xs font-bold text-black" style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}>Play Now</div>
        </div>
      </div>
    );
  }},

  // 8 ─ Premium gold
  { id: 8, name: 'Gold Premium', desc: 'Luxury gold-accented dark card', component: function GC8() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer" style={{ background: '#0A0804', border: '1px solid rgba(240,178,50,0.25)', boxShadow: 'inset 0 1px 0 rgba(240,178,50,0.08)' }}>
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover opacity-45 group-hover:opacity-60 transition-opacity duration-300" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0804] via-[#0A0804]/70 to-transparent" />
        <div className="absolute top-2 left-2">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,178,50,0.15)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.3)' }}>⭐ Featured</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
          <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(240,178,50,0.4), transparent)' }} />
          <p className="text-sm font-black" style={{ color: '#F0B232' }}>{GAME.name}</p>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-white/40">{GAME.provider}</p>
            <span className="text-[10px] font-bold" style={{ color: '#F0B232' }}>{GAME.maxWin}</span>
          </div>
        </div>
      </div>
    );
  }},

  // 9 ─ Win ticker
  { id: 9, name: 'Live Win Ticker', desc: 'Recent big win shown at bottom', component: function GC9() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer" style={{ background: GAME.gradient }}>
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute top-2 left-2"><HotBadge /></div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="px-3 pb-1 pt-0">
            <p className="text-xs font-semibold text-white truncate">{GAME.name}</p>
            <p className="text-[9px] text-white/50">{GAME.provider}</p>
          </div>
          <div className="mx-2 mb-2 px-2 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: 'rgba(45,201,122,0.15)', border: '1px solid rgba(45,201,122,0.25)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <p className="text-[9px] font-bold" style={{ color: '#2DC97A' }}>PyramidKing won <span style={{ color: '#F0B232' }}>{GAME.recentWin}</span></p>
          </div>
        </div>
      </div>
    );
  }},

  // 10 ─ Compact square
  { id: 10, name: 'Compact Square', desc: 'Dense 1:1 format, lots of info', component: function GC10() {
    return (
      <div className="group relative w-full aspect-square rounded-xl overflow-hidden cursor-pointer" style={{ background: GAME.gradient }}>
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover opacity-60 group-hover:opacity-75 transition-opacity" unoptimized />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col justify-between p-2">
          <div className="flex justify-between">
            {GAME.isHot && <HotBadge />}
            <span className="ml-auto text-[9px] font-bold" style={{ color: '#F0B232' }}>{GAME.maxWin}</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-white leading-tight">{GAME.name}</p>
            <p className="text-[9px] text-white/50">{GAME.provider}</p>
          </div>
        </div>
      </div>
    );
  }},

  // 11 ─ Split half
  { id: 11, name: 'Split Half', desc: 'Top image, bottom solid info panel', component: function GC11() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer" style={{ border: '1px solid #1A2E22' }}>
        <div className="relative h-[55%]">
          <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
          <div className="absolute top-2 left-2"><HotBadge /></div>
        </div>
        <div className="h-[45%] flex flex-col justify-center px-3 py-2 space-y-1.5" style={{ background: '#0C1812' }}>
          <p className="text-xs font-bold text-white">{GAME.name}</p>
          <p className="text-[10px]" style={{ color: '#8FA899' }}>{GAME.provider}</p>
          <div className="flex items-center gap-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(240,178,50,0.1)', color: '#F0B232' }}>RTP {GAME.rtp}%</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(45,201,122,0.1)', color: '#2DC97A' }}>{GAME.maxWin}</span>
          </div>
        </div>
      </div>
    );
  }},

  // 12 ─ Outlined card
  { id: 12, name: 'Outlined', desc: 'Transparent with gradient border', component: function GC12() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer p-px" style={{ background: 'linear-gradient(135deg, rgba(45,201,122,0.4), rgba(240,178,50,0.2), rgba(45,201,122,0.1))' }}>
        <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ background: '#060E0A' }}>
          <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover opacity-30 group-hover:opacity-50 transition-opacity" unoptimized />
          <div className="absolute inset-0 flex flex-col justify-between p-3">
            <div className="flex gap-1">{GAME.isHot && <HotBadge />}</div>
            <div className="space-y-1">
              <p className="text-xs font-bold" style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{GAME.name}</p>
              <p className="text-[10px]" style={{ color: '#8FA899' }}>{GAME.provider}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }},

  // 13 ─ 3-game showcase
  { id: 13, name: 'Trio Showcase', desc: 'Three games stacked, premium editorial', component: function GC13() {
    const games = [GAME, GAME2, GAME3];
    return (
      <div className="w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer" style={{ background: '#0C1812', border: '1px solid #1A2E22' }}>
        <div className="p-2 space-y-1.5 h-full flex flex-col">
          {games.map((g, i) => (
            <div key={i} className="group relative flex-1 rounded-lg overflow-hidden flex items-end" style={{ background: g.gradient }}>
              <Image src={g.imageUrl} alt={g.name} fill sizes="200px" className="object-cover opacity-50 group-hover:opacity-70 transition-opacity" unoptimized />
              <div className="relative z-10 px-2 py-1.5 bg-gradient-to-r from-black/80 to-transparent w-full">
                <p className="text-[10px] font-bold text-white">{g.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }},

  // 14 ─ Teal pop
  { id: 14, name: 'Teal Pop', desc: 'Teal accent scheme, emerald glow', component: function GC14() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer" style={{ background: '#040E0A', border: '1px solid rgba(45,201,122,0.2)', boxShadow: '0 0 24px rgba(45,201,122,0.05)' }}>
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-300 scale-105 group-hover:scale-100" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020B06] to-transparent" />
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,201,122,0.15)', border: '1px solid rgba(45,201,122,0.3)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-bold" style={{ color: '#2DC97A' }}>LIVE</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-xs font-bold" style={{ color: '#2DC97A' }}>{GAME.name}</p>
          <p className="text-[10px] text-white/40">{GAME.provider}</p>
          <div className="mt-1.5 flex items-center gap-1">
            <Users className="w-3 h-3" style={{ color: '#2DC97A', opacity: 0.6 }} />
            <span className="text-[9px]" style={{ color: '#2DC97A', opacity: 0.7 }}>{GAME.playerCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }},

  // 15 ─ Retro film
  { id: 15, name: 'Retro Film', desc: 'Desaturated, gritty, film-grain feel', component: function GC15() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer">
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-500" style={{ filter: 'grayscale(60%) sepia(20%) contrast(1.1)' }} unoptimized />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)' }} />
        <div className="absolute top-2 left-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/30 text-white/70">HOT</div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-mono text-xs font-bold text-white/90">{GAME.name.toUpperCase()}</p>
          <p className="font-mono text-[9px] text-white/40">{GAME.provider}</p>
        </div>
      </div>
    );
  }},

  // 16 ─ Max win hero
  { id: 16, name: 'Max Win Hero', desc: 'Multiplier is the star', component: function GC16() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer" style={{ background: 'linear-gradient(145deg, #0f0a00, #1a1000)' }}>
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover opacity-25 group-hover:opacity-40 transition-opacity" unoptimized />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <Trophy className="w-8 h-8 mb-2" style={{ color: '#F0B232', opacity: 0.8 }} />
          <p className="text-2xl font-black leading-none" style={{ color: '#F0B232' }}>{GAME.maxWin}</p>
          <p className="text-[9px] text-white/40 mt-0.5 uppercase tracking-widest">Max Win</p>
          <div className="mt-3 h-px w-12" style={{ background: 'rgba(240,178,50,0.3)' }} />
          <p className="text-[11px] font-bold text-white mt-3">{GAME.name}</p>
          <p className="text-[9px] text-white/40">{GAME.provider}</p>
        </div>
        {GAME.isHot && <div className="absolute top-2 right-2"><HotBadge /></div>}
      </div>
    );
  }},

  // 17 ─ Play count focus
  { id: 17, name: 'Social Proof', desc: 'Active players prominently shown', component: function GC17() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer" style={{ background: GAME.gradient }}>
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute top-2 left-2 right-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full w-fit" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-bold text-white">{GAME.playerCount.toLocaleString()} playing now</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-xs font-bold text-white">{GAME.name}</p>
          <p className="text-[10px] text-white/50">{GAME.provider}</p>
        </div>
      </div>
    );
  }},

  // 18 ─ Tag stack
  { id: 18, name: 'Tag Stack', desc: 'Tags + badges below card', component: function GC18() {
    return (
      <div className="w-full cursor-pointer group">
        <div className="relative w-full aspect-[3/4] rounded-t-xl overflow-hidden" style={{ background: GAME.gradient }}>
          <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {GAME.isHot && <div className="absolute top-2 left-2"><HotBadge /></div>}
        </div>
        <div className="rounded-b-xl px-2 py-1.5 space-y-1" style={{ background: '#0C1812', border: '1px solid #1A2E22', borderTop: 'none' }}>
          <p className="text-[11px] font-bold text-white truncate">{GAME.name}</p>
          <div className="flex flex-wrap gap-1">
            {GAME.tags.map(t => (
              <span key={t} className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(45,201,122,0.1)', color: '#2DC97A' }}>{t}</span>
            ))}
            <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(240,178,50,0.1)', color: '#F0B232' }}>RTP {GAME.rtp}%</span>
          </div>
        </div>
      </div>
    );
  }},

  // 19 ─ Diagonal split
  { id: 19, name: 'Diagonal Split', desc: 'Two-tone card with diagonal accent', component: function GC19() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer" style={{ background: '#060E0A' }}>
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover opacity-55 group-hover:opacity-70 transition-opacity duration-300" unoptimized />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#060E0A]/95" />
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-[#060E0A] to-transparent" />
        </div>
        <div className="absolute left-0 bottom-0 w-2 h-full" style={{ background: 'linear-gradient(180deg, #F0B232, #2DC97A, #1A5C8A)' }} />
        <div className="absolute top-2 right-2"><HotBadge /></div>
        <div className="absolute bottom-0 left-4 right-3 pb-3">
          <p className="text-xs font-black text-white">{GAME.name}</p>
          <p className="text-[9px] text-white/40 mt-0.5">{GAME.provider} · {GAME.maxWin}</p>
        </div>
      </div>
    );
  }},

  // 20 ─ Blurred depth
  { id: 20, name: 'Depth Blur', desc: 'Background blurs, card floats above', component: function GC20() {
    return (
      <div className="group relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer">
        <Image src={GAME.imageUrl} alt={GAME.name} fill sizes="200px" className="object-cover scale-125 group-hover:scale-110 transition-transform duration-700" style={{ filter: 'blur(0px)' }} unoptimized />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-3">
          <div className="w-full rounded-xl p-3" style={{ background: 'rgba(12,24,18,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold text-white">{GAME.name}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[9px]" style={{ color: '#8FA899' }}>{GAME.provider}</p>
              <span className="text-[9px] font-bold" style={{ color: '#F0B232' }}>{GAME.maxWin}</span>
            </div>
          </div>
        </div>
        {GAME.isHot && <div className="absolute top-2 left-2"><HotBadge /></div>}
      </div>
    );
  }},
];

// ═══════════════════════════════════════════════════════════════════════════════
//  HERO BANNER VARIANTS  (10 total)
// ═══════════════════════════════════════════════════════════════════════════════

const HERO_VARIANTS: { id: number; name: string; desc: string; component: React.FC }[] = [

  { id: 1, name: 'Dark Radial', desc: 'Current style — radial glow, centered', component: function H1() {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: 160, background: 'radial-gradient(ellipse at 15% 60%, rgba(45,201,122,0.18), transparent 55%), radial-gradient(ellipse at 85% 25%, rgba(240,178,50,0.14), transparent 55%), #0C1812', border: '1px solid #1A2E22' }}>
        <div className="relative z-10 p-5 flex items-center justify-between h-full">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2DC97A' }}>2,847 Players Online</span>
            </div>
            <h1 className="text-2xl font-black" style={{ background: 'linear-gradient(135deg, #F5E8C8, #F0B232)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>The Oasis<br/>Awaits</h1>
            <div className="mt-3 flex gap-2">
              <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-black" style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}>Play Free</button>
              <button className="px-4 py-1.5 rounded-lg text-xs font-semibold border" style={{ borderColor: 'rgba(45,201,122,0.3)', color: '#2DC97A' }}>Sportsbook</button>
            </div>
          </div>
          <div className="hidden sm:block text-6xl opacity-10">🏜️</div>
        </div>
      </div>
    );
  }},

  { id: 2, name: 'Game Grid BG', desc: 'Game covers tile the background', component: function H2() {
    const imgs = [GAME.imageUrl, GAME2.imageUrl, GAME3.imageUrl, 'https://picsum.photos/seed/hero-b/300/200', 'https://picsum.photos/seed/hero-c/300/200', 'https://picsum.photos/seed/hero-d/300/200'];
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: 160 }}>
        <div className="absolute inset-0 grid grid-cols-6 gap-0.5 opacity-30">
          {imgs.map((src, i) => (
            <div key={i} className="relative"><Image src={src} alt="" fill className="object-cover" unoptimized sizes="80px" /></div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#060E0A] via-[#060E0A]/80 to-[#060E0A]/40" />
        <div className="relative z-10 p-5 h-full flex flex-col justify-center">
          <h1 className="text-2xl font-black text-white mb-1">200+ Games</h1>
          <p className="text-sm text-white/60 mb-3">Casino, Sports, Originals — all in one place</p>
          <button className="w-fit px-4 py-1.5 rounded-lg text-xs font-bold text-black" style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}>Browse All</button>
        </div>
      </div>
    );
  }},

  { id: 3, name: 'Split Panel', desc: 'Casino left / Sportsbook right', component: function H3() {
    return (
      <div className="relative w-full rounded-xl overflow-hidden flex" style={{ height: 160, border: '1px solid #1A2E22' }}>
        <div className="flex-1 relative p-4 flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #0C1812, #1A2E22)' }}>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#F0B232' }}>Casino</span>
          <div>
            <p className="text-lg font-black text-white">100+<br/>Games</p>
            <button className="mt-2 px-3 py-1 rounded text-[10px] font-bold text-black" style={{ background: '#F0B232' }}>Play Now</button>
          </div>
        </div>
        <div className="w-px" style={{ background: 'linear-gradient(180deg, transparent, #2DC97A, transparent)' }} />
        <div className="flex-1 relative p-4 flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #060E12, #0C1820)' }}>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#2DC97A' }}>Sportsbook</span>
          <div>
            <p className="text-lg font-black text-white">Live<br/>Odds</p>
            <button className="mt-2 px-3 py-1 rounded text-[10px] font-bold text-black" style={{ background: '#2DC97A' }}>Bet Now</button>
          </div>
        </div>
      </div>
    );
  }},

  { id: 4, name: 'Dark Minimal', desc: 'Clean, luxury type-driven', component: function H4() {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden flex items-center" style={{ height: 160, background: '#050A07', border: '1px solid rgba(240,178,50,0.12)' }}>
        <div className="px-8">
          <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: 'rgba(240,178,50,0.5)' }}>Yala Social Casino</p>
          <h1 className="text-3xl font-black leading-none" style={{ color: '#F5E8C8' }}>Play Free.<br/><span style={{ color: '#F0B232' }}>Win Big.</span></h1>
          <div className="mt-4 flex items-center gap-3">
            <button className="px-5 py-2 rounded-lg text-xs font-bold text-black" style={{ background: '#F0B232' }}>Get Started</button>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>No purchase necessary</span>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-40 opacity-[0.06]">
          <svg viewBox="0 0 40 34" fill="none" className="w-full h-full" style={{ padding: 16 }}>
            <defs><clipPath id="pyr-hero-dl"><polygon points="20,0 40,34 0,34"/></clipPath></defs>
            <rect x="0" y="0" width="40" height="8.5" fill="#F0B232" clipPath="url(#pyr-hero-dl)"/>
            <rect x="0" y="8.5" width="40" height="8.5" fill="#84CC16" clipPath="url(#pyr-hero-dl)"/>
            <rect x="0" y="17" width="40" height="8.5" fill="#2DC97A" clipPath="url(#pyr-hero-dl)"/>
            <rect x="0" y="25.5" width="40" height="8.5" fill="#1A5C8A" clipPath="url(#pyr-hero-dl)"/>
          </svg>
        </div>
      </div>
    );
  }},

  { id: 5, name: 'Jackpot Ticker', desc: 'Live jackpot amount animating', component: function H5() {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: 160, background: 'linear-gradient(135deg, #0A0600, #180D00)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(240,178,50,0.8) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(240,178,50,0.5)' }}>Current Jackpot</p>
          <p className="text-4xl font-black number-display" style={{ color: '#F0B232', textShadow: '0 0 30px rgba(240,178,50,0.4)' }}>$2,847,391</p>
          <p className="text-[10px] text-white/30 mt-1 mb-4">Grows every second · No purchase necessary</p>
          <button className="px-6 py-2 rounded-full text-xs font-bold text-black" style={{ background: 'linear-gradient(135deg, #F0B232, #FFD166)' }}>Claim Your Share</button>
        </div>
      </div>
    );
  }},

  { id: 6, name: 'Floating Cards', desc: 'Game cards float above hero', component: function H6() {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: 160, background: 'linear-gradient(135deg, #060E0A, #0C1812)' }}>
        <div className="absolute right-4 top-2 bottom-2 flex items-center gap-2">
          {[GAME.imageUrl, GAME2.imageUrl, GAME3.imageUrl].map((src, i) => (
            <div key={i} className="relative w-16 h-full rounded-lg overflow-hidden" style={{ transform: `rotate(${i === 0 ? -3 : i === 2 ? 3 : 0}deg)`, opacity: i === 1 ? 1 : 0.6, zIndex: i === 1 ? 2 : 1 }}>
              <Image src={src} alt="" fill className="object-cover" unoptimized sizes="64px" />
            </div>
          ))}
        </div>
        <div className="relative z-10 p-5 flex flex-col justify-center h-full max-w-[60%]">
          <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: '#2DC97A' }}>200+ Titles</p>
          <h1 className="text-xl font-black text-white leading-tight">Slots, Live Casino<br/>&amp; Originals</h1>
          <button className="mt-3 w-fit px-4 py-1.5 rounded-lg text-[10px] font-bold text-black" style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}>Open Casino</button>
        </div>
      </div>
    );
  }},

  { id: 7, name: 'Stats Bar', desc: 'Trust stats across the top', component: function H7() {
    const stats = [['2,847', 'Players Now'], ['$4.2M', 'Paid Out Today'], ['200+', 'Games'], ['99%', 'Uptime']];
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: 160, background: '#0C1812', border: '1px solid #1A2E22' }}>
        <div className="border-b px-4 py-2 flex items-center justify-between" style={{ borderColor: '#1A2E22', background: 'rgba(45,201,122,0.04)' }}>
          {stats.map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-base font-black number-display" style={{ color: '#F0B232' }}>{val}</p>
              <p className="text-[9px] text-white/40">{label}</p>
            </div>
          ))}
        </div>
        <div className="p-4 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-black text-white">The Real Deal.<br/><span style={{ color: '#2DC97A' }}>No Gimmicks.</span></h1>
            <p className="text-[10px] text-white/40 mt-1">Sweepstakes social casino. No purchase necessary.</p>
          </div>
          <button className="px-5 py-2 rounded-xl text-xs font-bold text-black flex-shrink-0" style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}>Jump In</button>
        </div>
      </div>
    );
  }},

  { id: 8, name: 'Neon Dark', desc: 'Dark bg, electric neon accents', component: function H8() {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: 160, background: '#030809' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(45,201,122,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(132,204,22,0.08) 0%, transparent 50%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #2DC97A, #F0B232, transparent)' }} />
        <div className="relative z-10 p-6 h-full flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-bold" style={{ color: '#2DC97A' }}>LIVE · 2,847 ONLINE</span>
            </div>
            <h1 className="text-2xl font-black" style={{ color: '#F5E8C8', textShadow: '0 0 20px rgba(45,201,122,0.2)' }}>Play Smart.<br/><span style={{ color: '#2DC97A' }}>Win More.</span></h1>
            <div className="flex gap-2 mt-3">
              <button className="px-4 py-1.5 rounded text-[10px] font-bold text-black" style={{ background: '#2DC97A' }}>Casino</button>
              <button className="px-4 py-1.5 rounded text-[10px] font-bold" style={{ background: 'transparent', border: '1px solid rgba(45,201,122,0.4)', color: '#2DC97A' }}>Sportsbook</button>
            </div>
          </div>
        </div>
      </div>
    );
  }},

  { id: 9, name: 'Promo Banner', desc: 'Bold promotional style', component: function H9() {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: 160, background: 'linear-gradient(135deg, #0C1812 0%, #1A2E22 100%)', border: '1px solid rgba(240,178,50,0.2)' }}>
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #2DC97A, #F0B232, #84CC16)' }} />
        <div className="relative z-10 p-5 h-full flex items-center justify-between">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,178,50,0.15)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.3)' }}>New Player Offer</span>
            <h2 className="text-2xl font-black text-white mt-2">250,000 <span style={{ color: '#F0B232' }}>GC</span><br/><span className="text-lg">+ 5 SC Free</span></h2>
            <p className="text-[9px] text-white/40 mt-1">No purchase necessary · 18+</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl mb-2 flex items-center justify-center text-3xl" style={{ background: 'linear-gradient(135deg, rgba(240,178,50,0.15), rgba(240,178,50,0.05))', border: '1px solid rgba(240,178,50,0.2)' }}>🎁</div>
            <button className="px-4 py-1.5 rounded-lg text-[10px] font-bold text-black" style={{ background: 'linear-gradient(135deg, #F0B232, #FFD166)' }}>Claim Now</button>
          </div>
        </div>
      </div>
    );
  }},

  { id: 10, name: 'Video Game', desc: 'Gaming/esports style', component: function H10() {
    return (
      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: 160, background: 'linear-gradient(135deg, #0A0014, #14002A)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(132,204,22,0.15) 19px,rgba(132,204,22,0.15) 20px), repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(132,204,22,0.15) 19px,rgba(132,204,22,0.15) 20px)' }} />
        <div className="relative z-10 p-5 h-full flex items-center gap-5">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded mb-2" style={{ background: 'rgba(132,204,22,0.1)', border: '1px solid rgba(132,204,22,0.2)' }}>
              <Zap className="w-3 h-3" style={{ color: '#84CC16' }} />
              <span className="text-[9px] font-bold" style={{ color: '#84CC16' }}>YALA ORIGINALS</span>
            </div>
            <h1 className="text-xl font-black text-white">12 Exclusive<br/>Desert Games</h1>
            <p className="text-[10px] text-white/40 mt-1">Provably fair · Built in-house</p>
            <button className="mt-3 px-4 py-1.5 rounded text-[10px] font-bold" style={{ background: 'rgba(132,204,22,0.15)', border: '1px solid rgba(132,204,22,0.3)', color: '#84CC16' }}>Play Originals</button>
          </div>
        </div>
      </div>
    );
  }},
];

// ═══════════════════════════════════════════════════════════════════════════════
//  SPORTS CARD VARIANTS  (10 total)
// ═══════════════════════════════════════════════════════════════════════════════
const SC_VARIANTS: { id: number; name: string; desc: string; component: React.FC }[] = [
  { id: 1, name: 'Current Style', desc: 'Baseline odds row', component: function SC1() {
    return (
      <div className="w-full rounded-xl p-3 space-y-2" style={{ background: '#0C1812', border: '1px solid #1A2E22' }}>
        <div className="flex items-center justify-between">
          <span className="text-[10px]" style={{ color: '#8FA899' }}>{SPORT.league}</span>
          <span className="text-[10px] font-bold" style={{ color: '#EF4444' }}>{SPORT.time}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#1A2E22]"><Image src={SPORT.awayLogo} alt={SPORT.awayAbbr} width={28} height={28} unoptimized /></div>
            <span className="text-xs font-bold text-white">{SPORT.awayAbbr}</span>
            <span className="text-sm font-black text-white ml-auto">{SPORT.awayScore}</span>
          </div>
          <span className="text-[10px] text-white/20">vs</span>
          <div className="flex items-center gap-2 flex-1 flex-row-reverse">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#1A2E22]"><Image src={SPORT.homeLogo} alt={SPORT.homeAbbr} width={28} height={28} unoptimized /></div>
            <span className="text-xs font-bold text-white">{SPORT.homeAbbr}</span>
            <span className="text-sm font-black text-white mr-auto">{SPORT.homeScore}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[{l:'Spread',v:fmtOdds(SPORT.spreadOdds)},{l:'ML',v:fmtOdds(SPORT.mlHome)},{l:'O/U',v:fmtOdds(SPORT.overOdds)}].map(b=>(
            <button key={b.l} className="rounded-lg py-1.5 text-center text-xs font-bold" style={{ background: 'rgba(255,255,255,0.05)', color: '#F5E8C8' }}><span className="block text-[8px] text-white/40 font-normal">{b.l}</span>{b.v}</button>
          ))}
        </div>
      </div>
    );
  }},

  { id: 2, name: 'Feature Hero', desc: 'Big team logos, cinematic', component: function SC2() {
    return (
      <div className="w-full rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A0C10, #101820)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-3 py-1.5 flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /><span className="text-[9px] font-bold text-red-400">{SPORT.time}</span></div>
          <span className="text-[9px]" style={{ color: '#8FA899' }}>{SPORT.league}</span>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="text-center space-y-1">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-[#1A2E22] mx-auto"><Image src={SPORT.awayLogo} alt="" width={56} height={56} unoptimized /></div>
            <p className="text-xs font-bold text-white">{SPORT.awayAbbr}</p>
            <p className="text-2xl font-black text-white">{SPORT.awayScore}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-white/30">LIVE</p>
            <div className="text-xs font-bold text-white/50 my-1">VS</div>
          </div>
          <div className="text-center space-y-1">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-[#1A2E22] mx-auto"><Image src={SPORT.homeLogo} alt="" width={56} height={56} unoptimized /></div>
            <p className="text-xs font-bold text-white">{SPORT.homeAbbr}</p>
            <p className="text-2xl font-black text-white">{SPORT.homeScore}</p>
          </div>
        </div>
        <div className="px-3 pb-3 grid grid-cols-3 gap-1.5">
          {[{l:'Spread',v:fmtOdds(SPORT.spreadOdds)},{l:'ML',v:fmtOdds(SPORT.mlHome)},{l:'O/U',v:fmtOdds(SPORT.overOdds)}].map(b=>(
            <button key={b.l} className="rounded-lg py-2 text-center text-xs font-bold transition-all hover:opacity-80" style={{ background: 'rgba(45,201,122,0.1)', border: '1px solid rgba(45,201,122,0.2)', color: '#2DC97A' }}><span className="block text-[8px] text-white/30 font-normal mb-0.5">{b.l}</span>{b.v}</button>
          ))}
        </div>
      </div>
    );
  }},

  { id: 3, name: 'Compact Row', desc: 'DraftKings-style tight row', component: function SC3() {
    return (
      <div className="w-full rounded-xl" style={{ background: '#0C1812', border: '1px solid #1A2E22' }}>
        <div className="px-3 py-1 flex items-center gap-2 border-b" style={{ borderColor: '#1A2E22' }}>
          <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#8FA899' }}>{SPORT.league}</span>
          <span className="ml-auto text-[8px] font-bold text-red-400 flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />{SPORT.time}</span>
        </div>
        <div className="px-3 py-2 grid grid-cols-[1fr,auto,auto,auto] items-center gap-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-[#1A2E22] flex-shrink-0"><Image src={SPORT.awayLogo} alt="" width={20} height={20} unoptimized /></div>
              <span className="text-[11px] font-medium text-white">{SPORT.away.split(' ').slice(-1)[0]}</span>
              <span className="ml-auto text-[11px] font-black text-white">{SPORT.awayScore}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-[#1A2E22] flex-shrink-0"><Image src={SPORT.homeLogo} alt="" width={20} height={20} unoptimized /></div>
              <span className="text-[11px] font-medium text-white">{SPORT.home.split(' ').slice(-1)[0]}</span>
              <span className="ml-auto text-[11px] font-black text-white">{SPORT.homeScore}</span>
            </div>
          </div>
          {[{l:'SPR',v:fmtOdds(SPORT.spreadOdds)},{l:'ML',v:fmtOdds(SPORT.mlHome)},{l:'OU',v:fmtOdds(SPORT.overOdds)}].map(b=>(
            <div key={b.l} className="text-center rounded-lg px-2 py-1.5 w-12" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}>
              <p className="text-[8px] text-white/30">{b.l}</p>
              <p className="text-xs font-bold" style={{ color: '#F5E8C8' }}>{b.v}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }},

  { id: 4, name: 'Glass Dark', desc: 'Glass card, logo watermark', component: function SC4() {
    return (
      <div className="w-full rounded-2xl overflow-hidden relative" style={{ background: 'rgba(12,24,18,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none">
          <Image src={SPORT.homeLogo} alt="" width={80} height={80} unoptimized />
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#8FA899' }}>{SPORT.league}</span>
            <span className="text-[9px] font-bold text-red-400">{SPORT.time}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1A2E22]"><Image src={SPORT.awayLogo} alt="" width={32} height={32} unoptimized /></div>
              <span className="text-sm font-bold text-white">{SPORT.awayAbbr}</span>
            </div>
            <div className="text-center"><span className="text-xl font-black text-white">{SPORT.awayScore} – {SPORT.homeScore}</span></div>
            <div className="flex items-center gap-2 flex-row-reverse">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1A2E22]"><Image src={SPORT.homeLogo} alt="" width={32} height={32} unoptimized /></div>
              <span className="text-sm font-bold text-white">{SPORT.homeAbbr}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[{l:'Spread',v:fmtOdds(SPORT.spreadOdds)},{l:'Moneyline',v:fmtOdds(SPORT.mlHome)},{l:'Total',v:fmtOdds(SPORT.overOdds)}].map(b=>(
              <button key={b.l} className="rounded-lg py-2 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-[8px] text-white/30">{b.l}</p>
                <p className="text-xs font-bold text-white">{b.v}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }},

  { id: 5, name: 'Color Band', desc: 'Team color accent on left edge', component: function SC5() {
    return (
      <div className="w-full rounded-xl overflow-hidden flex" style={{ background: '#0C1812', border: '1px solid #1A2E22' }}>
        <div className="w-1 flex-shrink-0" style={{ background: 'linear-gradient(180deg, #EF4444, #DC2626)' }} />
        <div className="flex-1 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px]" style={{ color: '#8FA899' }}>{SPORT.league}</span>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /><span className="text-[9px] font-bold text-red-400">LIVE {SPORT.time}</span></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 flex-1">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-[#1A2E22]"><Image src={SPORT.awayLogo} alt="" width={24} height={24} unoptimized /></div>
              <span className="text-xs font-bold text-white">{SPORT.away.split(' ').slice(-1)}</span>
              <span className="ml-auto text-sm font-black text-white">{SPORT.awayScore}</span>
            </div>
            <span className="text-[10px] text-white/20">·</span>
            <div className="flex items-center gap-1.5 flex-1 flex-row-reverse">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-[#1A2E22]"><Image src={SPORT.homeLogo} alt="" width={24} height={24} unoptimized /></div>
              <span className="text-xs font-bold text-white">{SPORT.home.split(' ').slice(-1)}</span>
              <span className="mr-auto text-sm font-black text-white">{SPORT.homeScore}</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[fmtOdds(SPORT.spreadOdds), fmtOdds(SPORT.mlHome), fmtOdds(SPORT.overOdds)].map((v,i)=>(
              <button key={i} className="flex-1 py-1.5 rounded text-xs font-bold" style={{ background: 'rgba(255,255,255,0.05)', color: '#F5E8C8' }}>{v}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }},

  { id: 6, name: 'Wide Card', desc: 'Full-width game card, detailed', component: function SC6() {
    return (
      <div className="w-full rounded-xl p-3" style={{ background: '#0C1812', border: '1px solid #1A2E22' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1A2E22] p-1"><Image src={SPORT.awayLogo} alt="" width={40} height={40} unoptimized /></div>
            <div><p className="text-sm font-black text-white">{SPORT.awayAbbr}</p><p className="text-[9px]" style={{ color: '#8FA899' }}>{SPORT.away.split(' ').slice(-1)}</p></div>
          </div>
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-black text-white">{SPORT.awayScore}</span>
              <span className="text-sm text-white/20">—</span>
              <span className="text-2xl font-black text-white">{SPORT.homeScore}</span>
            </div>
            <div className="flex items-center justify-center gap-1 mt-0.5"><div className="w-1 h-1 rounded-full bg-red-400 animate-pulse" /><span className="text-[8px] text-red-400 font-bold">{SPORT.time}</span></div>
          </div>
          <div className="flex items-center gap-2 flex-row-reverse">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1A2E22] p-1"><Image src={SPORT.homeLogo} alt="" width={40} height={40} unoptimized /></div>
            <div className="text-right"><p className="text-sm font-black text-white">{SPORT.homeAbbr}</p><p className="text-[9px]" style={{ color: '#8FA899' }}>{SPORT.home.split(' ').slice(-1)}</p></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[{l:'Spread',top:SPORT.awayAbbr,v:fmtOdds(SPORT.spreadOdds)},{l:'Moneyline',top:SPORT.homeAbbr,v:fmtOdds(SPORT.mlHome)},{l:'Total',top:`O ${SPORT.total}`,v:fmtOdds(SPORT.overOdds)}].map(b=>(
            <button key={b.l} className="rounded-xl p-2 text-center transition-all hover:border-[rgba(45,201,122,0.4)]" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}>
              <p className="text-[8px] text-white/30 uppercase tracking-wide">{b.l}</p>
              <p className="text-[9px] text-white/50 mt-0.5">{b.top}</p>
              <p className="text-sm font-bold text-white mt-0.5">{b.v}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }},

  ...[7,8,9,10].map(id => ({
    id, name: `Variant ${id}`, desc: 'Coming soon',
    component: function SCN() {
      return <div className="w-full rounded-xl p-4 text-center text-xs" style={{ background: '#0C1812', border: '1px dashed #1A2E22', color: '#4A6A55' }}>Variant {id} — Coming Soon</div>;
    }
  })),
];

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function DesignLabPage() {
  const [activeSection, setActiveSection] = useState('gamecard');
  const [liked, setLiked] = useState<Record<string, number[]>>({});
  const [preview, setPreview] = useState<{ section: string; id: number } | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [selectedIcons, setSelectedIcons] = useState<YalaIconName[]>([]);
  const [copiedIcons, setCopiedIcons] = useState(false);

  const toggleIcon = (name: YalaIconName) => {
    setSelectedIcons(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };
  const copyIconNames = () => {
    const txt = selectedIcons.map(n => `<YalaIcon name="${n}" size={24} />`).join('\n');
    navigator.clipboard.writeText(txt).catch(() => {});
    setCopiedIcons(true);
    setTimeout(() => setCopiedIcons(false), 2000);
  };

  const toggleLike = (section: string, id: number) => {
    setLiked(prev => {
      const current = prev[section] || [];
      return {
        ...prev,
        [section]: current.includes(id) ? current.filter(x => x !== id) : [...current, id],
      };
    });
  };

  const isLiked = (id: number) => (liked[activeSection] || []).includes(id);

  const copyCode = (id: number) => {
    const msg = `Tell Claude: "Apply Design Lab ${activeSection} Variant #${id} to the production component."`;
    navigator.clipboard.writeText(msg).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const variants =
    activeSection === 'gamecard'  ? GC_VARIANTS :
    activeSection === 'hero'      ? HERO_VARIANTS :
    activeSection === 'sportscard'? SC_VARIANTS :
    activeSection === 'icons'     ? [] : GC_VARIANTS;

  const likedIds = liked[activeSection] || [];
  const likedVariants = variants.filter(v => likedIds.includes(v.id));

  // Columns by section
  const cols = activeSection === 'gamecard' ? 'grid-cols-4 xl:grid-cols-5' :
               activeSection === 'hero' ? 'grid-cols-2' :
               activeSection === 'sportscard' ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-4';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#060E0A', color: '#F5E8C8' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 px-6 py-3 flex items-center justify-between" style={{ backgroundColor: '#0C1812', borderBottom: '1px solid #1A2E22' }}>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-display text-lg font-black" style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Design Lab
            </h1>
            <p className="text-[10px] -mt-0.5" style={{ color: '#8FA899' }}>Pick your favorite — then tell Claude to apply it</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeSection === 'icons' && selectedIcons.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(45,201,122,0.1)', border: '1px solid rgba(45,201,122,0.2)' }}>
              <Check className="w-3.5 h-3.5" style={{ color: '#2DC97A' }} />
              <span className="text-xs font-bold" style={{ color: '#2DC97A' }}>{selectedIcons.length} selected</span>
            </div>
          )}
          {activeSection !== 'icons' && likedIds.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.2)' }}>
              <Heart className="w-3.5 h-3.5" style={{ color: '#F0B232' }} fill="#F0B232" />
              <span className="text-xs font-bold" style={{ color: '#F0B232' }}>{likedIds.length} liked</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Section tabs ────────────────────────────────────────── */}
      <div className="px-6 pt-4 pb-0 flex items-center gap-1" style={{ borderBottom: '1px solid #1A2E22' }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all relative"
            style={{ color: activeSection === s.id ? '#F0B232' : '#8FA899', borderBottom: activeSection === s.id ? '2px solid #F0B232' : '2px solid transparent' }}
          >
            <span>{s.emoji}</span> {s.label}
            <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#8FA899' }}>{s.count}</span>
          </button>
        ))}
      </div>

      {/* ── How to use ──────────────────────────────────────────── */}
      <div className="mx-6 mt-4 mb-0 px-4 py-2.5 rounded-xl flex items-center gap-3" style={{ background: 'rgba(45,201,122,0.06)', border: '1px solid rgba(45,201,122,0.15)' }}>
        <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: '#2DC97A' }} />
        {activeSection === 'icons' ? (
          <p className="text-xs" style={{ color: '#8FA899' }}>
            <span style={{ color: '#F5E8C8' }}>Icon picker:</span> Click to select icons. Where a Lucide equivalent exists it&apos;s shown for comparison. Copy the JSX snippets and tell Claude which swaps to make.
          </p>
        ) : (
          <p className="text-xs" style={{ color: '#8FA899' }}>
            <span style={{ color: '#F5E8C8' }}>How to use:</span> Click ❤️ to like variants you love. Click 📋 to copy the apply command, then paste it in Claude to ship it.
          </p>
        )}
      </div>

      {/* ── Icon picker ─────────────────────────────────────────── */}
      {activeSection === 'icons' && (
        <div className="p-6 space-y-8">
          {ICON_CATEGORIES.map(cat => (
            <div key={cat.id}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: '#F5E8C8' }}>{cat.label}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(240,178,50,0.1)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.2)' }}>{cat.icons.length}</span>
                <div className="flex-1 h-px" style={{ background: '#1A2E22' }} />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8 gap-3">
                {cat.icons.map(icon => {
                  const sel = selectedIcons.includes(icon.name);
                  const LIcon = icon.lucide;
                  return (
                    <button
                      key={icon.name}
                      onClick={() => toggleIcon(icon.name)}
                      className="group flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                      style={{
                        background: sel ? 'rgba(240,178,50,0.08)' : '#0C1812',
                        border: `1px solid ${sel ? 'rgba(240,178,50,0.5)' : '#1A2E22'}`,
                        boxShadow: sel ? '0 0 12px rgba(240,178,50,0.12)' : 'none',
                      }}
                    >
                      {/* Yala icon */}
                      <div className="relative">
                        <YalaIcon name={icon.name} size={52} />
                        {/* Selected check */}
                        {sel && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: '#F0B232' }}>
                            <Check className="w-2.5 h-2.5 text-black" />
                          </div>
                        )}
                      </div>

                      {/* Lucide comparison */}
                      {LIcon ? (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg w-full justify-center"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <LIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#8FA899' }} />
                          <span className="text-[8px] font-mono leading-none" style={{ color: '#8FA899' }}>{icon.lucideName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg w-full justify-center"
                          style={{ background: 'rgba(45,201,122,0.05)', border: '1px solid rgba(45,201,122,0.1)' }}>
                          <span className="text-[8px] font-bold" style={{ color: '#2DC97A' }}>Brand Only</span>
                        </div>
                      )}

                      {/* Name */}
                      <div className="w-full text-center">
                        <p className="text-[10px] font-semibold leading-tight" style={{ color: sel ? '#F0B232' : '#F5E8C8' }}>{icon.label}</p>
                        <p className="text-[8px] font-mono mt-0.5 truncate w-full" style={{ color: '#4A6A55' }}>{icon.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Variant grid ────────────────────────────────────────── */}
      {activeSection !== 'icons' && <div className={`grid ${cols} gap-4 p-6`}>
        {variants.map(({ id, name, desc, component: VariantComponent }) => {
          const liked_ = isLiked(id);
          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: id * 0.02 }}
              className="group relative flex flex-col"
            >
              {/* Liked ring */}
              {liked_ && (
                <div className="absolute -inset-1.5 rounded-2xl pointer-events-none z-10" style={{ border: '2px solid #F0B232', boxShadow: '0 0 16px rgba(240,178,50,0.2)' }} />
              )}

              {/* Variant number pill */}
              <div className="absolute top-2 right-2 z-20 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: '#060E0A', border: '1px solid #1A2E22', color: '#8FA899' }}>
                {id}
              </div>

              {/* Preview */}
              <div className="rounded-xl overflow-hidden" style={{ background: '#060E0A', padding: activeSection === 'gamecard' ? 0 : '10px' }}>
                <VariantComponent />
              </div>

              {/* Info row */}
              <div className="mt-2 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{name}</p>
                  <p className="text-[9px] truncate" style={{ color: '#4A6A55' }}>{desc}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Eye / preview */}
                  <button
                    onClick={() => setPreview({ section: activeSection, id })}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                  >
                    <Eye className="w-3.5 h-3.5" style={{ color: '#8FA899' }} />
                  </button>
                  {/* Copy command */}
                  <button
                    onClick={() => copyCode(id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                  >
                    {copied === id
                      ? <Check className="w-3.5 h-3.5" style={{ color: '#2DC97A' }} />
                      : <Copy className="w-3.5 h-3.5" style={{ color: '#8FA899' }} />}
                  </button>
                  {/* Like */}
                  <button
                    onClick={() => toggleLike(activeSection, id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: liked_ ? 'rgba(240,178,50,0.12)' : 'transparent' }}
                  >
                    <Heart className="w-3.5 h-3.5" style={{ color: liked_ ? '#F0B232' : '#8FA899' }} fill={liked_ ? '#F0B232' : 'none'} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>}

      {/* ── Icon selection bottom bar ────────────────────────────── */}
      <AnimatePresence>
        {activeSection === 'icons' && selectedIcons.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-6 py-4"
            style={{ background: 'linear-gradient(0deg, #060E0A 0%, rgba(6,14,10,0.95) 100%)', borderTop: '1px solid #1A2E22', backdropFilter: 'blur(16px)' }}
          >
            <div className="max-w-screen-xl mx-auto flex items-center gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Check className="w-4 h-4" style={{ color: '#2DC97A' }} />
                <span className="text-xs font-bold" style={{ color: '#2DC97A' }}>{selectedIcons.length} selected</span>
              </div>
              <div className="flex gap-2 flex-1 flex-wrap overflow-hidden" style={{ maxHeight: 48 }}>
                {selectedIcons.map(name => (
                  <div key={name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: 'rgba(45,201,122,0.1)', border: '1px solid rgba(45,201,122,0.25)' }}>
                    <YalaIcon name={name} size={14} />
                    <span className="text-[9px] font-mono" style={{ color: '#2DC97A' }}>{name}</span>
                    <button onClick={() => toggleIcon(name)}>
                      <X className="w-2.5 h-2.5" style={{ color: '#4A6A55' }} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setSelectedIcons([])}
                  className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #1A2E22', color: '#8FA899' }}
                >
                  Clear
                </button>
                <button
                  onClick={copyIconNames}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black flex-shrink-0 transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
                >
                  {copiedIcons ? <><Check className="w-3.5 h-3.5" /> Copied JSX!</> : <><Copy className="w-3.5 h-3.5" /> Copy JSX Snippets</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Liked summary panel ─────────────────────────────────── */}
      <AnimatePresence>
        {activeSection !== 'icons' && likedVariants.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-6 py-4"
            style={{ background: 'linear-gradient(0deg, #060E0A 0%, rgba(6,14,10,0.95) 100%)', borderTop: '1px solid #1A2E22', backdropFilter: 'blur(16px)' }}
          >
            <div className="max-w-screen-xl mx-auto flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" style={{ color: '#F0B232' }} fill="#F0B232" />
                <span className="text-xs font-bold" style={{ color: '#F0B232' }}>{likedVariants.length} liked</span>
              </div>
              <div className="flex gap-2 flex-1 flex-wrap">
                {likedVariants.map(v => (
                  <div key={v.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.2)' }}>
                    <span className="text-[10px] font-bold" style={{ color: '#F0B232' }}>#{v.id}</span>
                    <span className="text-[10px] text-white/70">{v.name}</span>
                    <button onClick={() => toggleLike(activeSection, v.id)}>
                      <X className="w-3 h-3 text-white/40 hover:text-white/70" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const msg = `Apply Design Lab variants to production:\n${likedVariants.map(v => `• ${activeSection} → Variant #${v.id} "${v.name}"`).join('\n')}`;
                  navigator.clipboard.writeText(msg).catch(() => {});
                  setCopied(-1);
                  setTimeout(() => setCopied(null), 2000);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black flex-shrink-0 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
              >
                {copied === -1 ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Apply Command</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full Preview Modal ───────────────────────────────────── */}
      <AnimatePresence>
        {preview && (() => {
          const v = variants.find(x => x.id === preview.id);
          if (!v) return null;
          const VC = v.component;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 flex items-center justify-center p-8"
              style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
              onClick={() => setPreview(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={e => e.stopPropagation()}
                className="rounded-2xl overflow-hidden max-w-md w-full"
                style={{ background: '#101C16', border: '1px solid #1A2E22', padding: 24 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-white">Variant #{v.id} — {v.name}</p>
                    <p className="text-xs" style={{ color: '#8FA899' }}>{v.desc}</p>
                  </div>
                  <button onClick={() => setPreview(null)} className="p-2 rounded-lg hover:bg-white/10"><X className="w-4 h-4" style={{ color: '#8FA899' }} /></button>
                </div>
                <div style={{ maxWidth: activeSection === 'gamecard' ? 280 : '100%', margin: '0 auto' }}>
                  <VC />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => { toggleLike(activeSection, v.id); }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    style={{ background: isLiked(v.id) ? 'rgba(240,178,50,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isLiked(v.id) ? 'rgba(240,178,50,0.3)' : '#1A2E22'}`, color: isLiked(v.id) ? '#F0B232' : '#8FA899' }}
                  >
                    <Heart className="w-3.5 h-3.5" fill={isLiked(v.id) ? '#F0B232' : 'none'} />
                    {isLiked(v.id) ? 'Liked' : 'Like This'}
                  </button>
                  <button
                    onClick={() => copyCode(v.id)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-black"
                    style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
                  >
                    {copied === v.id ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Apply Command</>}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
