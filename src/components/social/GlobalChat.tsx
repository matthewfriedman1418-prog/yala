'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { MOCK_CHAT } from '@/lib/mock-data/chat';
import { formatTime, getVIPColor } from '@/lib/utils';
import { X, Send, CloudRain, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GlobalChat() {
  const { chatOpen, closeChat } = useUIStore();
  const { isLoggedIn, user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_CHAT);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [chatOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isLoggedIn) return;
    const newMsg = {
      id: `cm_${Date.now()}`,
      userId: user?.id || 'u0',
      username: user?.username || 'You',
      avatar: user?.avatar || 'U',
      vipTier: user?.vipTier || 1,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <AnimatePresence>
      {chatOpen && (
        <>
          {/* Mobile overlay — starts below the h-14 header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-14 bg-black/50 z-39 lg:hidden"
            onClick={closeChat}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-14 bottom-0 w-80 z-40 flex flex-col"
            style={{ backgroundColor: '#0C1812', borderLeft: '1px solid #1A2E22' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid #1A2E22' }}>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" style={{ color: '#F0B232' }} />
                <span className="font-semibold text-sm" style={{ color: '#F5E8C8' }}>Live Chat</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,201,122,0.1)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-medium" style={{ color: '#2DC97A' }}>247 online</span>
                </div>
              </div>
              <button onClick={closeChat} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" style={{ color: '#8FA899' }} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 no-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={cn('text-xs leading-relaxed', msg.isRain && 'my-3')}>
                  {msg.isRain ? (
                    <div className="px-3 py-2.5 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, rgba(214,168,79,0.1), rgba(214,168,79,0.05))', border: '1px solid rgba(214,168,79,0.2)' }}>
                      <CloudRain className="w-4 h-4 mx-auto mb-1" style={{ color: '#D6A84F' }} />
                      <p className="font-semibold" style={{ color: '#D6A84F' }}>
                        <span style={{ color: getVIPColor(msg.vipTier) }}>{msg.username}</span>
                        {' '}rained {msg.rainAmount?.toLocaleString()} {msg.currency}!
                      </p>
                      <p className="text-[#9CA3AF] mt-0.5">Lucky recipients shared the gold ✨</p>
                    </div>
                  ) : msg.isTip ? (
                    <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <span style={{ color: getVIPColor(msg.vipTier) }}>{msg.username}</span>
                      <span className="text-[#9CA3AF]"> tipped </span>
                      <span className="text-[#D6A84F] font-semibold">{msg.tipAmount} GC</span>
                      <span className="text-[#9CA3AF]"> to </span>
                      <span style={{ color: '#D6A84F' }}>{msg.tipTo}</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-black mt-0.5"
                        style={{ background: `linear-gradient(135deg, ${getVIPColor(msg.vipTier)}, rgba(0,0,0,0.3))` }}
                      >
                        {msg.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-[11px]" style={{ color: getVIPColor(msg.vipTier) }}>
                            {msg.username}
                          </span>
                          <span className="text-[9px] text-[#9CA3AF]/50">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="text-[#9CA3AF] text-[12px] leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-3 py-3" style={{ borderTop: '1px solid #1A2E22' }}>
              {isLoggedIn ? (
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Say something..."
                    className="flex-1 px-3 py-2 rounded-lg text-xs text-[#F5E8C8] focus:outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}
                    maxLength={200}
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-lg transition-all hover:opacity-80"
                    style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
                  >
                    <Send className="w-3.5 h-3.5 text-black" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => openAuthModal()}
                  className="w-full py-2 rounded-lg text-xs font-bold text-black"
                  style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)' }}
                >
                  Login to Chat
                </button>
              )}
            </div>

            {/* Socials row */}
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

// Small square social link button at the bottom of the chat panel.
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
