'use client';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { useSportsbookStore, type PlacedBet } from '@/lib/store/sportsbook';
import { formatGC, formatSC } from '@/lib/utils';
import { toast } from 'sonner';
import { BetConfirmModal, type BetConfirmSummary, type BetConfirmLeg } from '@/components/sportsbook/BetConfirmModal';
import {
  SPORTSBOOK_GAMES,
  PLAYER_PROPS,
  CREATOR_PARLAYS,
  SPORT_TABS,
  type SportKey,
  type SBGame,
  type PlayerProp,
  type CreatorParlay,
} from '@/lib/mock-data/sportsbook';
import { X, Trash2, ChevronDown, Info, TrendingUp, TrendingDown, Trophy, Zap, Copy, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────
type MarketKey = 'spread' | 'moneyline' | 'total' | 'prop';
type ContentTab = 'all' | 'live' | 'upcoming' | 'props' | 'creators';

interface BetSelection {
  id: string; // gameId-market-side or propId-over/under
  gameId: number;
  market: MarketKey;
  side: 'home' | 'away' | 'over' | 'under';
  label: string;
  odds: number;
  gameLabel: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtOdds(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

function impliedProb(odds: number) {
  if (odds < 0) return Math.round((-odds / (-odds + 100)) * 100);
  return Math.round((100 / (odds + 100)) * 100);
}

function calcPayout(stake: number, odds: number) {
  if (odds > 0) return +(stake * (odds / 100)).toFixed(0);
  return +(stake * (100 / -odds)).toFixed(0);
}

function calcParlayDecimal(selections: { odds: number }[]) {
  return selections.reduce((acc, s) => {
    const d = s.odds > 0 ? 1 + s.odds / 100 : 1 + 100 / -s.odds;
    return acc * d;
  }, 1);
}

function calcParlay(selections: { odds: number }[], stake: number) {
  return +((calcParlayDecimal(selections) - 1) * stake).toFixed(0);
}

function getInitials(name: string) {
  return name.split(/\s+/).map((w) => w[0]?.toUpperCase()).slice(0, 2).join('');
}

// ── TeamLogo ──────────────────────────────────────────────────────────────
function TeamLogo({
  logo,
  abbr,
  size = 28,
  sport,
  isHome,
}: {
  logo?: string;
  abbr: string;
  size?: number;
  sport: SBGame['sport'];
  isHome: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const color = isHome ? '#F0B232' : '#2DC97A';
  const bg = isHome ? 'rgba(240,178,50,0.1)' : 'rgba(45,201,122,0.1)';
  const border = isHome ? '1px solid rgba(240,178,50,0.2)' : '1px solid rgba(45,201,122,0.2)';

  // Soccer uses flag emojis, Tennis/MMA use initials
  if (sport === 'Soccer' && logo && logo.length <= 8) {
    return (
      <div
        className="flex items-center justify-center flex-shrink-0 rounded-lg text-base"
        style={{ width: size, height: size, background: bg, border, fontSize: size * 0.55 }}
      >
        {logo}
      </div>
    );
  }

  if (logo && !imgError && sport !== 'Tennis' && sport !== 'MMA' && sport !== 'Esports') {
    return (
      <div className="flex-shrink-0 relative" style={{ width: size, height: size }}>
        <Image
          src={logo}
          alt={abbr}
          width={size}
          height={size}
          className="object-contain rounded-lg"
          style={{ background: bg, border }}
          onError={() => setImgError(true)}
          unoptimized
        />
      </div>
    );
  }

  // Initials fallback for Tennis, MMA, Esports, or on error
  return (
    <div
      className="flex items-center justify-center flex-shrink-0 rounded-lg font-black"
      style={{ width: size, height: size, background: bg, border, color, fontSize: size * 0.36 }}
    >
      {abbr.slice(0, 2)}
    </div>
  );
}

// ── OddsButton ────────────────────────────────────────────────────────────
function OddsButton({
  odds,
  label,
  sublabel,
  active,
  onClick,
  movement,
  bestOdds,
}: {
  odds: number;
  label: string;
  sublabel?: string;
  active: boolean;
  onClick: () => void;
  movement?: 'up' | 'down';
  bestOdds?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-lg border transition-all text-center min-w-[72px] flex-1 relative',
        active
          ? 'border-[#F0B232] bg-[rgba(240,178,50,0.12)]'
          : 'border-[#1A2238] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(45,201,122,0.4)] hover:bg-[rgba(45,201,122,0.06)]'
      )}
    >
      {bestOdds && !active && (
        <span
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase tracking-wide px-1 py-0.5 rounded-full"
          style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814', whiteSpace: 'nowrap' }}
        >
          Best
        </span>
      )}
      {sublabel && (
        <span className="text-[9px] font-medium" style={{ color: '#8FA3B8' }}>{sublabel}</span>
      )}
      <div className="flex items-center gap-0.5">
        <span
          className="text-sm font-bold number-display leading-none"
          style={{ color: active ? '#F0B232' : odds > 0 ? '#2DC97A' : '#F5E8C8' }}
        >
          {fmtOdds(odds)}
        </span>
        {movement === 'up' && <TrendingUp className="w-2.5 h-2.5 text-red-400" />}
        {movement === 'down' && <TrendingDown className="w-2.5 h-2.5 text-emerald-400" />}
      </div>
      <span className="text-[9px]" style={{ color: '#8FA3B8' }}>{label}</span>
    </button>
  );
}

// ── LiveBadge ─────────────────────────────────────────────────────────────
function LiveBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="live-dot" style={{ background: '#EF4444' }} />
      <span className="text-[10px] font-bold uppercase tracking-wide text-red-400">{label}</span>
    </div>
  );
}

// ── ScoreDisplay ──────────────────────────────────────────────────────────
function ScoreDisplay({ home, away, homeAbbr, awayAbbr }: { home?: number; away?: number; homeAbbr: string; awayAbbr: string }) {
  const prevHome = useRef(home);
  const prevAway = useRef(away);
  const [homePulse, setHomePulse] = useState(false);
  const [awayPulse, setAwayPulse] = useState(false);

  useEffect(() => {
    if (home !== prevHome.current) {
      setHomePulse(true);
      setTimeout(() => setHomePulse(false), 600);
      prevHome.current = home;
    }
  }, [home]);

  useEffect(() => {
    if (away !== prevAway.current) {
      setAwayPulse(true);
      setTimeout(() => setAwayPulse(false), 600);
      prevAway.current = away;
    }
  }, [away]);

  return (
    <div className="flex items-center gap-2 text-xs font-bold number-display">
      <motion.span
        animate={homePulse ? { scale: [1, 1.4, 1], color: ['#F5E8C8', '#2DC97A', '#F5E8C8'] } : {}}
        transition={{ duration: 0.5 }}
        style={{ color: '#F5E8C8' }}
      >
        {homeAbbr} {home}
      </motion.span>
      <span style={{ color: '#4A5878' }}>–</span>
      <motion.span
        animate={awayPulse ? { scale: [1, 1.4, 1], color: ['#F5E8C8', '#2DC97A', '#F5E8C8'] } : {}}
        transition={{ duration: 0.5 }}
        style={{ color: '#F5E8C8' }}
      >
        {away} {awayAbbr}
      </motion.span>
    </div>
  );
}

