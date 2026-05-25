'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { YalaAvatar } from '@/components/ui/YalaAvatar';
import { YalaIcon } from '@/components/ui/YalaIcon';
import { getVIPColor, getVIPName, formatGC } from '@/lib/utils';
import { Lock } from 'lucide-react';

// ── EmojiPicker ─────────────────────────────────────────────────────────────
const EMOJI_GROUPS: { label: string; chars: string[] }[] = [
  { label: 'Smileys', chars: ['😀','😂','🤣','😍','😎','🤔','😅','😭','🥳','🤩','😏','😮','🫡','🙃','😴','🤯'] },
  { label: 'Hands',   chars: ['👍','👎','👏','🙌','🙏','💪','🤝','✊','👊','🤞','🤙','👌','🫶','🤘','🤝','🫵'] },
  { label: 'Hearts',  chars: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❣️','💕','💖','💘','💝','💗','💓'] },
  { label: 'Casino',  chars: ['🎰','🎲','🃏','♠️','♥️','♦️','♣️','🏆','🥇','💎','🔥','⚡','✨','🍀','🌟','🎯'] },
  { label: 'Money',   chars: ['💰','💵','💸','💳','🪙','💲','📈','📉','🤑','🏦','💎','💼','🎁','🎟️','🎫','🪄'] },
];

interface EmojiPickerProps {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
  anchor?: 'bottom-left' | 'top-left';
}

export function EmojiPicker({ open, onClose, onPick, anchor = 'bottom-left' }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    setTimeout(() => document.addEventListener('mousedown', handle), 0);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', esc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: anchor === 'bottom-left' ? -8 : 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 26, stiffness: 380 }}
      className={`absolute left-0 z-50 w-[280px] rounded-xl overflow-hidden shadow-2xl ${anchor === 'bottom-left' ? 'bottom-full mb-2' : 'top-full mt-2'}`}
      style={{
        background: '#0F1A14',
        border: '1px solid #1A2E22',
        boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
      }}
    >
      <div className="max-h-[280px] overflow-y-auto p-3 no-scrollbar">
        {EMOJI_GROUPS.map((g) => (
          <div key={g.label} className="mb-3 last:mb-0">
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#8FA899' }}>
              {g.label}
            </p>
            <div className="grid grid-cols-8 gap-1">
              {g.chars.map((c, i) => (
                <button
                  key={i}
                  onClick={() => { onPick(c); onClose(); }}
                  className="aspect-square rounded-md text-base flex items-center justify-center transition-all hover:bg-white/10 hover:scale-110"
                  aria-label={`Insert ${c}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── UserProfilePopover ──────────────────────────────────────────────────────
export interface ChatUserStats {
  id: string;
  username: string;
  avatar: string;
  vipTier: number;
  joinDate?: string;       // e.g. '2024-08-12'
  totalWagered?: number;   // in GC equivalent
  totalSCWon?: number;     // in SC
  biggestWin?: { game: string; multiplier: number };
  country?: string;
  private?: boolean;       // if true, stats are blurred and replaced with 'Private'
  isYou?: boolean;
}

interface UserProfilePopoverProps {
  user: ChatUserStats;
  open: boolean;
  onClose: () => void;
  /** Anchor position (the chat row that was clicked). Position is fixed in the document. */
  anchorRect: { top: number; left: number } | null;
}

export function UserProfilePopover({ user, open, onClose, anchorRect }: UserProfilePopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    setTimeout(() => document.addEventListener('mousedown', handle), 0);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', esc);
    };
  }, [open, onClose]);

  if (!open || !anchorRect) return null;

  const tierColor = getVIPColor(user.vipTier);
  const isPrivate = user.private && !user.isYou;

  // Position to the LEFT of the chat panel so it doesn't overflow
  const top  = Math.min(anchorRect.top, window.innerHeight - 320);
  const left = Math.max(16, anchorRect.left - 280);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 12, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className="fixed z-[60] w-[260px] rounded-2xl overflow-hidden shadow-2xl"
      style={{
        top, left,
        background: '#0F1A14',
        border: `1px solid ${tierColor}40`,
        boxShadow: `0 20px 50px rgba(0,0,0,0.7), 0 0 28px ${tierColor}14`,
      }}
    >
      {/* Header — avatar + name + tier */}
      <div
        className="px-4 pt-4 pb-3 flex items-center gap-3"
        style={{
          borderBottom: '1px solid #1A2E22',
          background: `radial-gradient(ellipse at 0% 100%, ${tierColor}10, transparent 60%)`,
        }}
      >
        <YalaAvatar initials={user.avatar} tier={user.vipTier} size={44} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold truncate" style={{ color: '#F5E8C8' }}>
            {user.username}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tierColor }}>
            {getVIPName(user.vipTier)} · Tier {user.vipTier}
          </p>
        </div>
      </div>

      {/* Stats — blurred if private */}
      <div className="px-4 py-3 space-y-2 relative">
        {isPrivate && (
          <div
            className="absolute inset-0 z-10 backdrop-blur-sm flex flex-col items-center justify-center"
            style={{ background: 'rgba(15,26,20,0.7)' }}
          >
            <Lock className="w-4 h-4 mb-1" style={{ color: '#8FA899' }} />
            <p className="text-[11px] font-bold" style={{ color: '#F5E8C8' }}>Private profile</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#8FA899' }}>Stats hidden by this user</p>
          </div>
        )}

        <StatRow label="Member since"  value={user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'} />
        <StatRow label="Total wagered" value={user.totalWagered ? `${formatGC(user.totalWagered)} GC` : '—'} />
        <StatRow label="Sweep wins"    value={user.totalSCWon != null ? `${user.totalSCWon.toFixed(2)} SC` : '—'} />
        {user.biggestWin && (
          <StatRow
            label="Biggest hit"
            value={
              <span className="flex items-center gap-1">
                <span style={{ color: '#F5E8C8' }}>{user.biggestWin.game}</span>
                <span className="font-mono font-bold" style={{ color: '#F0B232' }}>
                  {user.biggestWin.multiplier}×
                </span>
              </span>
            }
          />
        )}
      </div>

      {/* Actions */}
      <div
        className="grid grid-cols-2 gap-1.5 p-2"
        style={{ borderTop: '1px solid #1A2E22', background: '#0A1410' }}
      >
        {user.isYou ? (
          <>
            <Link
              href="/profile"
              onClick={onClose}
              className="text-center py-2 rounded-lg text-xs font-bold transition-all hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#F5E8C8' }}
            >
              Edit profile
            </Link>
            <Link
              href="/profile"
              onClick={onClose}
              className="text-center py-2 rounded-lg text-xs font-black transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #F0B232, #FFD166)', color: '#060E0A' }}
            >
              Privacy
            </Link>
          </>
        ) : (
          <>
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22', color: '#8FA899' }}
            >
              Block
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #F0B232, #FFD166)', color: '#060E0A' }}
            >
              <YalaIcon name="gift" size={12} />
              Tip
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#8FA899' }}>{label}</span>
      <span className="text-xs font-bold" style={{ color: '#F5E8C8' }}>{value}</span>
    </div>
  );
}
