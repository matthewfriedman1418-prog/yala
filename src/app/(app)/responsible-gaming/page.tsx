'use client';
import { useState } from 'react';
import { Shield, Phone, Clock, Ban, TrendingDown, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useSettingsStore } from '@/lib/store/settings';

type LimitId = 'deposit' | 'wager' | 'session' | 'cooloff' | 'selfexclude';
const TOOLS: { id: LimitId; title: string; desc: string; icon: typeof TrendingDown; unit?: string }[] = [
  { id: 'deposit', title: 'Deposit Limits', desc: 'Set a daily ceiling on how much you can purchase. Setting 0 removes the limit.', icon: TrendingDown, unit: 'GC/day' },
  { id: 'wager', title: 'Wager Limits', desc: 'Cap the total amount you can wager per day. Setting 0 removes the limit.', icon: TrendingDown, unit: 'GC/day' },
  { id: 'session', title: 'Session Time Limits', desc: 'Maximum play session duration in minutes. You will be notified when your limit is reached.', icon: Clock, unit: 'minutes' },
  { id: 'cooloff', title: 'Cool-Off Period', desc: 'Take a break from Yala for 24 hours, 7 days, or 30 days.', icon: Clock },
  { id: 'selfexclude', title: 'Self-Exclusion', desc: 'Permanently or temporarily exclude yourself from playing. Requires contacting support.', icon: Ban },
];

const COOLOFF_OPTIONS = [
  { days: 1,  label: '24 hours' },
  { days: 7,  label: '7 days' },
  { days: 30, label: '30 days' },
];

const RESOURCES = [
  { name: 'National Council on Problem Gambling (NCPG)', phone: '1-800-522-4700', url: 'https://www.ncpgambling.org', desc: '24/7 free, confidential helpline.' },
  { name: 'Gamblers Anonymous', phone: 'Find local meetings', url: 'https://www.gamblersanonymous.org', desc: 'Peer support fellowship.' },
  { name: 'National Problem Gambling Helpline', phone: '1-800-522-4700', url: 'https://www.ncpgambling.org/help-treatment/national-helpline-network/', desc: 'Chat, call, or text support.' },
];

