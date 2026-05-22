'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WINS = [
  { user: 'NightFox88',   game: 'Neon Plinko',       amount: '48,200 GC',   multiplier: '241x', currency: 'GC' },
  { user: 'NightWolf',    game: 'Sweet Bonanza',      amount: '2.5 SC',      multiplier: '98x',  currency: 'SC' },
  { user: 'SpeedRider',   game: 'Yala Crash',         amount: '125,000 GC',  multiplier: '500x', currency: 'GC' },
  { user: 'NightHunter',  game: 'Golden Dice',        amount: '8.0 SC',      multiplier: '32x',  currency: 'SC' },
  { user: 'SpinKing',     game: 'Book of Dead',       amount: '780,000 GC',  multiplier: '1,200x', currency: 'GC' },
  { user: 'CoinLead',     game: 'Gold Mines',         amount: '12.5 SC',     multiplier: '50x',  currency: 'SC' },
  { user: 'NeonRunner',   game: 'Emerald Wheel',      amount: '95,000 GC',   multiplier: '190x', currency: 'GC' },
  { user: 'ThunderZ',     game: 'Crazy Time',         amount: '4.0 SC',      multiplier: '16x',  currency: 'SC' },
  { user: 'GoldRushKing', game: 'Hyper Limbo',        amount: '340,000 GC',  multiplier: '680x', currency: 'GC' },
  { user: 'EmeraldWave',  game: 'Gates of Olympus',   amount: '18.0 SC',     multiplier: '72x',  currency: 'SC' },
  { user: 'NightHawk',    game: 'Reactoonz',          amount: '220,000 GC',  multiplier: '440x', currency: 'GC' },
  { user: 'JetRider',     game: 'Dog House Megaways', amount: '6.25 SC',     multiplier: '25x',  currency: 'SC' },
  { user: 'NeonLuck',     game: 'Midnight Blackjack', amount: '55,000 GC',   multiplier: '110x', currency: 'GC' },
  { user: 'CryptoAce',    game: 'Lightning Roulette', amount: '9.0 SC',      multiplier: '36x',  currency: 'SC' },
  { user: 'VaultKing',    game: 'Royal Keno',         amount: '210,000 GC',  multiplier: '420x', currency: 'GC' },
];

const VISIBLE = 3; // how many wins to show at once

export function LiveWinFeed() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setOffset((o) => (o + 1) % WINS.length);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  const visible = Array.from({ length: VISIBLE }, (_, i) => WINS[(offset + i) % WINS.length]);

  return (
    <div
      className="h-9 flex-shrink-0 flex items-center overflow-hidden w-full"
      style={{
        backgroundColor: '#06100A',
        borderTop: '1px solid #1A2E22',
      }}
    >
      {/* Label */}
      <div
        className="flex items-center gap-2 px-3 h-full flex-shrink-0"
        style={{ borderRight: '1px solid #1A2E22' }}
      >
        <span className="live-dot" />
        <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: '#2DC97A' }}>
          Live Wins
        </span>
      </div>

      {/* Win chips — rotate, no scroll */}
      <div className="flex-1 flex items-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          {visible.map((win, i) => (
            <motion.div
              key={`${win.user}-${win.game}-${offset}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="flex items-center gap-1.5 px-4 min-w-0 flex-shrink-0"
              style={{ borderRight: i < VISIBLE - 1 ? '1px solid #1A2E22' : 'none' }}
            >
              <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: '#F5E8C8' }}>
                {win.user}
              </span>
              <span className="text-[11px] whitespace-nowrap" style={{ color: '#4A6A55' }}>won</span>
              <span
                className="text-[11px] font-bold number-display px-1.5 py-0.5 rounded whitespace-nowrap"
                style={{
                  color: win.currency === 'GC' ? '#F0B232' : '#2DC97A',
                  backgroundColor: win.currency === 'GC' ? 'rgba(240,178,50,0.12)' : 'rgba(45,201,122,0.12)',
                }}
              >
                {win.amount}
              </span>
              <span className="text-[10px] font-bold whitespace-nowrap hidden sm:inline" style={{ color: win.currency === 'GC' ? '#F0B232' : '#2DC97A' }}>
                @{win.multiplier}
              </span>
              <span className="text-[10px] whitespace-nowrap hidden md:inline" style={{ color: '#4A6A55' }}>on</span>
              <span className="text-[11px] font-medium whitespace-nowrap hidden md:inline" style={{ color: '#8FA899' }}>
                {win.game}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
