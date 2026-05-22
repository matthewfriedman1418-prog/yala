'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { Users, Plus, Lock, Eye, Zap } from 'lucide-react';

const MOCK_ROOMS = [
  { id: 'r1', name: "GoldDuneKing's Palace", host: 'GoldDuneKing', players: 24, maxPlayers: 50, game: 'Mirage Crash', currency: 'GC', isLive: true, isPrivate: false },
  { id: 'r2', name: 'SC Grinders Only', host: 'OasisHunter', players: 8, maxPlayers: 20, game: 'Dune Mines', currency: 'SC', isLive: true, isPrivate: false },
  { id: 'r3', name: 'Pharaoh Tower Climbers', host: 'EmeraldDunes', players: 15, maxPlayers: 30, game: "Pharaoh's Towers", currency: 'GC', isLive: true, isPrivate: false },
  { id: 'r4', name: 'VIP Lounge (Private)', host: 'Sheikh99', players: 5, maxPlayers: 10, game: 'Desert Roulette', currency: 'SC', isLive: true, isPrivate: true },
  { id: 'r5', name: 'Plinko Party', host: 'SandstormX', players: 18, maxPlayers: 40, game: 'Oasis Plinko', currency: 'GC', isLive: false, isPrivate: false },
  { id: 'r6', name: 'Keno Run Tonight', host: 'NightBazaar7', players: 0, maxPlayers: 25, game: 'Caravan Keno', currency: 'GC', isLive: false, isPrivate: false },
];

const CURRENCY_COLOR: Record<string, string> = { GC: '#D6A84F', SC: '#10B981' };

export default function RoomsPage() {
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomCurrency, setRoomCurrency] = useState<'GC' | 'SC'>('GC');

  const handleJoin = (room: typeof MOCK_ROOMS[0]) => {
    if (!isLoggedIn) { openAuthModal(); return; }
    alert(`Joining "${room.name}": demo mode. Room functionality coming soon!`);
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 border border-[#1E1E1E]"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(214,168,79,0.1) 0%, transparent 60%), #0A0A0A' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" style={{ color: '#D6A84F' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D6A84F' }}>Rooms</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Play Together</h1>
            <p className="text-sm max-w-lg" style={{ color: '#9CA3AF' }}>Join rooms to watch and play alongside creators and the Yala community.</p>
          </div>
          <button
            onClick={() => isLoggedIn ? setShowCreate(true) : openAuthModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
          >
            <Plus className="w-4 h-4" /> Create Room
          </button>
        </div>
      </div>

      {/* Create room modal */}
      {showCreate && (
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>Create a Room</h3>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room name..."
            className="w-full px-4 py-3 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
          />
          <div className="flex gap-2">
            <button onClick={() => setRoomCurrency('GC')} className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all" style={roomCurrency === 'GC' ? { background: 'linear-gradient(135deg, #D6A84F, #F0C97A)', color: '#000' } : { background: 'rgba(255,255,255,0.05)', border: '1px solid #1E1E1E', color: '#9CA3AF' }}>◈ Gold Coins</button>
            <button onClick={() => setRoomCurrency('SC')} className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all" style={roomCurrency === 'SC' ? { background: 'linear-gradient(135deg, #10B981, #34D399)', color: '#000' } : { background: 'rgba(255,255,255,0.05)', border: '1px solid #1E1E1E', color: '#9CA3AF' }}>◇ Sweep Coins</button>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl text-sm border" style={{ borderColor: '#2a2a2a', color: '#9CA3AF' }}>Cancel</button>
            <button
              onClick={() => { setShowCreate(false); alert('Room created! Demo mode: full room functionality coming soon.'); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black"
              style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
            >
              Create Room
            </button>
          </div>
        </div>
      )}

      {/* Live rooms */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h2 className="font-semibold" style={{ color: '#F5E8C8' }}>Live Rooms</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_ROOMS.filter((r) => r.isLive).map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 uppercase">Live</span>
                    {room.isPrivate && <Lock className="w-3 h-3 text-[#9CA3AF]" />}
                  </div>
                  <p className="font-semibold text-sm" style={{ color: '#F5E8C8' }}>{room.name}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>Hosted by {room.host}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3 text-xs" style={{ color: '#9CA3AF' }}>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" style={{ color: CURRENCY_COLOR[room.currency] }} />
                  {room.game}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {room.players}/{room.maxPlayers}
                </div>
                <div className="flex items-center gap-1">
                  <span style={{ color: CURRENCY_COLOR[room.currency] }}>{room.currency === 'GC' ? '◈' : '◇'}</span>
                  {room.currency}
                </div>
              </div>

              {/* Player count bar */}
              <div className="h-1 rounded-full overflow-hidden mb-3" style={{ background: '#1E1E1E' }}>
                <div className="h-full rounded-full" style={{ width: `${(room.players / room.maxPlayers) * 100}%`, background: CURRENCY_COLOR[room.currency] }} />
              </div>

              <button
                onClick={() => handleJoin(room)}
                className="w-full py-2 rounded-lg text-xs font-semibold text-black transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${CURRENCY_COLOR[room.currency]}, ${room.currency === 'GC' ? '#F0C97A' : '#34D399'})` }}
              >
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                Join Room
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upcoming rooms */}
      <div>
        <h2 className="font-semibold mb-4" style={{ color: '#F5E8C8' }}>Upcoming Rooms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_ROOMS.filter((r) => !r.isLive).map((room) => (
            <div key={room.id} className="glass-card p-4 opacity-70">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 uppercase">Upcoming</span>
              </div>
              <p className="font-semibold text-sm mb-1" style={{ color: '#F5E8C8' }}>{room.name}</p>
              <p className="text-xs mb-3" style={{ color: '#9CA3AF' }}>Hosted by {room.host} · {room.game} · {room.currency}</p>
              <button onClick={() => handleJoin(room)} className="w-full py-2 rounded-lg text-xs font-semibold border transition-all hover:bg-white/5" style={{ borderColor: '#2a2a2a', color: '#9CA3AF' }}>
                Notify Me
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">18+ · No Purchase Necessary · Void Where Prohibited</p>
      </div>
    </div>
  );
}
