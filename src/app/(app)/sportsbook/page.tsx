'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC, formatSC } from '@/lib/utils';
import { SPORTSBOOK_GAMES, SPORT_TABS, type SportKey, type SBGame } from '@/lib/mock-data/sportsbook';
import { X, Trash2, ChevronDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────
type MarketKey = 'spread' | 'moneyline' | 'total';

interface BetSelection {
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

function calcParlay(selections: BetSelection[], stake: number) {
  const dec = selections.reduce((acc, s) => {
    const d = s.odds > 0 ? 1 + s.odds / 100 : 1 + 100 / -s.odds;
    return acc * d;
  }, 1);
  return +((dec - 1) * stake).toFixed(0);
}

// ── Sub-components ────────────────────────────────────────────────────────

function OddsButton({
  odds,
  label,
  sublabel,
  active,
  onClick,
}: {
  odds: number;
  label: string;
  sublabel?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-lg border transition-all text-center min-w-[72px] flex-1',
        active
          ? 'border-[#F0B232] bg-[rgba(240,178,50,0.12)]'
          : 'border-[#1A2E22] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(45,201,122,0.4)] hover:bg-[rgba(45,201,122,0.06)]'
      )}
    >
      {sublabel && (
        <span className="text-[9px] font-medium" style={{ color: '#8FA899' }}>{sublabel}</span>
      )}
      <span
        className="text-sm font-bold number-display leading-none"
        style={{ color: active ? '#F0B232' : '#F5E8C8' }}
      >
        {fmtOdds(odds)}
      </span>
      <span className="text-[9px]" style={{ color: '#8FA899' }}>{label}</span>
    </button>
  );
}

function LiveBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="live-dot" style={{ background: '#EF4444' }} />
      <span className="text-[10px] font-bold uppercase tracking-wide text-red-400">{label}</span>
    </div>
  );
}

