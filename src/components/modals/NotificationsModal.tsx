'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store/ui';
import { useWalletStore } from '@/lib/store/wallet';
import { useNotificationsStore, type NotifKind, type Notification } from '@/lib/store/notifications';
import { useModalA11y } from '@/lib/hooks/useModalA11y';
import { formatGC } from '@/lib/utils';
import {
  X, CheckCircle2, TrendingUp, Trophy, Bell, CloudRain, Gift, Crown, Sparkles, Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { YalaIcon } from '@/components/ui/YalaIcon';

/**
 * Notifications modal — drops down from the Bell in the header.
 *
 * Holds the user's rakeback claim plus a preview of the latest notifications
 * (backed by the notifications store, same data the /notifications inbox uses).
 */

function IconBadge({ kind }: { kind: NotifKind }) {
  switch (kind) {
    case 'race':    return <Trophy     className="w-4 h-4 text-[#F0B232]" />;
    case 'mission': return <YalaIcon name="badge-star" size={16} />;
    case 'level':   return <Crown     className="w-4 h-4 text-[#FFD166]" />;
    case 'promo':   return <Gift      className="w-4 h-4 text-[#F0B232]" />;
    case 'rain':    return <CloudRain className="w-4 h-4 text-[#60A5FA]" />;
    case 'win':     return <TrendingUp className="w-4 h-4 text-[#2DC97A]" />;
    case 'tip':     return <Sparkles  className="w-4 h-4 text-[#F472B6]" />;
    case 'system':  return <Bell      className="w-4 h-4 text-[#8FA899]" />;
  }
}

function relTime(ts: string): string {
  const t   = new Date(ts).getTime();
  const now = Date.now();
  const sec = Math.floor((now - t) / 1000);
  if (sec < 60)             return `${sec}s ago`;
  if (sec < 60 * 60)        return `${Math.floor(sec / 60)}m ago`;
  if (sec < 60 * 60 * 24)   return `${Math.floor(sec / 60 / 60)}h ago`;
  return `${Math.floor(sec / 60 / 60 / 24)}d ago`;
}

export function NotificationsModal() {
  const { notificationsOpen, closeNotifications } = useUIStore();
  const { rakebackBalance, claimRakeback } = useWalletStore();
  const items       = useNotificationsStore((s) => s.items);
  const markRead    = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const [claimed, setClaimed] = useState(false);
  const router = useRouter();
  useModalA11y(notificationsOpen, closeNotifications);

  // Show the 5 most-recent in the dropdown; full view lives on /notifications
  const preview     = items.slice(0, 5);
  const unreadTotal = items.filter((n) => n.unread).length;

  const handleClaim = () => {
    if (rakebackBalance <= 0) return;
    const amount = rakebackBalance;
    claimRakeback();
    setClaimed(true);
    toast.success('Rakeback claimed', {
      description: `${amount.toLocaleString()} GC added to your wallet.`,
    });
    setTimeout(() => setClaimed(false), 2500);
  };

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeNotifications}
            className="fixed inset-0 z-50 bg-black/40"
            style={{ backdropFilter: 'blur(2px)' }}
          />

          {/* Panel — anchored top-right, drops down */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,   scale: 1   }}
            exit={{    opacity: 0, y: -8,  scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed right-4 top-[68px] z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: '#0F1A14',
              border: '1px solid #1A2E22',
              boxShadow: '0 20px 50px rgba(0,0,0,0.55)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1A2E22' }}>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" style={{ color: '#F0B232' }} />
                <h3 className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Notifications</h3>
                {unreadTotal > 0 && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(45,201,122,0.12)', color: '#2DC97A' }}
                  >
                    {unreadTotal} new
                  </span>
                )}
              </div>
              <button onClick={closeNotifications} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" style={{ color: '#8FA899' }} />
              </button>
            </div>

            {/* Rakeback claim row — the action that moved off the Rewards page */}
            <div className="p-3" style={{ borderBottom: '1px solid #1A2E22', background: 'rgba(45,201,122,0.04)' }}>
              <div className="flex items-center gap-3 rounded-xl p-3"
                style={{
                  background: rakebackBalance > 0
                    ? 'linear-gradient(135deg, rgba(45,201,122,0.10), rgba(45,201,122,0.04))'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${rakebackBalance > 0 ? 'rgba(45,201,122,0.28)' : '#1A2E22'}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(45,201,122,0.15)', border: '1px solid rgba(45,201,122,0.28)' }}
                >
                  <TrendingUp className="w-5 h-5 text-[#2DC97A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Rakeback ready</p>
                  <p className="text-xs number-display" style={{ color: '#8FA899' }}>
                    {formatGC(rakebackBalance)} GC earned from wagering
                  </p>
                </div>
                <button
                  onClick={handleClaim}
                  disabled={rakebackBalance <= 0 || claimed}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                  style={{
                    background: claimed ? 'rgba(45,201,122,0.18)' : 'linear-gradient(135deg, #2DC97A, #10B981)',
                    color: claimed ? '#2DC97A' : '#060E0A',
                  }}
                >
                  {claimed
                    ? <><CheckCircle2 className="w-3 h-3" /> Claimed</>
                    : 'Claim'}
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-[420px] overflow-y-auto no-scrollbar">
              {preview.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-6 h-6 mx-auto mb-2" style={{ color: '#4A6A55' }} />
                  <p className="text-xs" style={{ color: '#8FA899' }}>You&apos;re all caught up.</p>
                </div>
              ) : preview.map((n: Notification) => {
                const handleClick = () => {
                  markRead(n.id);
                  if (n.href) router.push(n.href);
                  closeNotifications();
                };
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={handleClick}
                    className="w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5"
                    style={{ borderBottom: '1px solid rgba(26,46,34,0.55)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2E22' }}
                    >
                      <IconBadge kind={n.kind} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs leading-snug ${n.unread ? 'font-bold' : 'font-semibold'}`} style={{ color: n.unread ? '#F5E8C8' : '#C5BBA0' }}>
                          {n.title}
                        </p>
                        {n.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5 leading-snug truncate" style={{ color: '#8FA899' }}>{n.body}</p>
                      <p className="text-[10px] mt-1 font-mono" style={{ color: '#4A6A55' }}>{relTime(n.ts)}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 flex items-center justify-between gap-3" style={{ background: '#0A1410', borderTop: '1px solid #1A2E22' }}>
              <div className="flex items-center gap-2">
                {unreadTotal > 0 && (
                  <button
                    className="text-[11px] font-semibold transition-colors hover:text-[#F5E8C8]"
                    style={{ color: '#8FA899' }}
                    onClick={() => { markAllRead(); toast.success('All marked as read'); }}
                  >
                    Mark all read
                  </button>
                )}
                <Link
                  href="/settings"
                  onClick={closeNotifications}
                  className="text-[11px] font-semibold transition-colors hover:text-[#F5E8C8] flex items-center gap-1"
                  style={{ color: '#8FA899' }}
                  title="Notification settings"
                >
                  <Settings className="w-3 h-3" />
                </Link>
              </div>
              <Link
                href="/notifications"
                onClick={closeNotifications}
                className="text-[11px] font-bold transition-colors hover:text-[#F0B232]"
                style={{ color: '#F0B232' }}
              >
                View all →
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
