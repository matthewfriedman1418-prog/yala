'use client';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import type { Game } from '@/lib/mock-data/games';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

interface GameCardProps {
  game: Game;
  size?: 'sm' | 'md' | 'lg';
}

const GAME_COLORS: Record<string, string> = {
  'from-amber-700 to-yellow-900': 'linear-gradient(135deg, #92400e, #713f12)',
  'from-orange-800 to-amber-950': 'linear-gradient(135deg, #9a3412, #431407)',
  'from-blue-900 to-teal-950': 'linear-gradient(135deg, #1e3a8a, #042f2e)',
  'from-yellow-800 to-orange-900': 'linear-gradient(135deg, #92400e, #7c2d12)',
  'from-indigo-900 to-blue-950': 'linear-gradient(135deg, #312e81, #172554)',
  'from-emerald-800 to-green-950': 'linear-gradient(135deg, #065f46, #052e16)',
  'from-teal-800 to-cyan-950': 'linear-gradient(135deg, #115e59, #083344)',
  'from-stone-700 to-amber-900': 'linear-gradient(135deg, #57534e, #431407)',
  'from-orange-700 to-red-900': 'linear-gradient(135deg, #c2410c, #7f1d1d)',
  'from-pink-800 to-rose-950': 'linear-gradient(135deg, #9d174d, #4c0519)',
  'from-amber-600 to-yellow-800': 'linear-gradient(135deg, #d97706, #92400e)',
  'from-purple-900 to-indigo-950': 'linear-gradient(135deg, #4c1d95, #1e1b4b)',
  'from-sky-800 to-blue-950': 'linear-gradient(135deg, #075985, #172554)',
  'from-green-900 to-emerald-950': 'linear-gradient(135deg, #14532d, #022c22)',
  'from-amber-900 to-green-950': 'linear-gradient(135deg, #78350f, #022c22)',
  'from-teal-900 to-emerald-950': 'linear-gradient(135deg, #134e4a, #022c22)',
  'from-stone-800 to-amber-950': 'linear-gradient(135deg, #1c1917, #431407)',
  'from-red-900 to-rose-950': 'linear-gradient(135deg, #7f1d1d, #4c0519)',
  'from-slate-800 to-indigo-950': 'linear-gradient(135deg, #1e293b, #1e1b4b)',
  'from-yellow-900 to-amber-950': 'linear-gradient(135deg, #713f12, #431407)',
  'from-purple-800 to-pink-950': 'linear-gradient(135deg, #6b21a8, #500724)',
  'from-yellow-700 to-orange-900': 'linear-gradient(135deg, #a16207, #7c2d12)',
  'from-red-800 to-orange-950': 'linear-gradient(135deg, #991b1b, #431407)',
  'from-blue-800 to-purple-950': 'linear-gradient(135deg, #1e40af, #2e1065)',
  'from-blue-700 to-purple-900': 'linear-gradient(135deg, #1d4ed8, #4c1d95)',
  'from-green-800 to-teal-950': 'linear-gradient(135deg, #166534, #042f2e)',
  'from-yellow-600 to-amber-800': 'linear-gradient(135deg, #ca8a04, #92400e)',
  'from-green-700 to-emerald-900': 'linear-gradient(135deg, #15803d, #064e3b)',
  'from-blue-800 to-teal-900': 'linear-gradient(135deg, #1e40af, #134e4a)',
  'from-cyan-800 to-blue-950': 'linear-gradient(135deg, #155e75, #172554)',
  'from-amber-700 to-stone-900': 'linear-gradient(135deg, #92400e, #1c1917)',
};

function getGradient(key: string): string {
  return GAME_COLORS[key] || 'linear-gradient(135deg, #1c1917, #0a0a0a)';
}

export function GameCard({ game, size = 'md' }: GameCardProps) {
  const { openComingSoon, openAuthModal } = useUIStore();
  const { isLoggedIn } = useAuthStore();

  const handleClick = () => {
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }
    openComingSoon(game.name);
  };

  const sizeClasses = {
    sm: 'aspect-[4/3]',
    md: 'aspect-[3/4]',
    lg: 'aspect-[2/3]',
  };

  return (
    <button
      onClick={handleClick}
      className={cn('group relative w-full rounded-xl overflow-hidden game-card-hover', sizeClasses[size])}
      style={{ background: getGradient(game.gradient) }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-1">
        {game.isNew && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/80 text-white uppercase tracking-wide">New</span>
        )}
        {game.isHot && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/80 text-white uppercase tracking-wide">Hot</span>
        )}
      </div>

      {/* Play button on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(214,168,79,0.9)' }}>
          <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
        </div>
      </div>

      {/* Game info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-xs font-semibold text-[#F5E8C8] truncate">{game.name}</p>
        <p className="text-[10px] text-[#9CA3AF]">{game.provider}</p>
      </div>
    </button>
  );
}