function GameCard({
  game,
  selections,
  onSelect,
}: {
  game: SBGame;
  selections: BetSelection[];
  onSelect: (sel: BetSelection) => void;
}) {
  const isSelected = (market: MarketKey, side: string) =>
    selections.some((s) => s.gameId === game.id && s.market === market && s.side === side);

  const pick = (market: MarketKey, side: 'home' | 'away' | 'over' | 'under', label: string, odds: number) => {
    onSelect({
      gameId: game.id,
      market,
      side,
      label,
      odds,
      gameLabel: `${game.awayAbbr} @ ${game.homeAbbr}`,
    });
  };

  const spreadSign = game.spread.line > 0 ? `+${game.spread.line}` : `${game.spread.line}`;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#101C16', border: '1px solid #1A2E22' }}
    >
      {/* Game header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #1A2E22', background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-2">
          {game.isLive ? (
            <LiveBadge label={game.liveLabel || 'LIVE'} />
          ) : (
            <span className="text-[10px] font-medium" style={{ color: '#8FA899' }}>{game.time}</span>
          )}
          <span className="text-[10px]" style={{ color: '#4A6A55' }}>·</span>
          <span className="text-[10px]" style={{ color: '#4A6A55' }}>{game.league}</span>
        </div>
        {game.isLive && (
          <div className="flex items-center gap-2 text-xs font-bold number-display">
            <span style={{ color: '#F5E8C8' }}>{game.homeAbbr} {game.homeScore}</span>
            <span style={{ color: '#4A6A55' }}>–</span>
            <span style={{ color: '#F5E8C8' }}>{game.awayScore} {game.awayAbbr}</span>
          </div>
        )}
      </div>

      {/* Matchup + markets */}
      <div className="px-4 py-3">
        {/* Team rows */}
        <div className="space-y-2.5 mb-3">
          {/* Away team */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                style={{ background: 'rgba(45,201,122,0.1)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.2)' }}
              >
                {game.awayAbbr.slice(0, 2)}
              </div>
              <span className="text-sm font-semibold truncate" style={{ color: '#F5E8C8' }}>{game.away}</span>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <OddsButton
                odds={game.spread.awayOdds}
                label={`${game.spread.line > 0 ? '-' : '+'}${Math.abs(game.spread.line)}`}
                sublabel="Spread"
                active={isSelected('spread', 'away')}
                onClick={() => pick('spread', 'away', `${game.awayAbbr} ${game.spread.line > 0 ? '-' : '+'}${Math.abs(game.spread.line)}`, game.spread.awayOdds)}
              />
              <OddsButton
                odds={game.moneyline.away}
                label="ML"
                active={isSelected('moneyline', 'away')}
                onClick={() => pick('moneyline', 'away', `${game.awayAbbr} ML`, game.moneyline.away)}
              />
              <OddsButton
                odds={game.total.overOdds}
                label={`O ${game.total.line}`}
                sublabel="Over"
                active={isSelected('total', 'over')}
                onClick={() => pick('total', 'over', `O ${game.total.line}`, game.total.overOdds)}
              />
            </div>
          </div>

          {/* Home team */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                style={{ background: 'rgba(240,178,50,0.1)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.2)' }}
              >
                {game.homeAbbr.slice(0, 2)}
              </div>
              <span className="text-sm font-semibold truncate" style={{ color: '#F5E8C8' }}>{game.home}</span>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <OddsButton
                odds={game.spread.homeOdds}
                label={spreadSign}
                sublabel="Spread"
                active={isSelected('spread', 'home')}
                onClick={() => pick('spread', 'home', `${game.homeAbbr} ${spreadSign}`, game.spread.homeOdds)}
              />
              <OddsButton
                odds={game.moneyline.home}
                label="ML"
                active={isSelected('moneyline', 'home')}
                onClick={() => pick('moneyline', 'home', `${game.homeAbbr} ML`, game.moneyline.home)}
              />
              <OddsButton
                odds={game.total.underOdds}
                label={`U ${game.total.line}`}
                sublabel="Under"
                active={isSelected('total', 'under')}
                onClick={() => pick('total', 'under', `U ${game.total.line}`, game.total.underOdds)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function SportsbookPage() {
  const { activeCurrency, goldCoins, sweepCoins } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal, openBuyCoins } = useUIStore();

  const [activeSport, setActiveSport] = useState<SportKey | 'All'>('All');
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [betMode, setBetMode] = useState<'single' | 'parlay'>('single');
  const [stakeInputs, setStakeInputs] = useState<Record<string, string>>({});
  const [parlayStake, setParlayStake] = useState('');
  const [betPlaced, setBetPlaced] = useState(false);

  const isGC = activeCurrency === 'GC';
  const balance = isGC ? goldCoins : sweepCoins;
  const balanceLabel = isGC ? formatGC(balance) : formatSC(balance);

  const filteredGames = useMemo(() =>
    activeSport === 'All'
      ? SPORTSBOOK_GAMES
      : SPORTSBOOK_GAMES.filter((g) => g.sport === activeSport),
    [activeSport]
  );

  const liveGames = filteredGames.filter((g) => g.isLive);
  const upcomingGames = filteredGames.filter((g) => !g.isLive);

  const toggleSelection = (sel: BetSelection) => {
    if (!isLoggedIn) { openAuthModal(); return; }
    setSelections((prev) => {
      const exists = prev.find((s) => s.gameId === sel.gameId && s.market === sel.market && s.side === sel.side);
      if (exists) return prev.filter((s) => !(s.gameId === sel.gameId && s.market === sel.market && s.side === sel.side));
      // Remove same game+market but different side
      const filtered = prev.filter((s) => !(s.gameId === sel.gameId && s.market === sel.market));
      return [...filtered, sel];
    });
  };

  const removeSelection = (idx: number) => {
    setSelections((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePlaceBet = () => {
    if (!isLoggedIn) { openAuthModal(); return; }
    setBetPlaced(true);
    setTimeout(() => {
      setBetPlaced(false);
      setSelections([]);
      setStakeInputs({});
      setParlayStake('');
    }, 2500);
  };

  const parlayPayout = calcParlay(selections, Number(parlayStake) || 0);
  const parlayOdds = selections.length > 1
    ? selections.reduce((acc, s) => {
        const d = s.odds > 0 ? 1 + s.odds / 100 : 1 + 100 / -s.odds;
        return acc * d;
      }, 1)
    : null;
  const parlayOddsDisplay = parlayOdds ? fmtOdds(Math.round((parlayOdds - 1) * 100)) : null;

  return (
    <div className="animate-[fade-in_0.3s_ease-out]">
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 px-6 py-7"
        style={{
          background: 'radial-gradient(ellipse at 10% 60%, rgba(59,130,246,0.14) 0%, transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(240,178,50,0.10) 0%, transparent 50%), #0C1812',
          border: '1px solid #1A2E22',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Watermark */}
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
              Live Betting & Pre-Match
            </h1>
            <p className="text-sm max-w-lg" style={{ color: '#8FA899' }}>
              {SPORTSBOOK_GAMES.filter((g) => g.isLive).length} events live now · {SPORTSBOOK_GAMES.length} markets open · GC &amp; SC supported
            </p>
          </div>

          {isLoggedIn && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl self-start"
              style={{ background: 'rgba(240,178,50,0.08)', border: '1px solid rgba(240,178,50,0.18)' }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: '#8FA899' }}>
                  {activeCurrency} Balance
                </p>
                <p className="font-bold text-lg number-display leading-none" style={{ color: '#F0B232' }}>
                  {balanceLabel} {activeCurrency}
                </p>
              </div>
              <button
                onClick={openBuyCoins}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A' }}
              >
                + Add
              </button>
            </div>
          )}
        </div>

        {/* Demo notice */}
        <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <p className="text-[11px]" style={{ color: '#8FA899' }}>
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
                    : 'border-[#1A2E22] text-[#8FA899] hover:border-[rgba(45,201,122,0.3)] hover:text-[#F5E8C8]'
                )}
                style={activeSport === tab.key ? { background: 'linear-gradient(135deg, #2DC97A, #F0B232)' } : { background: 'rgba(255,255,255,0.03)' }}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Column headers */}
          <div className="hidden sm:flex items-center px-4 pb-1">
            <div className="flex-1 text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#4A6A55' }}>Matchup</div>
            <div className="flex gap-1.5 flex-shrink-0" style={{ width: 240 }}>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-center flex-1" style={{ color: '#4A6A55' }}>Spread</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-center flex-1" style={{ color: '#4A6A55' }}>Moneyline</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-center flex-1" style={{ color: '#4A6A55' }}>Total</div>
            </div>
          </div>

          {/* Live games */}
          {liveGames.length > 0 && (
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
          {upcomingGames.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Upcoming</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(143,168,153,0.12)', color: '#8FA899' }}>
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

          {filteredGames.length === 0 && (
            <div className="py-20 text-center" style={{ color: '#4A6A55' }}>
              <p className="text-4xl mb-3">🏆</p>
              <p className="font-semibold" style={{ color: '#8FA899' }}>No games for this sport yet</p>
              <p className="text-sm mt-1">Check back soon or browse another sport</p>
            </div>
          )}
        </div>

        {/* ── BET SLIP ────────────────────────────────────────────────── */}
        <div className="hidden lg:block w-72 flex-shrink-0 sticky top-4">
          <div className="rounded-xl overflow-hidden" style={{ background: '#101C16', border: '1px solid #1A2E22' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid #1A2E22', background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Bet Slip</span>
                {selections.length > 0 && (
                  <span
                    className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A' }}
                  >
                    {selections.length}
                  </span>
                )}
              </div>
              {selections.length > 0 && (
                <button onClick={() => setSelections([])} className="p-1 rounded hover:bg-white/5 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" style={{ color: '#8FA899' }} />
                </button>
              )}
            </div>

            {/* Mode toggle */}
            {selections.length > 1 && (
              <div className="flex mx-3 mt-3 rounded-lg overflow-hidden" style={{ background: '#0C1812', border: '1px solid #1A2E22' }}>
                {(['single', 'parlay'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setBetMode(mode)}
                    className="flex-1 py-2 text-xs font-semibold capitalize transition-all"
                    style={betMode === mode
                      ? { background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A' }
                      : { color: '#8FA899' }
                    }
                  >
                    {mode === 'parlay' ? `Parlay (${selections.length})` : 'Singles'}
                  </button>
                ))}
              </div>
            )}

            <AnimatePresence>
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
                  <p className="text-xs" style={{ color: '#8FA899' }}>Good luck! Bets are demo only.</p>
                </motion.div>
              ) : selections.length === 0 ? (
                <div className="py-10 px-4 text-center">
                  <span className="text-3xl block mb-2">🎯</span>
                  <p className="text-sm font-medium mb-1" style={{ color: '#F5E8C8' }}>No selections yet</p>
                  <p className="text-xs" style={{ color: '#8FA899' }}>Click any odds to add to your slip</p>
                </div>
              ) : betMode === 'single' ? (
                <motion.div key="singles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y" style={{ borderColor: '#1A2E22' }}>
                  {selections.map((sel, i) => {
                    const stake = Number(stakeInputs[`${sel.gameId}-${sel.market}-${sel.side}`]) || 0;
                    const payout = calcPayout(stake, sel.odds);
                    return (
                      <div key={i} className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold leading-snug truncate" style={{ color: '#F5E8C8' }}>{sel.label}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: '#8FA899' }}>{sel.gameLabel}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-sm font-bold number-display" style={{ color: '#F0B232' }}>{fmtOdds(sel.odds)}</span>
                            <button onClick={() => removeSelection(i)} className="p-0.5 rounded hover:bg-white/5">
                              <X className="w-3 h-3" style={{ color: '#8FA899' }} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder={`Stake (${activeCurrency})`}
                            value={stakeInputs[`${sel.gameId}-${sel.market}-${sel.side}`] || ''}
                            onChange={(e) => setStakeInputs((prev) => ({ ...prev, [`${sel.gameId}-${sel.market}-${sel.side}`]: e.target.value }))}
                            className="flex-1 px-2.5 py-1.5 rounded-lg text-xs number-display text-[#F5E8C8] focus:outline-none"
                            style={{ background: '#0C1812', border: '1px solid #1A2E22' }}
                          />
                          {stake > 0 && (
                            <span className="text-[10px] font-bold number-display" style={{ color: '#2DC97A' }}>
                              Win: {payout.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px]" style={{ color: '#4A6A55' }}>Implied: {impliedProb(sel.odds)}%</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="p-3">
                    <button
                      onClick={handlePlaceBet}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A' }}
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
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold truncate" style={{ color: '#F5E8C8' }}>{sel.label}</p>
                          <p className="text-[9px]" style={{ color: '#8FA899' }}>{sel.gameLabel}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          <span className="text-xs font-bold number-display" style={{ color: '#F0B232' }}>{fmtOdds(sel.odds)}</span>
                          <button onClick={() => removeSelection(i)}><X className="w-3 h-3" style={{ color: '#8FA899' }} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Parlay odds */}
                  {parlayOddsDisplay && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(240,178,50,0.08)', border: '1px solid rgba(240,178,50,0.2)' }}>
                      <span className="text-xs font-semibold" style={{ color: '#8FA899' }}>Parlay Odds</span>
                      <span className="text-sm font-black number-display" style={{ color: '#F0B232' }}>{parlayOddsDisplay}</span>
                    </div>
                  )}

                  <input
                    type="number"
                    placeholder={`Parlay stake (${activeCurrency})`}
                    value={parlayStake}
                    onChange={(e) => setParlayStake(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs number-display text-[#F5E8C8] focus:outline-none"
                    style={{ background: '#0C1812', border: '1px solid #1A2E22' }}
                  />
                  {Number(parlayStake) > 0 && (
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs" style={{ color: '#8FA899' }}>Potential win</span>
                      <span className="text-sm font-bold number-display" style={{ color: '#2DC97A' }}>
                        {parlayPayout.toLocaleString()} {activeCurrency}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handlePlaceBet}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A' }}
                  >
                    Place Parlay (Demo)
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            {!betPlaced && (
              <div className="px-3 pb-3 text-center">
                <p className="text-[9px]" style={{ color: 'rgba(143,168,153,0.4)' }}>
                  Demo only · No real money · 18+ · Play responsibly
                </p>
              </div>
            )}
          </div>

          {/* Popular markets sidebar card */}
          <div className="mt-3 rounded-xl p-3" style={{ background: '#101C16', border: '1px solid #1A2E22' }}>
            <p className="text-xs font-bold mb-2.5 flex items-center gap-2" style={{ color: '#F5E8C8' }}>
              🔥 Popular Right Now
            </p>
            <div className="space-y-2">
              {[
                { label: 'Chiefs -3.5', game: 'KC vs PHI', odds: -110 },
                { label: 'Lakers ML', game: 'LAL vs BOS', odds: +105 },
                { label: 'Jones ML', game: 'Jones vs Miocic', odds: -420 },
                { label: 'UCL O 2.5', game: 'RMA vs MCI', odds: -145 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 rounded-lg px-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: '#F5E8C8' }}>{item.label}</p>
                    <p className="text-[9px]" style={{ color: '#8FA899' }}>{item.game}</p>
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

      {/* Mobile bet slip FAB */}
      {selections.length > 0 && (
        <div className="fixed bottom-12 left-0 right-0 px-4 lg:hidden z-30">
          <button
            onClick={() => {}}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl font-bold text-sm shadow-xl"
            style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#060E0A' }}
          >
            <span>View Bet Slip</span>
            <span className="flex items-center gap-2">
              <span className="bg-black/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">
                {selections.length}
              </span>
              <ChevronDown className="w-4 h-4 rotate-180" />
            </span>
          </button>
        </div>
      )}

      {/* Legal */}
      <div className="border-t mt-8 pt-5 text-center" style={{ borderColor: '#1A2E22' }}>
        <p className="text-xs" style={{ color: 'rgba(143,168,153,0.5)' }}>
          18+ · Demo only · No real bets placed · Odds are simulated · Void Where Prohibited
        </p>
      </div>
    </div>
  );
}