export default function ResponsibleGamingPage() {
  const limits        = useSettingsStore((s) => s.limits);
  const setLimit      = useSettingsStore((s) => s.setLimit);
  const startCooloff  = useSettingsStore((s) => s.startCooloff);
  const clearCooloff  = useSettingsStore((s) => s.clearCooloff);

  const [openId, setOpenId] = useState<LimitId | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // Live values from the store (so the "current" badge stays accurate)
  const valueOf = (id: LimitId): number => {
    if (id === 'deposit')  return limits.deposit;
    if (id === 'wager')    return limits.wager;
    if (id === 'session')  return limits.session;
    if (id === 'cooloff')  return limits.cooloff;
    return 0;
  };

  const handleSetNumeric = (id: 'deposit' | 'wager' | 'session') => {
    const v = parseInt(drafts[id] || '0', 10);
    if (!Number.isFinite(v) || v < 0) { toast.error('Enter a non-negative number'); return; }
    setLimit(id, v);
    setOpenId(null);
    toast.success(`${TOOLS.find((t) => t.id === id)?.title} ${v === 0 ? 'removed' : 'updated'}`,
      v > 0 ? { description: `New limit: ${v.toLocaleString()} ${TOOLS.find((t) => t.id === id)?.unit}` } : undefined);
  };

  const handleCooloff = (days: number) => {
    startCooloff(days);
    setOpenId(null);
    toast.success(`Cool-off started for ${days === 1 ? '24 hours' : `${days} days`}`, {
      description: 'Real cool-offs will be enforced server-side; this demo persists locally.',
    });
  };

  const activeCooloff = limits.cooloffUntil && new Date(limits.cooloffUntil).getTime() > Date.now();
  const cooloffRemaining = activeCooloff && limits.cooloffUntil
    ? Math.ceil((new Date(limits.cooloffUntil).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    : 0;

  return (
    <div className="max-w-3xl space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Responsible Gaming</span>
        </div>
        <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Play Responsibly</h1>
        <p className="leading-relaxed" style={{ color: '#9CA3AF' }}>
          Yala is a social sweepstakes platform designed for entertainment. We are committed to providing a safe, responsible, and transparent experience for all players. If you ever feel that gaming is affecting your wellbeing, please use the tools below or reach out to one of our support resources.
        </p>
      </div>

      {/* Key message */}
      <div className="px-5 py-4 rounded-2xl border flex items-start gap-4" style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
        <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-400 mb-1">No Purchase Necessary</p>
          <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>
            You can enjoy Yala entirely for free. Gold Coins are available at no charge through daily bonuses and free spins. No purchase is ever required to play or win Sweep Coins prizes. See our <a href="/sweepstakes-rules" className="text-emerald-400 underline">Sweepstakes Rules</a> for details.
          </p>
        </div>
      </div>

      {/* Active cool-off banner (visible only if one is in effect) */}
      {activeCooloff && (
        <div className="px-5 py-4 rounded-2xl border flex items-start gap-4" style={{ background: 'rgba(240,178,50,0.06)', borderColor: 'rgba(240,178,50,0.3)' }}>
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-400 mb-1">Cool-off in effect</p>
            <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>
              You&apos;ve paused yourself for {cooloffRemaining} more {cooloffRemaining === 1 ? 'day' : 'days'}. Real cool-offs will be enforced server-side — this demo lets you cancel early for testing.
            </p>
          </div>
          <button
            onClick={() => { clearCooloff(); toast('Cool-off cleared (demo only)'); }}
            className="text-xs font-bold underline flex-shrink-0"
            style={{ color: '#8FA899' }}
          >
            Clear (demo)
          </button>
        </div>
      )}

      {/* Tools */}
      <div>
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: '#F5E8C8' }}>Self-Management Tools</h2>
        <div className="space-y-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isOpen = openId === tool.id;
            const current = valueOf(tool.id);
            const isActive = current > 0;
            return (
              <div key={tool.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold" style={{ color: '#F5E8C8' }}>{tool.title}</p>
                        {isActive && tool.id !== 'cooloff' && (
                          <span
                            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{ background: 'rgba(45,201,122,0.14)', color: '#2DC97A', border: '1px solid rgba(45,201,122,0.30)' }}
                          >
                            <Check className="w-2.5 h-2.5" />
                            {current.toLocaleString()} {tool.unit}
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>{tool.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (tool.id === 'selfexclude') {
                        toast('Contact support to begin self-exclusion', { description: 'support@yala.com or use the in-app chat.' });
                        return;
                      }
                      setOpenId(isOpen ? null : tool.id);
                      if (!isOpen && tool.id !== 'cooloff') {
                        setDrafts((d) => ({ ...d, [tool.id]: String(current || '') }));
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 border transition-all hover:border-emerald-400/50"
                    style={{ borderColor: '#2a2a2a', color: '#9CA3AF' }}
                  >
                    {tool.id === 'selfexclude' ? 'Contact Support' : isOpen ? 'Cancel' : isActive ? 'Change' : 'Set Limit'}
                  </button>
                </div>

                {/* Numeric limit editor */}
                {isOpen && (tool.id === 'deposit' || tool.id === 'wager' || tool.id === 'session') && (() => {
                  const numericId = tool.id as 'deposit' | 'wager' | 'session';
                  return (
                  <div className="mt-4 pt-4 border-t border-[#1E1E1E] space-y-2">
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={drafts[numericId] ?? ''}
                        onChange={(e) => setDrafts((d) => ({ ...d, [numericId]: e.target.value }))}
                        placeholder={numericId === 'session' ? 'Minutes' : 'GC Amount'}
                        min={0}
                        className="flex-1 px-3 py-2 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-emerald-400/50"
                        style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
                      />
                      <button onClick={() => handleSetNumeric(numericId)} className="px-4 py-2 rounded-xl text-sm font-semibold text-black" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>
                        Confirm
                      </button>
                    </div>
                    <p className="text-[10px]" style={{ color: '#4A6A55' }}>Enter 0 to remove the limit. Real limits will be enforced server-side; this demo persists locally.</p>
                  </div>
                  );
                })()}

                {/* Cool-off duration picker */}
                {isOpen && tool.id === 'cooloff' && (
                  <div className="mt-4 pt-4 border-t border-[#1E1E1E]">
                    <p className="text-[11px] mb-2" style={{ color: '#8FA899' }}>Choose how long you&apos;d like to take a break:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {COOLOFF_OPTIONS.map((o) => (
                        <button
                          key={o.days}
                          type="button"
                          onClick={() => handleCooloff(o.days)}
                          className="py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110"
                          style={{ background: 'rgba(240,178,50,0.10)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.30)' }}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] mt-2" style={{ color: '#4A6A55' }}>
                      Once active, you cannot reverse a cool-off without contacting support (server-enforced in production).
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning signs */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-3" style={{ color: '#F5E8C8' }}>Signs to Watch For</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'Spending more time or money than intended',
            'Chasing losses or trying to win back money',
            'Neglecting responsibilities due to gaming',
            'Feeling restless or irritable when not playing',
            'Hiding your gaming activity from others',
            'Gaming as an escape from stress or problems',
          ].map((sign, i) => (
            <div key={i} className="flex items-start gap-2 text-sm" style={{ color: '#9CA3AF' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-2" />
              {sign}
            </div>
          ))}
        </div>
      </div>

      {/* Help resources */}
      <div>
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: '#F5E8C8' }}>Help Resources</h2>
        <div className="space-y-3">
          {RESOURCES.map((res) => (
            <div key={res.name} className="glass-card p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Phone className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#F5E8C8' }}>{res.name}</p>
                <p className="text-sm font-bold text-red-400">{res.phone}</p>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{res.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#1E1E1E] pt-6 space-y-2 text-center">
        <p className="text-sm font-semibold" style={{ color: '#9CA3AF' }}>18+ Only · Void Where Prohibited · No Purchase Necessary</p>
        <p className="text-xs" style={{ color: 'rgba(156,163,175,0.6)' }}>
          Gold Coins are virtual currency with no monetary value. Yala is a social sweepstakes platform for entertainment only.
        </p>
      </div>
    </div>
  );
}
