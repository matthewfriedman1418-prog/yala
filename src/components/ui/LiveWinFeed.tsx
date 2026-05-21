'use client';

/** Live win feed — scrolling marquee strip at bottom of screen */

const WINS = [
  { user: 'DesertFox88', game: 'Oasis Plinko', amount: '48,200 GC', multiplier: '241x', currency: 'GC' },
  { user: 'SaharaWolf', game: 'Sweet Bonanza', amount: '2.5 SC', multiplier: '98x', currency: 'SC' },
  { user: 'DuneRider', game: 'Mirage Crash', amount: '125,000 GC', multiplier: '500x', currency: 'GC' },
  { user: 'OasisHunter', game: 'Golden Dice', amount: '8.0 SC', multiplier: '32x', currency: 'SC' },
  { user: 'PyramidKing', game: 'Book of Dead', amount: '780,000 GC', multiplier: '1,200x', currency: 'GC' },
  { user: 'CaravanLead', game: 'Dune Mines', amount: '12.5 SC', multiplier: '50x', currency: 'SC' },
  { user: 'MirageRunner', game: 'Emerald Wheel', amount: '95,000 GC', multiplier: '190x', currency: 'GC' },
  { user: 'SandstormZ', game: 'Crazy Time', amount: '4.0 SC', multiplier: '16x', currency: 'SC' },
  { user: 'GoldDuneKing', game: 'Sandstorm Limbo', amount: '340,000 GC', multiplier: '680x', currency: 'GC' },
  { user: 'EmeraldDunes', game: 'Gates of Olympus', amount: '18.0 SC', multiplier: '72x', currency: 'SC' },
  { user: 'NileHawk', game: 'Reactoonz', amount: '220,000 GC', multiplier: '440x', currency: 'GC' },
  { user: 'SphinxRider', game: 'Dog House Megaways', amount: '6.25 SC', multiplier: '25x', currency: 'SC' },
];

const DOUBLED = [...WINS, ...WINS]; // duplicate for seamless loop

export function LiveWinFeed() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 h-9 flex items-center overflow-hidden"
      style={{
        backgroundColor: '#0C1812',
        borderTop: '1px solid #1A2E22',
        boxShadow: '0 -2px 16px rgba(0,0,0,0.4)',
      }}
    >
      {/* Label */}
      <div
        className="flex items-center gap-2 px-3 h-full flex-shrink-0"
        style={{ borderRight: '1px solid #1A2E22', background: 'linear-gradient(135deg, rgba(45,201,122,0.12), rgba(240,178,50,0.08))' }}
      >
        <span className="live-dot" />
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#2DC97A' }}>
          Live Wins
        </span>
      </div>

      {/* Scrolling items */}
      <div className="flex-1 overflow-hidden">
        <div className="marquee-track">
          {DOUBLED.map((win, i) => (
            <div key={i} className="flex items-center gap-1.5 px-4 flex-shrink-0">
              {/* Separator */}
              <span style={{ color: '#1A2E22', fontSize: 16 }}>•</span>

              {/* User */}
              <span className="text-[11px] font-semibold" style={{ color: '#8FA899' }}>
                {win.user}
              </span>

              {/* Game */}
              <span className="text-[11px]" style={{ color: '#4A6A55' }}>won on</span>
              <span className="text-[11px] font-medium" style={{ color: '#F5E8C8' }}>
                {win.game}
              </span>

              {/* Amount */}
              <span
                className="text-[11px] font-bold number-display px-1.5 py-0.5 rounded"
                style={{
                  color: win.currency === 'GC' ? '#F0B232' : '#10B981',
                  backgroundColor: win.currency === 'GC' ? 'rgba(240,178,50,0.12)' : 'rgba(16,185,129,0.12)',
                }}
              >
                {win.amount}
              </span>

              {/* Multiplier */}
              <span className="text-[10px] font-bold" style={{ color: '#2DC97A' }}>
                @{win.multiplier}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
