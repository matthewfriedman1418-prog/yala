'use client';
import { useState } from 'react';
import { useWalletStore } from '@/lib/store/wallet';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { BarChart3, Clock, Star, Zap } from 'lucide-react';

const SPORTS = ['Football', 'Basketball', 'Tennis', 'MMA', 'Soccer', 'Baseball', 'Esports', 'Cricket'];
const LIVE_EVENTS = [
  { id: 1, sport: 'Basketball', home: 'Lakers', away: 'Celtics', homeScore: 87, awayScore: 82, time: 'Q3 8:42', homeOdds: '+115', awayOdds: '-135' },
  { id: 2, sport: 'Tennis', home: 'Djokovic', away: 'Alcaraz', homeScore: 6, awayScore: 4, time: 'Set 2 3-2', homeOdds: '-180', awayOdds: '+155' },
  { id: 3, sport: 'Soccer', home: 'Real Madrid', away: 'Barcelona', homeScore: 1, awayScore: 1, time: "68'", homeOdds: '+210', awayOdds: '+205' },
];
const UPCOMING = [
  { id: 4, sport: 'Football', home: 'Chiefs', away: 'Eagles', time: 'Sun 4:25 PM', homeOdds: '-145', awayOdds: '+125', drawOdds: null },
  { id: 5, sport: 'MMA', home: 'Jones', away: 'Stipe', time: 'Sat 10:00 PM', homeOdds: '-220', awayOdds: '+185', drawOdds: null },
  { id: 6, sport: 'Soccer', home: 'Man City', away: 'Arsenal', time: 'Sat 3:00 PM', homeOdds: '+140', awayOdds: '+195', drawOdds: '+230' },
  { id: 7, sport: 'Tennis', home: 'Sinner', away: 'Zverev', time: 'Mon 1:00 PM', homeOdds: '-165', awayOdds: '+140', drawOdds: null },
  { id: 8, sport: 'Esports', home: 'Team Liquid', away: 'Natus Vincere', time: 'Fri 8:00 PM', homeOdds: '+105', awayOdds: '-125', drawOdds: null },
];

