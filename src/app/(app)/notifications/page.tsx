'use client';

/**
 * /notifications — full inbox. The header bell still opens the quick-look
 * modal, but this page is the canonical view: filters, time grouping, mark
 * read / mark all read, delete, empty / signed-out states.
 *
 * Backed by the persisted notifications store, so unread count is real and
 * the bell badge actually decrements when you click into something here.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, Check, CheckCheck, Filter as FilterIcon, Inbox, Trash2, X, RotateCcw,
  Trophy, TrendingUp, Gift, Crown, CloudRain, Sparkles, Settings, ChevronRight,
} from 'lucide-react';
import { useNotificationsStore, type NotifKind, type Notification } from '@/lib/store/notifications';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { YalaIcon } from '@/components/ui/YalaIcon';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type Filter = 'all' | 'unread' | NotifKind;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',      label: 'All' },
  { id: 'unread',   label: 'Unread' },
  { id: 'win',      label: 'Wins' },
  { id: 'race',     label: 'Races' },
  { id: 'mission',  label: 'Missions' },
  { id: 'level',    label: 'Level-ups' },
  { id: 'promo',    label: 'Promos' },
  { id: 'rain',     label: 'Rain' },
  { id: 'tip',      label: 'Tips' },
  { id: 'system',   label: 'System' },
];

const KIND_META: Record<NotifKind, { color: string; bg: string; icon: React.ReactNode }> = {
  win:     { color: '#2DC97A', bg: 'rgba(45,201,122,0.10)',  icon: <TrendingUp className="w-4 h-4" /> },
  race:    { color: '#F0B232', bg: 'rgba(240,178,50,0.10)',  icon: <Trophy     className="w-4 h-4" /> },
  mission: { color: '#A78BFA', bg: 'rgba(167,139,250,0.10)', icon: <YalaIcon name="badge-star" size={16} /> },
  level:   { color: '#FFD166', bg: 'rgba(255,209,102,0.10)', icon: <Crown      className="w-4 h-4" /> },
  promo:   { color: '#F0B232', bg: 'rgba(240,178,50,0.10)',  icon: <Gift       className="w-4 h-4" /> },
  rain:    { color: '#60A5FA', bg: 'rgba(96,165,250,0.10)',  icon: <CloudRain  className="w-4 h-4" /> },
  tip:     { color: '#F472B6', bg: 'rgba(244,114,182,0.10)', icon: <Sparkles   className="w-4 h-4" /> },
  system:  { color: '#8FA3B8', bg: 'rgba(143,163,184,0.08)', icon: <Bell       className="w-4 h-4" /> },
};

// Group notifications into Today / Yesterday / Earlier / Older buckets
function bucketOf(ts: string): 'Today' | 'Yesterday' | 'This week' | 'Earlier' {
  const t   = new Date(ts).getTime();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  if (now - t < dayMs)      return 'Today';
  if (now - t < 2 * dayMs)  return 'Yesterday';
  if (now - t < 7 * dayMs)  return 'This week';
  return 'Earlier';
}

function relativeTime(ts: string): string {
  const t   = new Date(ts).getTime();
  const now = Date.now();
  const sec = Math.floor((now - t) / 1000);
  if (sec < 60)        return `${sec}s ago`;
  if (sec < 60 * 60)   return `${Math.floor(sec / 60)}m ago`;
  if (sec < 60 * 60 * 24) return `${Math.floor(sec / 60 / 60)}h ago`;
  return `${Math.floor(sec / 60 / 60 / 24)}d ago`;
}

export default function NotificationsPage() {
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const items       = useNotificationsStore((s) => s.items);
  const markRead    = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const remove      = useNotificationsStore((s) => s.remove);
  const clearAll    = useNotificationsStore((s) => s.clearAll);
  const reseed      = useNotificationsStore((s) => s.reseed);
  const router      = useRouter();

  const [filter, setFilter] = useState<Filter>('all');

  const unreadCount = items.filter((n) => n.unread).length;

  const filtered = useMemo(() => {
    if (filter === 'all')    return items;
    if (filter === 'unread') return items.filter((n) => n.unread);
    return items.filter((n) => n.kind === filter);
  }, [items, filter]);

  // Group by time bucket, preserving display order
  const grouped = useMemo(() => {
    const buckets: Record<string, Notification[]> = { Today: [], Yesterday: [], 'This week': [], Earlier: [] };
    for (const n of filtered) buckets[bucketOf(n.ts)].push(n);
    return (['Today', 'Yesterday', 'This week', 'Earlier'] as const)
      .map((k) => ({ label: k, items: buckets[k] }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  // Signed-out state
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <Bell className="w-10 h-10" style={{ color: '#4A5878' }} />
        <p style={{ color: '#8FA3B8' }}>Sign in to see your notifications.</p>
        <button
          onClick={() => openAuthModal()}
          className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }}
        >
          Sign in
        </button>
      </div>
    );
  }

  const handleClick = (n: Notification) => {
    markRead(n.id);
    if (n.href) router.push(n.href);
  };

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5" style={{ color: '#F0B232' }} />
            <h1 className="font-display text-2xl font-black tracking-tight" style={{ color: '#F5E8C8' }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(45,201,122,0.14)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.30)' }}
              >
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: '#8FA3B8' }}>
            Wins, missions, promos, tips, and account events.{' '}
            <Link href="/settings" className="underline hover:text-[#F0B232]" style={{ color: '#F0B232' }}>
              Notification preferences →
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => {
                markAllRead();
                toast.success('All notifications marked as read');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2238', color: '#F5E8C8' }}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          {items.length === 0 ? (
            <button
              type="button"
              onClick={() => { reseed(); toast.success('Notifications restored'); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2238', color: '#8FA3B8' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore demo
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all notifications? This cannot be undone.')) {
                  clearAll();
                  toast('Notifications cleared');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors hover:bg-red-500/10"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1A2238', color: '#8FA3B8' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Filter pills ───────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <FilterIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#4A5878' }} />
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const count = f.id === 'all'
            ? items.length
            : f.id === 'unread'
              ? unreadCount
              : items.filter((n) => n.kind === f.id).length;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
              style={
                active
                  ? { background: 'rgba(240,178,50,0.14)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.36)' }
                  : { color: '#8FA3B8', border: '1px solid #1A2238', background: 'rgba(255,255,255,0.02)' }
              }
            >
              {f.label}
              {count > 0 && (
                <span
                  className="text-[9px] font-mono font-black px-1 rounded"
                  style={{
                    background: active ? 'rgba(240,178,50,0.20)' : 'rgba(255,255,255,0.04)',
                    color:      active ? '#F0B232' : '#4A5878',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── List ──────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState filter={filter} hasAny={items.length > 0} />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: '#4A5878' }}>
                {group.label}
              </p>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: '#0F1828', border: '1px solid #1A2238' }}
              >
                <AnimatePresence initial={false}>
                  {group.items.map((n, i) => {
                    const meta = KIND_META[n.kind];
                    return (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="group relative"
                        style={i < group.items.length - 1 ? { borderBottom: '1px solid rgba(26,34,56,0.55)' } : undefined}
                      >
                        <button
                          type="button"
                          onClick={() => handleClick(n)}
                          className="w-full text-left flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.025]"
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}33` }}
                          >
                            {meta.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm leading-snug ${n.unread ? 'font-bold' : 'font-semibold'}`} style={{ color: n.unread ? '#F5E8C8' : '#C5BBA0' }}>
                                {n.title}
                              </p>
                              {n.unread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-[12px] mt-0.5 leading-snug" style={{ color: '#8FA3B8' }}>{n.body}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <p className="text-[10px] font-mono" style={{ color: '#4A5878' }}>{relativeTime(n.ts)}</p>
                              {n.href && (
                                <p className="text-[10px] flex items-center gap-0.5" style={{ color: meta.color }}>
                                  Open <ChevronRight className="w-2.5 h-2.5" />
                                </p>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Row actions — appear on hover */}
                        <div
                          className="absolute right-2 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {n.unread && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                              title="Mark as read"
                              aria-label="Mark as read"
                              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" style={{ color: '#8FA3B8' }} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                            title="Delete"
                            aria-label="Delete notification"
                            className="p-1.5 rounded-lg hover:bg-red-500/15 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" style={{ color: '#8FA3B8' }} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Footer hint ────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-3 p-4 rounded-2xl"
        style={{ background: '#08121C', border: '1px solid #1A2238' }}
      >
        <div className="flex items-center gap-3">
          <Settings className="w-4 h-4" style={{ color: '#F0B232' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: '#F5E8C8' }}>Too many alerts?</p>
            <p className="text-[11px]" style={{ color: '#8FA3B8' }}>Choose what reaches your bell from Settings.</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="px-3 py-2 rounded-lg text-xs font-bold transition-colors hover:brightness-110"
          style={{ background: 'rgba(240,178,50,0.12)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.30)' }}
        >
          Notification settings →
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ filter, hasAny }: { filter: Filter; hasAny: boolean }) {
  const reseed = useNotificationsStore((s) => s.reseed);
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-16 rounded-2xl"
      style={{ background: '#0F1828', border: '1px solid #1A2238' }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1A2238' }}
      >
        <Inbox className="w-7 h-7" style={{ color: '#4A5878' }} />
      </div>
      <p className="text-sm font-bold mb-1" style={{ color: '#F5E8C8' }}>
        {filter === 'all' ? "You're all caught up" : 'Nothing here'}
      </p>
      <p className="text-[12px] mb-4" style={{ color: '#8FA3B8' }}>
        {filter === 'all'
          ? hasAny ? 'Tap "Restore demo" to put the seed back.' : "When something interesting happens, you'll see it here."
          : `No ${filter === 'unread' ? 'unread items' : `${filter} notifications`} right now.`}
      </p>
      {!hasAny && (
        <button
          type="button"
          onClick={() => { reseed(); toast.success('Notifications restored'); }}
          className="px-3 py-2 rounded-lg text-xs font-bold transition-colors hover:brightness-110"
          style={{ background: 'rgba(240,178,50,0.12)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.30)' }}
        >
          Restore demo notifications
        </button>
      )}
    </div>
  );
}
