'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { MOCK_CHAT } from '@/lib/mock-data/chat';
import { formatTime, getVIPColor } from '@/lib/utils';
import { X, Send, Pin, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { YalaAvatar } from '@/components/ui/YalaAvatar';
import { YalaIcon } from '@/components/ui/YalaIcon';

type RoomId = 'public' | 'vip' | 'originals';
const ROOMS: { id: RoomId; label: string; vipOnly?: boolean }[] = [
  { id: 'public',    label: 'Public' },
  { id: 'vip',       label: 'VIP',     vipOnly: true },
  { id: 'originals', label: 'Originals' },
];

const PINNED = {
  text: 'Welcome to Yala chat — be cool, no spam, no shilling. Have fun.',
  by: 'Yala Team',
};

const MAX_MSG = 240;

export function GlobalChat() {
  const { chatOpen, closeChat, openAuthModal } = useUIStore();
  const { isLoggedIn, user } = useAuthStore();
  const [room,     setRoom]     = useState<RoomId>('public');
  const [message,  setMessage]  = useState('');
  const [messages, setMessages] = useState(MOCK_CHAT);
  const bottomRef = useRef<HTMLDivElement>(null);

  // VIP gating
  const userVipTier = user?.vipTier || 0;
  const canEnterVip = userVipTier >= 4;
  const effectiveRoom = room === 'vip' && !canEnterVip ? 'public' : room;

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [chatOpen, effectiveRoom]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isLoggedIn) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `cm_${Date.now()}`,
        userId: user?.id || 'u0',
        username: user?.displayName || user?.username || 'You',
        avatar: user?.avatar || 'U',
        vipTier: user?.vipTier || 1,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);
    setMessage('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  // Mock "people typing" — varies per room for personality
  const typing = useMemo(() => {
    if (effectiveRoom === 'vip') return ['Diamond_007'];
    if (effectiveRoom === 'originals') return ['CrashKing', 'PlinkoPro'];
    return ['NightHunter', 'SaharaFox', 'GoldRushKing'];
  }, [effectiveRoom]);

  const onlineCount = effectiveRoom === 'vip' ? 38 : effectiveRoom === 'originals' ? 412 : 2847;

  return (
    <AnimatePresence>
      {chatOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 top-14 bg-black/55 z-39 lg:hidden"
            onClick={closeChat}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed right-0 top-14 bottom-0 w-[340px] z-40 flex flex-col"
            style={{ backgroundColor: '#0C1812', borderLeft: '1px solid #1A2E22' }}
          >
            {/* ── Header ─────────────────────────────────────── */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid #1A2E22' }}
            >
              <div className="flex items-center gap-2">
                <YalaIcon name="sparkle" size={16} />
                <span className="font-display text-sm font-bold" style={{ color: '#F5E8C8' }}>Live Chat</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,201,122,0.1)', border: '1px solid rgba(45,201,122,0.2)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold number-display" style={{ color: '#2DC97A' }}>
                    {onlineCount.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={closeChat}
                aria-label="Close chat"
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" style={{ color: '#8FA899' }} />
              </button>
            </div>

            {/* ── Room pills ─────────────────────────────────── */}
            <div
              className="flex gap-1 px-3 py-2 flex-shrink-0 overflow-x-auto no-scrollbar"
              style={{ borderBottom: '1px solid #1A2E22' }}
            >
              {ROOMS.map((r) => {
                const isActive = effectiveRoom === r.id;
                const locked = r.vipOnly && !canEnterVip;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRoom(r.id)}
                    disabled={locked}
                    title={locked ? 'VIP Tier 4+ required' : undefined}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex-shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={isActive
                      ? { background: 'rgba(240,178,50,0.12)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.28)' }
                      : { color: '#8FA899', border: '1px solid transparent' }
                    }
                  >
                    {locked && <YalaIcon name="lock" size={9} />}
                    {r.label}
                    {r.id === 'vip' && (
                      <span
                        className="text-[8px] font-mono font-bold"
                        style={{ color: isActive ? '#F0B232' : '#4A6A55' }}
                      >
                        T4+
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Pinned announcement ────────────────────────── */}
            <div
              className="flex items-start gap-2 px-3 py-2.5 flex-shrink-0"
              style={{ background: 'rgba(240,178,50,0.04)', borderBottom: '1px solid #1A2E22' }}
            >
              <Pin className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#F0B232' }} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] leading-relaxed" style={{ color: '#F5E8C8' }}>{PINNED.text}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: '#F0B232' }}>— {PINNED.by}</p>
              </div>
            </div>

            {/* ── Messages ───────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 no-scrollbar">
              {messages.length === 0
                ? <ChatEmpty />
                : messages.map((msg) => <ChatRow key={msg.id} msg={msg} />)
              }
              <div ref={bottomRef} />
            </div>

            {/* ── Typing indicator ───────────────────────────── */}
            {typing.length > 0 && (
              <div className="flex-shrink-0 px-3 py-1.5" style={{ borderTop: '1px solid #1A2E22' }}>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#2DC97A', animationDelay: '0ms' }} />
                    <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#2DC97A', animationDelay: '150ms' }} />
                    <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: '#2DC97A', animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px]" style={{ color: '#8FA899' }}>
                    <span className="font-bold" style={{ color: '#F5E8C8' }}>{typing[0]}</span>
                    {typing.length > 1 && ` + ${typing.length - 1} other${typing.length > 2 ? 's' : ''}`} typing…
                  </span>
                </div>
              </div>
            )}

            {/* ── Input ──────────────────────────────────────── */}
            <div className="flex-shrink-0 px-3 py-3" style={{ borderTop: '1px solid #1A2E22' }}>
              {isLoggedIn ? (
                <form onSubmit={handleSend} className="space-y-1.5">
                  <div className="relative flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Emoji"
                      title="Emoji picker (coming soon)"
                      className="p-2 rounded-lg transition-colors hover:bg-white/5"
                      style={{ color: '#8FA899' }}
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, MAX_MSG))}
                      placeholder="Say something…"
                      className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid #1A2E22',
                        color: '#F5E8C8',
                      }}
                      onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(240,178,50,0.4)')}
                      onBlur={(e) => (e.currentTarget.style.borderColor = '#1A2E22')}
                      maxLength={MAX_MSG}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      aria-label="Send"
                      className="p-2 rounded-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #2DC97A, #F0B232)',
                      }}
                    >
                      <Send className="w-3.5 h-3.5" style={{ color: '#060E0A' }} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[9px]" style={{ color: '#4A6A55' }}>
                      Enter to send · Be cool
                    </p>
                    <p
                      className="text-[9px] font-mono font-bold"
                      style={{ color: message.length > MAX_MSG - 30 ? '#F59E0B' : '#4A6A55' }}
                    >
                      {message.length}/{MAX_MSG}
                    </p>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => openAuthModal()}
                  className="w-full py-2.5 rounded-lg text-xs font-black transition-all hover:brightness-110 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #2DC97A, #F0B232)',
                    color: '#060E0A',
                    boxShadow: '0 2px 12px rgba(45,201,122,0.3)',
                  }}
                >
                  Sign in to chat
                </button>
              )}
            </div>

            {/* ── Socials row ────────────────────────────────── */}
            <div
              className="flex-shrink-0 flex items-center justify-between px-3 py-2.5"
              style={{ borderTop: '1px solid #1A2E22', background: '#0A1410' }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8FA899' }}>
                Join the community
              </span>
              <div className="flex items-center gap-1.5">
                <SocialIcon network="discord"   href="https://discord.gg/yala" />
                <SocialIcon network="x"         href="https://x.com/playyala" />
                <SocialIcon network="instagram" href="https://instagram.com/playyala" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Chat row — renders the 3 message kinds (rain / tip / regular)
function ChatRow({ msg }: { msg: typeof MOCK_CHAT[number] }) {
  const tierColor = getVIPColor(msg.vipTier);

  if (msg.isRain) {
    return (
      <div
        className="rounded-xl p-3 my-2 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(240,178,50,0.10), rgba(45,201,122,0.06))',
          border: '1px solid rgba(240,178,50,0.28)',
        }}
      >
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <YalaIcon name="sparkle" size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#F0B232' }}>
            Rain
          </span>
        </div>
        <p className="text-[12px] font-bold leading-snug" style={{ color: '#F5E8C8' }}>
          <span style={{ color: tierColor }}>{msg.username}</span>{' '}
          rained{' '}
          <span className="number-display font-black" style={{ color: '#F0B232' }}>
            {msg.rainAmount?.toLocaleString()}
          </span>{' '}
          <span className="text-[10px]" style={{ color: '#8FA899' }}>{msg.currency}</span>
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: '#8FA899' }}>
          Recipients picked at random from active chatters
        </p>
      </div>
    );
  }

  if (msg.isTip) {
    return (
      <div
        className="rounded-xl px-3 py-2 my-1.5"
        style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.22)' }}
      >
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <YalaIcon name="gift" size={11} />
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#A78BFA' }}>Tip</span>
        </div>
        <p className="text-[11px] text-center leading-snug" style={{ color: '#F5E8C8' }}>
          <span style={{ color: tierColor }}>{msg.username}</span>{' '}
          tipped{' '}
          <span className="font-bold number-display" style={{ color: '#F0B232' }}>{msg.tipAmount} GC</span>{' '}
          to{' '}
          <span style={{ color: '#F0B232' }}>{msg.tipTo}</span>
        </p>
      </div>
    );
  }

  // Regular message
  return (
    <div className="group flex gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/[0.025]">
      <YalaAvatar
        initials={msg.avatar}
        tier={msg.vipTier}
        size={28}
        hideBadge
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="font-bold text-[11px] truncate" style={{ color: tierColor }}>
            {msg.username}
          </span>
          <span
            className="text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: '#4A6A55' }}
          >
            {formatTime(msg.timestamp)}
          </span>
        </div>
        <p className="text-[12px] leading-relaxed break-words" style={{ color: '#F5E8C8' }}>
          {msg.message}
        </p>
      </div>
    </div>
  );
}

function ChatEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: 'rgba(240,178,50,0.06)', border: '1px solid rgba(240,178,50,0.18)' }}
      >
        <YalaIcon name="sparkle" size={22} />
      </div>
      <p className="text-sm font-bold mb-1" style={{ color: '#F5E8C8' }}>It&apos;s quiet in here</p>
      <p className="text-[11px]" style={{ color: '#8FA899' }}>Be the first to say something.</p>
    </div>
  );
}

// Square social button at the bottom of the chat panel.
function SocialIcon({ network, href }: { network: 'discord' | 'x' | 'instagram'; href: string }) {
  const HOVER = '#F0B232';
  const label =
    network === 'discord'   ? 'Discord' :
    network === 'x'         ? 'X (Twitter)' :
    'Instagram';
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid #1A2E22',
        color: '#8FA899',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = HOVER; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#8FA899'; }}
    >
      {network === 'discord' && (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path d="M20.32 4.37A19.79 19.79 0 0 0 16.56 3.2a.07.07 0 0 0-.08.04 13.6 13.6 0 0 0-.6 1.23 18.34 18.34 0 0 0-5.47 0 12.7 12.7 0 0 0-.61-1.23.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-3.77 1.17.07.07 0 0 0-.03.03C2.7 8.04 2.1 11.6 2.4 15.12a.09.09 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.02.08.08 0 0 0 .08-.03 14.2 14.2 0 0 0 1.22-1.99.08.08 0 0 0-.04-.1 13.13 13.13 0 0 1-1.87-.89.08.08 0 0 1 0-.13c.13-.1.25-.2.37-.3a.08.08 0 0 1 .08-.01c3.93 1.8 8.18 1.8 12.06 0a.08.08 0 0 1 .08.01c.12.1.24.2.37.3a.08.08 0 0 1 0 .13c-.6.35-1.22.65-1.87.89a.08.08 0 0 0-.04.1c.36.7.77 1.37 1.22 1.99a.08.08 0 0 0 .08.03 19.84 19.84 0 0 0 6-3.02.08.08 0 0 0 .03-.06c.36-4.05-.6-7.58-2.55-10.72a.06.06 0 0 0-.03-.03zM8.52 13.04c-1.18 0-2.16-1.08-2.16-2.4 0-1.34.96-2.42 2.16-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.32-.96 2.4-2.16 2.4zm6.99 0c-1.19 0-2.16-1.08-2.16-2.4 0-1.34.95-2.42 2.16-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.32-.95 2.4-2.16 2.4z"/>
        </svg>
      )}
      {network === 'x' && (
        <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/>
        </svg>
      )}
      {network === 'instagram' && (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      )}
    </a>
  );
}
