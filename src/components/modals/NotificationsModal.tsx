'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useUIStore } from '@/lib/store/ui';
import { useWalletStore } from '@/lib/store/wallet';
import { useModalA11y } from '@/lib/hooks/useModalA11y';
import { formatGC } from '@/lib/utils';
import { X, CheckCircle2, TrendingUp, Trophy, Bell, CloudRain } from 'lucide-react';
import { YalaIcon } from '@/components/ui/YalaIcon';

/**
 * Notifications modal — drops down from the Bell in the header.
 *
 * Holds the user's rakeback claim (the action moved off the Rewards page),
 * plus system notifications: race standings, level-ups, completed missions,
 * promo drops, rain alerts.
 */

type NotifKind = 'rakeback' | 'race' | 'mission' | 'level' | 'promo' | 'rain';

interface MockNotif {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  time: string;       // relative time string
  unread?: boolean;
  href?: string;
}

const MOCK_NOTIFS: MockNotif[] = [
  { id: 'n1', kind: 'race',    title: 'You climbed to #47 in the Daily Race', body: 'Wager 879K GC more to break into the prize tier.',                time: '4m ago',  unread: true, href: '/leaderboards' },
  { id: 'n2', kind: 'mission', title: 'Mission complete · Triple Threat',     body: '+25 SC and 500 XP have been added to your balance.',            time: '1h ago',  unread: true },
  { id: 'n3', kind: 'level',   title: 'Level up · Sahara Sheikh II',          body: 'Your rakeback rate increased to 8% and unlocked Diamond Tier perks.', time: '6h ago' },
  { id: 'n4', kind: 'promo',   title: '3 new promotions just dropped',        body: 'Weekend Reload, Lucky 13 Free Spins, Refer-a-Friend bonus.',   time: '1d ago',  href: '/rewards' },
  { id: 'n5', kind: 'rain',    title: 'PyramidKing made it rain in chat',     body: 'You received 1,250 GC from the rain drop.',                     time: '2d ago' },
];

function IconBadge({ kind }: { kind: NotifKind }) {
  switch (kind) {
    case 'rakeback': return <TrendingUp className="w-4 h-4 text-[#2DC97A]" />;
    case 'race':     return <Trophy     className="w-4 h-4 text-[#F0B232]" />;
    case 'mission':  return <YalaIcon name="badge-star" size={16} />;
    case 'level':    return <YalaIcon name="crown"      size={16} />;
    case 'promo':    return <YalaIcon name="gift"       size={16} />;
    case 'rain':     return <CloudRain className="w-4 h-4 text-[#60A5FA]" />;
  }
}

export function NotificationsModal() {
  const { notificationsOpen, closeNotifications } = useUIStore();
  const { rakebackBalance, claimRakeback } = useWalletStore();
  const [claimed, setClaimed] = useState(false);
  useModalA11y(notificationsOpen, closeNotifications);

  const handleClaim = () => {
    if (rakebackBalance <= 0) return;
    claimRakeback();
    setClaimed(true);
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
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(45,201,122,0.12)', color: '#2DC97A' }}
                >
                  {MOCK_NOTIFS.filter(n => n.unread).length} new
                </span>
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
              {MOCK_NOTIFS.map((n) => {
                const inner = (
                  <div
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5"
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
                        <p className="text-xs font-semibold leading-snug" style={{ color: '#F5E8C8' }}>
                          {n.title}
                        </p>
                        {n.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5 leading-snug" style={{ color: '#8FA899' }}>{n.body}</p>
                      <p className="text-[10px] mt-1 font-mono" style={{ color: '#4A6A55' }}>{n.time}</p>
                    </div>
                  </div>
                );

                return n.href ? (
                  <Link key={n.id} href={n.href} onClick={closeNotifications}>{inner}</Link>
                ) : (
                  <div key={n.id}>{inner}</div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#0A1410', borderTop: '1px solid #1A2E22' }}>
              <button className="text-[11px] font-semibold transition-colors hover:text-[#F5E8C8]" style={{ color: '#8FA899' }}>
                Mark all as read
              </button>
              <Link
                href="/profile/transactions"
                onClick={closeNotifications}
                className="text-[11px] font-semibold transition-colors hover:text-[#F0B232]"
                style={{ color: '#F0B232' }}
              >
                View all activity →
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