// ── FeaturedHeroCard ──────────────────────────────────────────────────────
function FeaturedHeroCard({ game, selections, onSelect }: { game: SBGame; selections: BetSelection[]; onSelect: (sel: BetSelection) => void }) {
  const isSelected = (market: MarketKey, side: string) =>
    selections.some((s) => s.gameId === game.id && s.market === market && s.side === side);

  const pick = (market: MarketKey, side: 'home' | 'away' | 'over' | 'under', label: string, odds: number) => {
    onSelect({ id: `${game.id}-${market}-${side}`, gameId: game.id, market, side, label, odds, gameLabel: `${game.awayAbbr} @ ${game.homeAbbr}` });
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-4"
      style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(45,201,122,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(240,178,50,0.1) 0%, transparent 55%), #0A101C',
        border: '1px solid rgba(45,201,122,0.25)',
        boxShadow: '0 0 40px rgba(45,201,122,0.06)',
      }}
    >
      {/* Live indicator strip */}
      {game.isLive && (
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #EF4444, transparent)' }} />
      )}

      <div className="px-5 py-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {game.isLive ? (
              <LiveBadge label={game.liveLabel || 'LIVE'} />
            ) : (
              <span className="text-[10px] font-medium" style={{ color: '#8FA3B8' }}>{game.time}</span>
            )}
            <span style={{ color: '#4A5878' }}>·</span>
            <span className="text-[10px] font-semibold" style={{ color: '#4A5878' }}>{game.league}</span>
          </div>
          <div className="flex items-center gap-2">
            {game.hasBestOdds && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }}>
                Best Odds
              </span>
            )}
            {game.betCount && (
              <span className="text-[10px]" style={{ color: '#8FA3B8' }}>
                🔥 {game.betCount.toLocaleString()} bets
              </span>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-center gap-6 mb-4">
          {/* Away */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamLogo logo={game.awayLogo} abbr={game.awayAbbr} size={52} sport={game.sport} isHome={false} />
            <span className="text-sm font-bold text-center" style={{ color: '#F5E8C8' }}>{game.away}</span>
            {game.isLive && (
              <motion.span
                className="text-3xl font-black number-display"
                style={{ color: '#F5E8C8' }}
                key={game.awayScore}
                initial={{ scale: 1.2, color: '#2DC97A' }}
                animate={{ scale: 1, color: '#F5E8C8' }}
                transition={{ duration: 0.4 }}
              >
                {game.awayScore}
              </motion.span>
            )}
          </div>

          {/* VS */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold" style={{ color: '#4A5878' }}>VS</span>
            {game.isLive && <span className="live-dot" style={{ background: '#EF4444', width: 8, height: 8 }} />}
          </div>

          {/* Home */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamLogo logo={game.homeLogo} abbr={game.homeAbbr} size={52} sport={game.sport} isHome={true} />
            <span className="text-sm font-bold text-center" style={{ color: '#F5E8C8' }}>{game.home}</span>
            {game.isLive && (
              <motion.span
                className="text-3xl font-black number-display"
                style={{ color: '#F5E8C8' }}
                key={game.homeScore}
                initial={{ scale: 1.2, color: '#2DC97A' }}
                animate={{ scale: 1, color: '#F5E8C8' }}
                transition={{ duration: 0.4 }}
              >
                {game.homeScore}
              </motion.span>
            )}
          </div>
        </div>

        {/* Quick bet buttons */}
        <div className="flex gap-2">
          <OddsButton
            odds={game.moneyline.away}
            label={`${game.awayAbbr} ML`}
            sublabel="Away"
            active={isSelected('moneyline', 'away')}
            onClick={() => pick('moneyline', 'away', `${game.awayAbbr} ML`, game.moneyline.away)}
            movement={game.oddsMovement?.mlAway}
            bestOdds={game.hasBestOdds}
          />
          <OddsButton
            odds={game.total.overOdds}
            label={`O ${game.total.line}`}
            sublabel="Over"
            active={isSelected('total', 'over')}
            onClick={() => pick('total', 'over', `O ${game.total.line}`, game.total.overOdds)}
            movement={game.oddsMovement?.totalOver}
          />
          <OddsButton
            odds={game.moneyline.home}
            label={`${game.homeAbbr} ML`}
            sublabel="Home"
            active={isSelected('moneyline', 'home')}
            onClick={() => pick('moneyline', 'home', `${game.homeAbbr} ML`, game.moneyline.home)}
            movement={game.oddsMovement?.mlHome}
          />
        </div>
      </div>
    </div>
  );
}

// ── GameCard ──────────────────────────────────────────────────────────────
function GameCard({ game, selections, onSelect }: { game: SBGame; selections: BetSelection[]; onSelect: (sel: BetSelection) => void }) {
  const isSelected = (market: MarketKey, side: string) =>
    selections.some((s) => s.gameId === game.id && s.market === market && s.side === side);

  const pick = (market: MarketKey, side: 'home' | 'away' | 'over' | 'under', label: string, odds: number) => {
    onSelect({ id: `${game.id}-${market}-${side}`, gameId: game.id, market, side, label, odds, gameLabel: `${game.awayAbbr} @ ${game.homeAbbr}` });
  };

  const spreadSign = game.spread.line > 0 ? `+${game.spread.line}` : `${game.spread.line}`;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#101C28', border: '1px solid #1A2238' }}
    >
      {/* Game header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid #1A2238', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-2">
          {game.isLive ? <LiveBadge label={game.liveLabel || 'LIVE'} /> : (
            <span className="text-[10px] font-medium" style={{ color: '#8FA3B8' }}>{game.time}</span>
          )}
          <span style={{ color: '#4A5878' }}>·</span>
          <span className="text-[10px]" style={{ color: '#4A5878' }}>{game.league}</span>
        </div>
        <div className="flex items-center gap-2">
          {game.hasBestOdds && (
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider" style={{ background: 'rgba(45,201,122,0.15)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.25)' }}>
              Best Odds
            </span>
          )}
          {game.betCount && (
            <span className="text-[9px]" style={{ color: '#8FA3B8' }}>🔥 {game.betCount >= 1000 ? `${(game.betCount / 1000).toFixed(1)}K` : game.betCount}</span>
          )}
          {game.isLive && (
            <ScoreDisplay home={game.homeScore} away={game.awayScore} homeAbbr={game.homeAbbr} awayAbbr={game.awayAbbr} />
          )}
        </div>
      </div>

      {/* Matchup + markets */}
      <div className="px-4 py-3">
        <div className="space-y-2.5">
          {/* Away team */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <TeamLogo logo={game.awayLogo} abbr={game.awayAbbr} size={28} sport={game.sport} isHome={false} />
              <span className="text-sm font-semibold truncate" style={{ color: '#F5E8C8' }}>{game.away}</span>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <OddsButton
                odds={game.spread.awayOdds}
                label={`${game.spread.line > 0 ? '-' : '+'}${Math.abs(game.spread.line)}`}
                sublabel="Spread"
                active={isSelected('spread', 'away')}
                onClick={() => pick('spread', 'away', `${game.awayAbbr} ${game.spread.line > 0 ? '-' : '+'}${Math.abs(game.spread.line)}`, game.spread.awayOdds)}
                movement={game.oddsMovement?.spreadAway}
              />
              <OddsButton
                odds={game.moneyline.away}
                label="ML"
                active={isSelected('moneyline', 'away')}
                onClick={() => pick('moneyline', 'away', `${game.awayAbbr} ML`, game.moneyline.away)}
                movement={game.oddsMovement?.mlAway}
                bestOdds={game.hasBestOdds && game.moneyline.away > 0}
              />
              <OddsButton
                odds={game.total.overOdds}
                label={`O ${game.total.line}`}
                sublabel="Over"
                active={isSelected('total', 'over')}
                onClick={() => pick('total', 'over', `O ${game.total.line}`, game.total.overOdds)}
                movement={game.oddsMovement?.totalOver}
              />
            </div>
          </div>

          {/* Home team */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <TeamLogo logo={game.homeLogo} abbr={game.homeAbbr} size={28} sport={game.sport} isHome={true} />
              <span className="text-sm font-semibold truncate" style={{ color: '#F5E8C8' }}>{game.home}</span>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <OddsButton
                odds={game.spread.homeOdds}
                label={spreadSign}
                sublabel="Spread"
                active={isSelected('spread', 'home')}
                onClick={() => pick('spread', 'home', `${game.homeAbbr} ${spreadSign}`, game.spread.homeOdds)}
                movement={game.oddsMovement?.spreadHome}
              />
              <OddsButton
                odds={game.moneyline.home}
                label="ML"
                active={isSelected('moneyline', 'home')}
                onClick={() => pick('moneyline', 'home', `${game.homeAbbr} ML`, game.moneyline.home)}
                movement={game.oddsMovement?.mlHome}
                bestOdds={game.hasBestOdds && game.moneyline.home > 0}
              />
              <OddsButton
                odds={game.total.underOdds}
                label={`U ${game.total.line}`}
                sublabel="Under"
                active={isSelected('total', 'under')}
                onClick={() => pick('total', 'under', `U ${game.total.line}`, game.total.underOdds)}
                movement={game.oddsMovement?.totalUnder}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PropCard ──────────────────────────────────────────────────────────────
function PropCard({ prop, selections, onSelect }: { prop: PlayerProp; selections: BetSelection[]; onSelect: (sel: BetSelection) => void }) {
  const overId = `prop-${prop.id}-over`;
  const underId = `prop-${prop.id}-under`;
  const overSelected = selections.some((s) => s.id === overId);
  const underSelected = selections.some((s) => s.id === underId);

  const pickOver = () => onSelect({ id: overId, gameId: prop.id, market: 'prop', side: 'over', label: `${prop.player} O${prop.line} ${prop.stat}`, odds: prop.overOdds, gameLabel: `${prop.team}` });
  const pickUnder = () => onSelect({ id: underId, gameId: prop.id, market: 'prop', side: 'under', label: `${prop.player} U${prop.line} ${prop.stat}`, odds: prop.underOdds, gameLabel: `${prop.team}` });

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#101C28', border: '1px solid #1A2238' }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Player info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Avatar circle */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }}
            >
              {getInitials(prop.player)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold truncate" style={{ color: '#F5E8C8' }}>{prop.player}</p>
                {prop.isFeatured && (
                  <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0" style={{ background: 'rgba(240,178,50,0.15)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.2)' }}>
                    Featured
                  </span>
                )}
              </div>
              <p className="text-[11px]" style={{ color: '#8FA3B8' }}>{prop.team} · {prop.league}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs font-semibold" style={{ color: '#2DC97A' }}>
                  {prop.stat} {prop.line}
                </p>
                {prop.betCount && (
                  <span className="text-[9px]" style={{ color: '#8FA3B8' }}>🔥 {prop.betCount.toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>

          {/* Over / Under buttons */}
          <div className="flex gap-1.5 flex-shrink-0">
            <OddsButton
              odds={prop.overOdds}
              label="Over"
              active={overSelected}
              onClick={pickOver}
            />
            <OddsButton
              odds={prop.underOdds}
              label="Under"
              active={underSelected}
              onClick={pickUnder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CreatorParlayCard ─────────────────────────────────────────────────────
function CreatorParlayCard({ parlay, onCopySlip }: { parlay: CreatorParlay; onCopySlip: (parlay: CreatorParlay) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopySlip(parlay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badgeColor = parlay.badge === 'Hot Streak' ? { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }
    : parlay.badge === 'Trending' ? { bg: 'rgba(45,201,122,0.12)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.2)' }
    : parlay.badge === 'Verified' ? { bg: 'rgba(59,130,246,0.12)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }
    : parlay.badge === 'High Risk' ? { bg: 'rgba(249,115,22,0.12)', color: '#FB923C', border: '1px solid rgba(249,115,22,0.2)' }
    : null;

  const isBigParlay = parlay.totalOdds >= 500;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#101C28', border: '1px solid #1A2238' }}
    >
      {/* Creator header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid #1A2238', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: parlay.creatorAvatarColor, color: '#040814' }}
          >
            {parlay.creatorAvatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold" style={{ color: '#F5E8C8' }}>{parlay.creatorName}</p>
              {parlay.badge && badgeColor && (
                <span
                  className="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: badgeColor.bg, color: badgeColor.color, border: badgeColor.border }}
                >
                  {parlay.badge}
                </span>
              )}
            </div>
            <p className="text-[10px]" style={{ color: '#8FA3B8' }}>{parlay.creatorHandle} · {parlay.record}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide" style={{ color: '#8FA3B8' }}>Total Odds</p>
          <p className="text-lg font-black number-display" style={{ color: '#F0B232' }}>
            {isBigParlay && '🏆 '}{fmtOdds(parlay.totalOdds)}
          </p>
        </div>
      </div>

      {/* Parlay title + legs */}
      <div className="px-4 py-3">
        <p className="text-xs font-bold mb-2.5" style={{ color: '#8FA3B8' }}>
          {parlay.legs.length}-Leg Parlay — &ldquo;{parlay.title}&rdquo;
        </p>
        <div className="space-y-1.5 mb-3">
          {parlay.legs.map((leg, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                  style={{ background: 'rgba(45,201,122,0.15)', color: '#2DC97A' }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#F5E8C8' }}>{leg.label}</p>
                  <p className="text-[10px]" style={{ color: '#8FA3B8' }}>{leg.game}</p>
                </div>
              </div>
              <span
                className="text-xs font-bold number-display"
                style={{ color: leg.odds > 0 ? '#2DC97A' : '#F5E8C8' }}
              >
                {fmtOdds(leg.odds)}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
          style={copied
            ? { background: 'rgba(45,201,122,0.15)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.3)' }
            : { background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }
          }
        >
          {copied ? <><CheckCheck className="w-4 h-4" /> Added to Slip!</> : <><Copy className="w-4 h-4" /> Copy Slip</>}
        </button>
      </div>
    </div>
  );
}

// ── BetSlip ───────────────────────────────────────────────────────────────
function BetSlip({
  selections,
  betMode,
  setBetMode,
  stakeInputs,
  setStakeInputs,
  parlayStake,
  setParlayStake,
  onRemove,
  onClear,
  onPlaceBet,
  betPlaced,
  activeCurrency,
  balance,
  balanceLabel,
  recentBets,
  onCashOut,
}: {
  selections: BetSelection[];
  betMode: 'single' | 'parlay';
  setBetMode: (m: 'single' | 'parlay') => void;
  stakeInputs: Record<string, string>;
  setStakeInputs: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  parlayStake: string;
  setParlayStake: (v: string) => void;
  onRemove: (idx: number) => void;
  onClear: () => void;
  onPlaceBet: () => void;
  betPlaced: boolean;
  activeCurrency: string;
  balance: number;
  balanceLabel?: string;
  recentBets?: PlacedBet[];
  onCashOut?: (bet: PlacedBet) => void;
}) {
  const parlayDec = calcParlayDecimal(selections);
  const parlayOddsAmerican = selections.length > 1 ? Math.round((parlayDec - 1) * 100) : null;
  const parlayOddsDisplay = parlayOddsAmerican !== null ? fmtOdds(parlayOddsAmerican) : null;
  const parlayPayout = calcParlay(selections, Number(parlayStake) || 0);
  const isBigParlay = (parlayOddsAmerican ?? 0) >= 500;

  const quickBets = [100, 500, 1000, 5000];

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#101C28', border: '1px solid #1A2238' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid #1A2238', background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Bet Slip</span>
          {selections.length > 0 && (
            <span
              className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }}
            >
              {selections.length}
            </span>
          )}
        </div>
        {selections.length > 0 && (
          <button onClick={onClear} className="p-1 rounded hover:bg-white/5 transition-colors">
            <Trash2 className="w-3.5 h-3.5" style={{ color: '#8FA3B8' }} />
          </button>
        )}
      </div>

      {/* Mode toggle */}
      {selections.length > 1 && !betPlaced && (
        <div className="flex mx-3 mt-3 rounded-lg overflow-hidden" style={{ background: '#0A101C', border: '1px solid #1A2238' }}>
          {(['single', 'parlay'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setBetMode(mode)}
              className="flex-1 py-2 text-xs font-semibold capitalize transition-all"
              style={betMode === mode
                ? { background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }
                : { color: '#8FA3B8' }
              }
            >
              {mode === 'parlay' ? `Parlay (${selections.length})` : 'Singles'}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {betPlaced ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-8 text-center"
          >
            <div
              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3"
              style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
            >
              <span className="text-2xl">✓</span>
            </div>
            <p className="font-bold text-sm mb-1" style={{ color: '#F5E8C8' }}>Bets Placed!</p>
            <p className="text-xs" style={{ color: '#8FA3B8' }}>Good luck! Bets are demo only.</p>
          </motion.div>
        ) : selections.length === 0 ? (
          <div>
            <div className="py-8 px-4 text-center">
              <span className="text-3xl block mb-2">🎯</span>
              <p className="text-sm font-medium mb-1" style={{ color: '#F5E8C8' }}>No selections yet</p>
              <p className="text-xs" style={{ color: '#8FA3B8' }}>Click any odds to add to your slip</p>
            </div>
            {recentBets && recentBets.length > 0 && (
              <div className="px-3 pb-3" style={{ borderTop: '1px solid #1A2238' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest pt-3 pb-2" style={{ color: '#4A5878' }}>
                  Your recent bets
                </p>
                <div className="space-y-1.5">
                  {recentBets.slice(0, 5).map((b) => {
                    const color =
                      b.status === 'won'  ? '#2DC97A' :
                      b.status === 'lost' ? '#EF4444' :
                      b.status === 'void' ? '#8FA3B8' :
                                            '#F0B232';
                    const label =
                      b.status === 'won'  ? 'Won' :
                      b.status === 'lost' ? 'Lost' :
                      b.status === 'void' ? 'Void' :
                                            'Open';
                    return (
                      <div
                        key={b.id}
                        className="rounded-lg px-2.5 py-2"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1A2238' }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <p className="text-[11px] font-bold leading-snug truncate" style={{ color: '#F5E8C8' }}>
                            {b.summary}
                          </p>
                          <span
                            className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: `${color}1A`, color, border: `1px solid ${color}33` }}
                          >
                            {label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono" style={{ color: '#8FA3B8' }}>
                          <span>
                            {b.mode === 'parlay' ? `${b.legs}-leg parlay` : 'Single'} · {b.stake.toFixed(2)} {b.currency}
                          </span>
                          <span style={{ color }}>
                            {b.status === 'won'
                              ? `+${b.potentialPayout.toFixed(2)}`
                              : b.status === 'lost'
                                ? `-${b.stake.toFixed(2)}`
                                : `→ ${b.potentialPayout.toFixed(2)}`}
                          </span>
                        </div>
                        {b.status === 'pending' && onCashOut && (
                          <button
                            type="button"
                            onClick={() => onCashOut(b)}
                            className="mt-2 w-full py-1.5 rounded-md text-[10px] font-bold transition-colors hover:brightness-110"
                            style={{
                              background: 'rgba(45,201,122,0.10)',
                              color: '#2DC97A',
                              border: '1px solid rgba(45,201,122,0.30)',
                            }}
                          >
                            Cash out early
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : betMode === 'single' ? (
          <motion.div key="singles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y" style={{ borderColor: '#1A2238' }}>
            {selections.map((sel, i) => {
              const stakeKey = sel.id;
              const stake = Number(stakeInputs[stakeKey]) || 0;
              const payout = calcPayout(stake, sel.odds);
              return (
                <div key={sel.id} className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug truncate" style={{ color: '#F5E8C8' }}>{sel.label}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#8FA3B8' }}>{sel.gameLabel}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-sm font-bold number-display" style={{ color: sel.odds > 0 ? '#2DC97A' : '#F0B232' }}>{fmtOdds(sel.odds)}</span>
                      <button onClick={() => onRemove(i)} className="p-0.5 rounded hover:bg-white/5">
                        <X className="w-3 h-3" style={{ color: '#8FA3B8' }} />
                      </button>
                    </div>
                  </div>
                  {/* Quick bet buttons */}
                  <div className="flex gap-1 mb-2">
                    {quickBets.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setStakeInputs((prev) => ({ ...prev, [stakeKey]: String(amt) }))}
                        className="flex-1 py-1 rounded text-[9px] font-bold transition-all hover:opacity-80"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#8FA3B8', border: '1px solid #1A2238' }}
                      >
                        {amt >= 1000 ? `${amt / 1000}K` : amt}
                      </button>
                    ))}
                    <button
                      onClick={() => setStakeInputs((prev) => ({ ...prev, [stakeKey]: String(Math.floor(balance)) }))}
                      className="flex-1 py-1 rounded text-[9px] font-bold transition-all hover:opacity-80"
                      style={{ background: 'rgba(240,178,50,0.08)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.2)' }}
                    >
                      Max
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder={`Stake (${activeCurrency})`}
                      value={stakeInputs[stakeKey] || ''}
                      onChange={(e) => setStakeInputs((prev) => ({ ...prev, [stakeKey]: e.target.value }))}
                      className="flex-1 px-2.5 py-1.5 rounded-lg text-xs number-display text-[#F5E8C8] focus:outline-none"
                      style={{ background: '#0A101C', border: '1px solid #1A2238' }}
                    />
                    {stake > 0 && (
                      <span className="text-[10px] font-bold number-display" style={{ color: '#2DC97A' }}>
                        +{payout.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px]" style={{ color: '#4A5878' }}>Implied: {impliedProb(sel.odds)}%</span>
                  </div>
                </div>
              );
            })}
            <div className="p-3">
              <button
                onClick={onPlaceBet}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }}
              >
                Place {selections.length} Bet{selections.length > 1 ? 's' : ''} (Demo)
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="parlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 space-y-3">
            {/* Parlay legs */}
            <div className="space-y-2">
              {selections.map((sel, i) => (
                <div key={sel.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                      style={{ background: 'rgba(45,201,122,0.15)', color: '#2DC97A' }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold truncate" style={{ color: '#F5E8C8' }}>{sel.label}</p>
                      <p className="text-[9px]" style={{ color: '#8FA3B8' }}>{sel.gameLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span
                      className="text-xs font-bold number-display"
                      style={{ color: sel.odds > 0 ? '#2DC97A' : '#F0B232' }}
                    >
                      {fmtOdds(sel.odds)}
                    </span>
                    <button onClick={() => onRemove(i)}><X className="w-3 h-3" style={{ color: '#8FA3B8' }} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Parlay odds display */}
            {parlayOddsDisplay && (
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: 'rgba(240,178,50,0.08)', border: '1px solid rgba(240,178,50,0.2)' }}
              >
                <div className="flex items-center gap-1.5">
                  {isBigParlay && <Trophy className="w-4 h-4" style={{ color: '#F0B232' }} />}
                  <span className="text-xs font-semibold" style={{ color: '#8FA3B8' }}>
                    {selections.length}-Leg Parlay Odds
                  </span>
                </div>
                <span
                  className="text-base font-black number-display"
                  style={{ color: '#F0B232' }}
                >
                  {isBigParlay && '🏆 '}{parlayOddsDisplay}
                </span>
              </div>
            )}

            {/* Quick bet + input */}
            <div className="flex gap-1">
              {quickBets.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setParlayStake(String(amt))}
                  className="flex-1 py-1 rounded text-[9px] font-bold transition-all hover:opacity-80"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#8FA3B8', border: '1px solid #1A2238' }}
                >
                  {amt >= 1000 ? `${amt / 1000}K` : amt}
                </button>
              ))}
              <button
                onClick={() => setParlayStake(String(Math.floor(balance)))}
                className="flex-1 py-1 rounded text-[9px] font-bold transition-all hover:opacity-80"
                style={{ background: 'rgba(240,178,50,0.08)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.2)' }}
              >
                Max
              </button>
            </div>

            <input
              type="number"
              placeholder={`Parlay stake (${activeCurrency})`}
              value={parlayStake}
              onChange={(e) => setParlayStake(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs number-display text-[#F5E8C8] focus:outline-none"
              style={{ background: '#0A101C', border: '1px solid #1A2238' }}
            />

            {Number(parlayStake) > 0 && (
              <div>
                <div className="flex items-center justify-between px-2 mb-1.5">
                  <span className="text-xs" style={{ color: '#8FA3B8' }}>Potential win</span>
                  <span className="text-sm font-bold number-display" style={{ color: '#2DC97A' }}>
                    +{parlayPayout.toLocaleString()} {activeCurrency}
                  </span>
                </div>
                {/* Payout bar */}
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#0A101C' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #2DC97A, #F0B232)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (parlayPayout / (parlayPayout + Number(parlayStake))) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                {/* Insurance upsell */}
                <div
                  className="flex items-center gap-2 mt-2 px-2.5 py-2 rounded-lg"
                  style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}
                >
                  <Zap className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <p className="text-[10px]" style={{ color: '#8FA3B8' }}>
                    <span className="font-semibold text-blue-400">Parlay Insurance:</span> Get a refund if 1 leg loses (VIP only)
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={onPlaceBet}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }}
            >
              {isBigParlay ? '🏆 ' : ''}Place Parlay (Demo)
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!betPlaced && (
        <div className="px-3 pb-3 text-center">
          <p className="text-[9px]" style={{ color: 'rgba(143,163,184,0.4)' }}>
            Demo only · No real money · 18+ · Play responsibly
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function SportsbookPage() {
  const { activeCurrency, goldCoins, sweepCoins, addGC, addSC } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal, openBuyCoins } = useUIStore();
  const recentBets = useSportsbookStore((s) => s.bets);
  const addBet     = useSportsbookStore((s) => s.addBet);
  const settle     = useSportsbookStore((s) => s.settle);

  const [activeSport, setActiveSport] = useState<SportKey | 'All'>('All');
  const [contentTab, setContentTab] = useState<ContentTab>('all');
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [betMode, setBetMode] = useState<'single' | 'parlay'>('single');
  const [stakeInputs, setStakeInputs] = useState<Record<string, string>>({});
  const [parlayStake, setParlayStake] = useState('');
  const [betPlaced, setBetPlaced] = useState(false);
  const [mobileSlipOpen, setMobileSlipOpen] = useState(false);
  const [confirmSummary, setConfirmSummary] = useState<BetConfirmSummary | null>(null);
  const [placing, setPlacing] = useState(false);

  const isGC = activeCurrency === 'GC';
  const balance = isGC ? goldCoins : sweepCoins;
  const balanceLabel = isGC ? formatGC(balance) : formatSC(balance);

  const filteredGames = useMemo(() =>
    activeSport === 'All' ? SPORTSBOOK_GAMES : SPORTSBOOK_GAMES.filter((g) => g.sport === activeSport),
    [activeSport]
  );

  const filteredProps = useMemo(() =>
    activeSport === 'All' ? PLAYER_PROPS : PLAYER_PROPS.filter((p) => p.sport === activeSport),
    [activeSport]
  );

  const liveGames = filteredGames.filter((g) => g.isLive);
  const upcomingGames = filteredGames.filter((g) => !g.isLive);
  const featuredGame = SPORTSBOOK_GAMES.find((g) => g.isFeatured && g.isLive) ?? SPORTSBOOK_GAMES.find((g) => g.isFeatured);

  // NOTE: Adding to the slip is intentionally NOT gated by login — matches
  // DK/FD/Stake behavior where you can browse and build a slip logged out,
  // and only the "Place Bet" step opens the auth modal. (See handlePlaceBet.)
  const toggleSelection = useCallback((sel: BetSelection) => {
    setSelections((prev) => {
      const exists = prev.find((s) => s.id === sel.id);
      if (exists) return prev.filter((s) => s.id !== sel.id);
      // For game markets (not props), replace same game+market with the new side
      if (sel.market !== 'prop') {
        const filtered = prev.filter((s) => !(s.gameId === sel.gameId && s.market === sel.market));
        return [...filtered, sel];
      }
      return [...prev, sel];
    });
  }, []);

  const removeSelection = useCallback((idx: number) => {
    setSelections((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // Step 1: Build the summary + open the confirmation modal.
  const handlePlaceBet = useCallback(() => {
    if (!isLoggedIn) { openAuthModal(); return; }
    if (selections.length === 0) return;

    const buildLeg = (sel: BetSelection): BetConfirmLeg => ({
      label: sel.label,
      gameLabel: sel.gameLabel,
      odds: sel.odds,
    });

    if (betMode === 'single') {
      const lines = selections
        .map((sel) => ({ sel, stake: Number(stakeInputs[sel.id]) || 0 }))
        .filter((x) => x.stake > 0);
      if (lines.length === 0) { toast.error('Add a stake to at least one selection'); return; }
      const totalStake      = lines.reduce((s, l) => s + l.stake, 0);
      const totalProfit     = lines.reduce((s, l) => s + calcPayout(l.stake, l.sel.odds), 0);
      const totalPayout     = totalStake + totalProfit;

      setConfirmSummary({
        mode: 'single',
        legs: lines.map((l) => buildLeg(l.sel)),
        totalStake,
        potentialPayout: totalPayout,
        currency: activeCurrency as 'GC' | 'SC',
        balance,
      });
    } else {
      const stake = Number(parlayStake) || 0;
      if (stake <= 0) { toast.error('Enter a stake for your parlay'); return; }
      if (selections.length < 2) { toast.error('A parlay needs at least 2 legs'); return; }
      const dec    = calcParlayDecimal(selections);
      const payout = stake + calcParlay(selections, stake);
      setConfirmSummary({
        mode: 'parlay',
        legs: selections.map(buildLeg),
        totalStake: stake,
        potentialPayout: payout,
        parlayDecimalOdds: dec,
        currency: activeCurrency as 'GC' | 'SC',
        balance,
      });
    }
  }, [isLoggedIn, openAuthModal, selections, betMode, stakeInputs, parlayStake, balance, activeCurrency]);

  // Step 2: User confirmed — deduct wallet, persist bets, animate success.
  const confirmAndPlace = useCallback(() => {
    if (!confirmSummary) return;
    setPlacing(true);

    if (confirmSummary.totalStake > balance) {
      toast.error(`Insufficient ${activeCurrency} balance`);
      setPlacing(false);
      return;
    }

    // Deduct
    if (isGC) addGC(-confirmSummary.totalStake);
    else      addSC(-confirmSummary.totalStake);

    // Persist
    if (confirmSummary.mode === 'single') {
      const lines = selections
        .map((sel) => ({ sel, stake: Number(stakeInputs[sel.id]) || 0 }))
        .filter((x) => x.stake > 0);
      lines.forEach(({ sel, stake }) => {
        const profit = calcPayout(stake, sel.odds);
        addBet({
          currency: activeCurrency as 'GC' | 'SC',
          stake,
          potentialPayout: stake + profit,
          odds: sel.odds > 0 ? 1 + sel.odds / 100 : 1 + 100 / Math.abs(sel.odds),
          mode: 'single',
          summary: sel.label,
          legs: 1,
        });
      });
    } else {
      const stake = Number(parlayStake) || 0;
      addBet({
        currency: activeCurrency as 'GC' | 'SC',
        stake,
        potentialPayout: confirmSummary.potentialPayout,
        odds: confirmSummary.parlayDecimalOdds || 1,
        mode: 'parlay',
        summary: `${selections[0].label}${selections.length > 1 ? ` + ${selections.length - 1} more` : ''}`,
        legs: selections.length,
      });
    }

    // Tiny placement animation, then clear and confirm
    setTimeout(() => {
      setPlacing(false);
      setConfirmSummary(null);
      setBetPlaced(true);
      toast.success(
        confirmSummary.mode === 'parlay'
          ? `${selections.length}-leg parlay placed`
          : `${selections.length} bet${selections.length === 1 ? '' : 's'} placed`,
        { description: `${confirmSummary.totalStake.toFixed(2)} ${confirmSummary.currency} staked.` },
      );
      setTimeout(() => {
        setBetPlaced(false);
        setSelections([]);
        setStakeInputs({});
        setParlayStake('');
      }, 1800);
    }, 500);
  }, [confirmSummary, balance, activeCurrency, isGC, addGC, addSC, addBet, selections, stakeInputs, parlayStake]);

  // Cash out a pending bet at fair value (mocked).
  // Fair value ≈ stake × (current_decimal_odds / original_decimal_odds) discounted ~10%.
  // We don't have live odds, so we use a randomized "time-decay" multiplier between
  // 0.55 and 1.05 of stake to feel believable.
  const handleCashOut = useCallback((bet: PlacedBet) => {
    if (bet.status !== 'pending') return;
    const factor = 0.55 + Math.random() * 0.50; // 0.55x..1.05x of stake
    const payout = +(bet.stake * factor).toFixed(2);
    if (bet.currency === 'GC') addGC(payout); else addSC(payout);
    settle(bet.id, 'won');
    toast.success('Cashed out', {
      description: `+${payout.toFixed(2)} ${bet.currency} on "${bet.summary}" (${factor < 1 ? 'before settlement' : 'profit'})`,
    });
  }, [addGC, addSC, settle]);

  const handleCopySlip = useCallback((parlay: CreatorParlay) => {
    if (!isLoggedIn) { openAuthModal(); return; }
    const newSels: BetSelection[] = parlay.legs.map((leg, i) => ({
      id: `creator-${parlay.id}-leg-${i}`,
      gameId: parlay.id * 100 + i,
      market: 'moneyline' as const,
      side: 'home' as const,
      label: leg.label,
      odds: leg.odds,
      gameLabel: leg.game,
    }));
    setSelections((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const toAdd = newSels.filter((s) => !existingIds.has(s.id));
      return [...prev, ...toAdd];
    });
    setBetMode('parlay');
  }, [isLoggedIn, openAuthModal]);

  const CONTENT_TABS: { key: ContentTab; label: string; count?: number }[] = [
    { key: 'all', label: 'All' },
    { key: 'live', label: 'Live', count: liveGames.length },
    { key: 'upcoming', label: 'Upcoming', count: upcomingGames.length },
    { key: 'props', label: 'Player Props', count: filteredProps.length },
    { key: 'creators', label: 'Creator Picks', count: CREATOR_PARLAYS.length },
  ];

  const showLive = contentTab === 'all' || contentTab === 'live';
  const showUpcoming = contentTab === 'all' || contentTab === 'upcoming';
  const showProps = contentTab === 'props';
  const showCreators = contentTab === 'creators';

  return (
    <div className="animate-[fade-in_0.3s_ease-out]">
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 px-6 py-7"
        style={{
          background: 'radial-gradient(ellipse at 10% 60%, rgba(59,130,246,0.14) 0%, transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(240,178,50,0.10) 0%, transparent 50%), #0A101C',
          border: '1px solid #1A2238',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="absolute right-6 top-4 opacity-[0.06]">
          <svg width="80" height="64" viewBox="0 0 40 32" fill="none">
            <rect x="2" y="25" width="36" height="6" rx="2" fill="#3B82F6"/>
            <rect x="7" y="17" width="26" height="6" rx="2" fill="#3B82F6"/>
            <rect x="13" y="9" width="14" height="6" rx="2" fill="#F0B232"/>
            <rect x="17" y="1" width="6" height="6" rx="2" fill="#F0B232"/>
          </svg>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
                <span className="text-blue-400 text-xs">🏆</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Yala Sportsbook</span>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider text-amber-400" style={{ background: 'rgba(245,158,11,0.15)' }}>
                BETA
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>
              Live Betting &amp; Pre-Match
            </h1>
            <p className="text-sm max-w-lg" style={{ color: '#8FA3B8' }}>
              {SPORTSBOOK_GAMES.filter((g) => g.isLive).length} events live now · {SPORTSBOOK_GAMES.length} markets open · GC &amp; SC supported
            </p>
          </div>

          {isLoggedIn && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl self-start"
              style={{ background: 'rgba(240,178,50,0.08)', border: '1px solid rgba(240,178,50,0.18)' }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: '#8FA3B8' }}>
                  {activeCurrency} Balance
                </p>
                <p className="font-bold text-lg number-display leading-none" style={{ color: '#F0B232' }}>
                  {balanceLabel} {activeCurrency}
                </p>
              </div>
              <button
                onClick={openBuyCoins}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }}
              >
                + Add
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <p className="text-[11px]" style={{ color: '#8FA3B8' }}>
            <span className="font-semibold text-blue-400">Demo mode — </span>
            Odds are simulated. No real money. Play with GC &amp; SC for fun.
          </p>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        {/* ── MAIN COLUMN ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Sport tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {SPORT_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSport(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 border',
                  activeSport === tab.key
                    ? 'border-transparent text-black'
                    : 'border-[#1A2238] text-[#8FA3B8] hover:border-[rgba(45,201,122,0.3)] hover:text-[#F5E8C8]'
                )}
                style={activeSport === tab.key ? { background: 'linear-gradient(135deg, #2DC97A, #F0B232)' } : { background: 'rgba(255,255,255,0.03)' }}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 p-1 rounded-xl" style={{ background: '#0A101C', border: '1px solid #1A2238' }}>
            {CONTENT_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setContentTab(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0',
                  contentTab === tab.key
                    ? 'text-black'
                    : 'text-[#8FA3B8] hover:text-[#F5E8C8]'
                )}
                style={contentTab === tab.key ? { background: 'linear-gradient(135deg, #2DC97A, #F0B232)' } : {}}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className="text-[9px] font-black px-1 rounded-full"
                    style={contentTab === tab.key
                      ? { background: 'rgba(0,0,0,0.2)', color: '#040814' }
                      : { background: 'rgba(143,163,184,0.1)', color: '#8FA3B8' }
                    }
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Featured hero card — show on "all" tab when sport isn't filtered */}
          {contentTab === 'all' && activeSport === 'All' && featuredGame && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,178,50,0.12)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.2)' }}>
                  Featured Matchup
                </span>
              </div>
              <FeaturedHeroCard game={featuredGame} selections={selections} onSelect={toggleSelection} />
            </div>
          )}

          {/* Column headers for game rows */}
          {(showLive || showUpcoming) && (showLive ? liveGames : []).length + (showUpcoming ? upcomingGames : []).length > 0 && (
            <div className="hidden sm:flex items-center px-4 pb-1">
              <div className="flex-1 text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#4A5878' }}>Matchup</div>
              <div className="flex gap-1.5 flex-shrink-0" style={{ width: 240 }}>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-center flex-1" style={{ color: '#4A5878' }}>Spread</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-center flex-1" style={{ color: '#4A5878' }}>ML</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-center flex-1" style={{ color: '#4A5878' }}>Total</div>
              </div>
            </div>
          )}

          {/* Live games */}
          {showLive && liveGames.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="live-dot" style={{ background: '#EF4444' }} />
                <span className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Live Now</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
                  {liveGames.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {liveGames.map((game, i) => (
                  <motion.div key={game.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <GameCard game={game} selections={selections} onSelect={toggleSelection} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Upcoming games */}
          {showUpcoming && upcomingGames.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Upcoming</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(143,163,184,0.12)', color: '#8FA3B8' }}>
                  {upcomingGames.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {upcomingGames.map((game, i) => (
                  <motion.div key={game.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <GameCard game={game} selections={selections} onSelect={toggleSelection} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Player props */}
          {showProps && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Player Props</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,201,122,0.12)', color: '#2DC97A' }}>
                  {filteredProps.length}
                </span>
              </div>
              {filteredProps.length === 0 ? (
                <div className="py-12 text-center" style={{ color: '#4A5878' }}>
                  <p className="text-3xl mb-2">🏃</p>
                  <p className="font-semibold" style={{ color: '#8FA3B8' }}>No props for this sport</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredProps.map((prop, i) => (
                    <motion.div key={prop.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <PropCard prop={prop} selections={selections} onSelect={toggleSelection} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Creator parlays */}
          {showCreators && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Featured Parlays</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,178,50,0.12)', color: '#F0B232' }}>
                  {CREATOR_PARLAYS.length}
                </span>
              </div>
              <p className="text-xs mb-4" style={{ color: '#8FA3B8' }}>
                Community &amp; creator parlays — copy any slip directly to your bet slip in one click.
              </p>
              <div className="space-y-3">
                {CREATOR_PARLAYS.map((parlay, i) => (
                  <motion.div key={parlay.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <CreatorParlayCard parlay={parlay} onCopySlip={handleCopySlip} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {!showProps && !showCreators && filteredGames.length === 0 && (
            <div className="py-20 text-center" style={{ color: '#4A5878' }}>
              <p className="text-4xl mb-3">🏆</p>
              <p className="font-semibold" style={{ color: '#8FA3B8' }}>No games for this sport yet</p>
              <p className="text-sm mt-1">Check back soon or browse another sport</p>
            </div>
          )}
        </div>

        {/* ── BET SLIP (desktop) ───────────────────────────────────────── */}
        <div className="hidden lg:block w-72 flex-shrink-0 sticky top-4 space-y-3">
          <BetSlip
            selections={selections}
            betMode={betMode}
            setBetMode={setBetMode}
            stakeInputs={stakeInputs}
            setStakeInputs={setStakeInputs}
            parlayStake={parlayStake}
            setParlayStake={setParlayStake}
            onRemove={removeSelection}
            onClear={() => setSelections([])}
            onPlaceBet={handlePlaceBet}
            betPlaced={betPlaced}
            activeCurrency={activeCurrency}
            balance={balance}
            recentBets={recentBets}
            onCashOut={handleCashOut}
          />

          {/* Popular markets sidebar */}
          <div className="rounded-xl p-3" style={{ background: '#101C28', border: '1px solid #1A2238' }}>
            <p className="text-xs font-bold mb-2.5 flex items-center gap-2" style={{ color: '#F5E8C8' }}>
              🔥 Popular Right Now
            </p>
            <div className="space-y-2">
              {[
                { label: 'Chiefs -3.5', game: 'KC vs PHI', odds: -110 },
                { label: 'Lakers ML', game: 'LAL vs BOS', odds: +105 },
                { label: 'Jones ML', game: 'Jones vs Miocic', odds: -420 },
                { label: 'UCL O 2.5', game: 'RMA vs MCI', odds: -145 },
                { label: 'Mahomes O 285.5', game: 'KC vs PHI', odds: -115 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 rounded-lg px-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: '#F5E8C8' }}>{item.label}</p>
                    <p className="text-[9px]" style={{ color: '#8FA3B8' }}>{item.game}</p>
                  </div>
                  <span className="text-xs font-bold number-display" style={{ color: item.odds > 0 ? '#2DC97A' : '#F0B232' }}>
                    {fmtOdds(item.odds)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bet slip FAB ──────────────────────────────────────────── */}
      {(() => {
        const pendingCount = recentBets.filter((b) => b.status === 'pending').length;
        const showFab      = !mobileSlipOpen && (selections.length > 0 || pendingCount > 0 || recentBets.length > 0);
        if (!showFab) return null;
        const hasSel  = selections.length > 0;
        const label   = hasSel ? 'View Bet Slip' : pendingCount > 0 ? `${pendingCount} active bet${pendingCount === 1 ? '' : 's'}` : 'Recent bets';
        const bgStyle = hasSel
          ? { background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }
          : { background: '#0F1828', color: '#F5E8C8', border: '1px solid #1A2238' };
        return (
          <div className="fixed bottom-20 left-0 right-0 px-4 lg:hidden z-30">
            <button
              type="button"
              onClick={() => setMobileSlipOpen(true)}
              aria-label="Open bet slip"
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl font-bold text-sm shadow-xl"
              style={bgStyle}
            >
              <span>{label}</span>
              <span className="flex items-center gap-2">
                {hasSel && (
                  <span className="bg-black/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">
                    {selections.length}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 rotate-180" />
              </span>
            </button>
          </div>
        );
      })()}

      {/* ── Mobile slip drawer ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileSlipOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSlipOpen(false)}
              className="fixed inset-0 z-40 bg-black/55 lg:hidden"
              style={{ backdropFilter: 'blur(2px)' }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed left-0 right-0 bottom-0 z-50 lg:hidden max-h-[85vh] overflow-y-auto rounded-t-2xl"
              style={{ background: '#0A101C', border: '1px solid #1A2238', borderBottom: 'none' }}
            >
              <div className="sticky top-0 flex items-center justify-between px-4 py-3 z-10" style={{ background: '#0A101C', borderBottom: '1px solid #1A2238' }}>
                <p className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Bet Slip ({selections.length})</p>
                <button
                  type="button"
                  onClick={() => setMobileSlipOpen(false)}
                  aria-label="Close bet slip"
                  className="p-1.5 rounded-lg hover:bg-white/10"
                >
                  <X className="w-4 h-4" style={{ color: '#8FA3B8' }} />
                </button>
              </div>
              <div className="p-3">
                <BetSlip
                  selections={selections}
                  betMode={betMode}
                  setBetMode={setBetMode}
                  stakeInputs={stakeInputs}
                  setStakeInputs={setStakeInputs}
                  parlayStake={parlayStake}
                  setParlayStake={setParlayStake}
                  onRemove={removeSelection}
                  onClear={() => setSelections([])}
                  onPlaceBet={() => { handlePlaceBet(); setMobileSlipOpen(false); }}
                  betPlaced={betPlaced}
                  activeCurrency={activeCurrency}
                  balance={balance}
                  recentBets={recentBets}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bet confirmation modal (review → confirm pattern) ─────────── */}
      <BetConfirmModal
        open={confirmSummary !== null}
        summary={confirmSummary}
        onClose={() => setConfirmSummary(null)}
        onConfirm={confirmAndPlace}
        placing={placing}
      />

      {/* ── Legal ────────────────────────────────────────────────────────── */}
      <div className="border-t mt-8 pt-5 text-center" style={{ borderColor: '#1A2238' }}>
        <p className="text-xs" style={{ color: 'rgba(143,163,184,0.5)' }}>
          18+ · Demo only · No real bets placed · Odds are simulated · Void Where Prohibited
        </p>
      </div>
    </div>
  );
}
