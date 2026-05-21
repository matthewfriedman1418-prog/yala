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
          {/* Mobile overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeChat}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-80 z-50 flex flex-col border-l border-[#1E1E1E]"
            style={{ backgroundColor: '#0A0A0A' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#1E1E1E] flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#D6A84F]" />
                <span className="font-semibold text-sm text-[#F5E8C8]">Live Chat</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-medium">247 online</span>
                </div>
              </div>
              <button onClick={closeChat} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4 text-[#9CA3AF]" />
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
            <div className="flex-shrink-0 px-3 py-3 border-t border-[#1E1E1E]">
              {isLoggedIn ? (
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Say something..."
                    className="flex-1 px-3 py-2 rounded-lg text-xs bg-white/5 border border-[#2a2a2a] text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50 transition-colors"
                    maxLength={200}
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-lg transition-all hover:opacity-80"
                    style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
                  >
                    <Send className="w-3.5 h-3.5 text-black" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => openAuthModal()}
                  className="w-full py-2 rounded-lg text-xs font-semibold text-black"
                  style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
                >
                  Login to Chat
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
