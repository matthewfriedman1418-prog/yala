'use client';
import Link from 'next/link';

// Today's top wins — shown as a ranked leaderboard strip
const TOP_WINS = [
  { rank: 1, user: 'GoldRushKing', game: 'Book of Dead',     amount: '780,000 GC', multiplier: '1,200x', currency: 'GC' },
  { rank: 2, user: 'SpinKing',     game: 'Yala Crash',       amount: '340,000 GC', multiplier: '680x',   currency: 'GC' },
  { rank: 3, user: 'NightHunter',  game: 'Gates of Olympus', amount: '125,000 GC', multiplier: '500x',   currency: 'GC' },
  { rank: 4, user: 'EmeraldWave',  game: 'Lightning Roulette',amount: '18.0 SC',   multiplier: '72x',    currency: 'SC' },
];

const MEDAL = ['🥇', '🥈', '🥉', '4️⃣'];

export function LiveWinFeed() {
  return (
    <div
      className="h-10 flex-shrink-0 flex items-center overflow-hidden w-full"
      style={{ backgroundColor: '#06100A', borderTop: '1px solid #1A2E22' }}
    >
      {/* Label */}
      <div
        className="flex items-center gap-2 px-3 h-full flex-shrink-0 whitespace-nowrap"
        style={{ borderRight: '1px solid #1A2E22' }}
      >
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#F0B232' }}>
          🏆 Today&apos;s Leaders
        </span>
      </div>

      {/* Ranked entries */}
      <div className="flex-1 flex items-center overflow-hidden divide-x" style={{ borderColor: '#1A2E22' }}>
        {TOP_WINS.map((win, i) => (
          <div
            key={win.rank}
            className="flex items-center gap-2 px-4 h-full flex-shrink-0"
            style={{ borderRight: '1px solid #1A2E22' }}
          >
            <span className="text-sm leading-none">{MEDAL[i]}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: '#F5E8C8' }}>
                {win.user}
              </span>
              <span className="text-[10px] whitespace-nowrap hidden sm:inline" style={{ color: '#4A6A55' }}>
                ·
              </span>
              <span
                className="text-[11px] font-black number-display whitespace-nowrap"
                style={{ color: win.currency === 'GC' ? '#F0B232' : '#2DC97A' }}
              >
                {win.amount}
              </span>
              <span className="text-[10px] whitespace-nowrap hidden md:inline" style={{ color: '#4A6A55' }}>
                @{win.multiplier}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* View all */}
      <Link
        href="/leaderboards"
        className="px-4 h-full flex items-center text-[10px] font-semibold whitespace-nowrap flex-shrink-0 transition-opacity hover:opacity-70"
        style={{ color: '#2DC97A', borderLeft: '1px solid #1A2E22' }}
      >
        View All →
      </Link>
    </div>
  );
}