export default function SportsbookPage() {
  const { activeCurrency } = useWalletStore();
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [selectedSport, setSelectedSport] = useState('All');
  const [betSlip, setBetSlip] = useState<{id: number; team: string; odds: string}[]>([]);
  const accent = activeCurrency === 'GC' ? '#D6A84F' : '#10B981';

  const addBet = (id: number, team: string, odds: string) => {
    if (!isLoggedIn) { openAuthModal(); return; }
    setBetSlip((prev) => prev.some((b) => b.id === id) ? prev.filter((b) => b.id !== id) : [...prev, { id, team, odds }]);
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-8 border border-[#1E1E1E]"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.1) 0%, transparent 60%), #0A0A0A' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">Sportsbook</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">Beta</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Yala Sportsbook</h1>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>Live betting, pre-match markets, and in-play action. GC & SC supported.</p>
          </div>
        </div>
      </div>

      {/* Placeholder notice */}
      <div className="px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <p className="text-sm" style={{ color: '#9CA3AF' }}>
          <span className="font-semibold text-blue-400">Sportsbook Preview — </span>
          Odds and events are simulated for demo purposes. No real bets are placed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Sport filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All', ...SPORTS].map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={selectedSport === sport
                  ? { background: accent, color: '#000' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid #1E1E1E', color: '#9CA3AF' }
                }
              >
                {sport}
              </button>
            ))}
          </div>

          {/* Live events */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-sm font-semibold" style={{ color: '#F5E8C8' }}>Live Now</p>
            </div>
            <div className="space-y-3">
              {LIVE_EVENTS.map((ev) => (
                <div key={ev.id} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 uppercase">Live</span>
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>{ev.sport} · {ev.time}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => addBet(ev.id, ev.home, ev.homeOdds)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all hover:border-[#D6A84F]/50"
                      style={{
                        borderColor: betSlip.some((b) => b.id === ev.id && b.team === ev.home) ? '#D6A84F' : '#2a2a2a',
                        background: betSlip.some((b) => b.id === ev.id && b.team === ev.home) ? 'rgba(214,168,79,0.1)' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#F5E8C8' }}>{ev.home}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{ev.homeScore}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#D6A84F' }}>{ev.homeOdds}</span>
                    </button>
                    <button
                      onClick={() => addBet(ev.id, ev.away, ev.awayOdds)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all hover:border-[#D6A84F]/50"
                      style={{
                        borderColor: betSlip.some((b) => b.id === ev.id && b.team === ev.away) ? '#D6A84F' : '#2a2a2a',
                        background: betSlip.some((b) => b.id === ev.id && b.team === ev.away) ? 'rgba(214,168,79,0.1)' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#F5E8C8' }}>{ev.away}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{ev.awayScore}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#D6A84F' }}>{ev.awayOdds}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" style={{ color: '#9CA3AF' }} />
              <p className="text-sm font-semibold" style={{ color: '#F5E8C8' }}>Upcoming</p>
            </div>
            <div className="space-y-2">
              {UPCOMING.map((ev) => (
                <div key={ev.id} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{ev.sport} · {ev.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="flex-1 text-sm font-semibold" style={{ color: '#F5E8C8' }}>{ev.home} vs {ev.away}</p>
                    <div className="flex gap-2">
                      {[
                        { team: ev.home, odds: ev.homeOdds },
                        ...(ev.drawOdds ? [{ team: 'Draw', odds: ev.drawOdds }] : []),
                        { team: ev.away, odds: ev.awayOdds },
                      ].map((opt) => (
                        <button
                          key={opt.team}
                          onClick={() => addBet(ev.id, opt.team, opt.odds)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                          style={{
                            borderColor: betSlip.some((b) => b.id === ev.id && b.team === opt.team) ? accent : '#2a2a2a',
                            color: accent,
                            background: betSlip.some((b) => b.id === ev.id && b.team === opt.team) ? `${accent}15` : 'transparent',
                          }}
                        >
                          {opt.odds}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bet slip */}
        <div className="space-y-4">
          <div className="glass-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1E1E1E] flex items-center justify-between">
              <p className="font-semibold text-sm" style={{ color: '#F5E8C8' }}>Bet Slip</p>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${accent}20`, color: accent }}>{betSlip.length}</span>
            </div>
            {betSlip.length === 0 ? (
              <div className="py-8 text-center px-4">
                <Star className="w-6 h-6 mx-auto mb-2 opacity-30" style={{ color: '#9CA3AF' }} />
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Click odds to add selections</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1E1E1E]">
                {betSlip.map((bet) => {
                  const ev = [...LIVE_EVENTS, ...UPCOMING].find((e) => e.id === bet.id);
                  return (
                    <div key={`${bet.id}-${bet.team}`} className="px-4 py-3">
                      <p className="text-xs font-semibold" style={{ color: '#F5E8C8' }}>{bet.team}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{ev?.home} vs {ev?.away}</p>
                        <span className="text-xs font-bold" style={{ color: accent }}>{bet.odds}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="px-4 py-3 space-y-3">
                  <input
                    placeholder="Bet amount (GC)"
                    className="w-full px-3 py-2 rounded-lg text-xs border text-[#F5E8C8] focus:outline-none number-display"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
                  />
                  <button className="w-full py-2.5 rounded-lg text-sm font-semibold text-black opacity-60 cursor-not-allowed" style={{ background: `linear-gradient(135deg, ${accent}, ${accent === '#D6A84F' ? '#F0C97A' : '#34D399'})` }}>
                    Place Bet (Demo)
                  </button>
                  <button onClick={() => setBetSlip([])} className="w-full text-xs" style={{ color: '#9CA3AF' }}>Clear slip</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">18+ · Demo only · No real bets · Void Where Prohibited</p>
      </div>
    </div>
  );
}
