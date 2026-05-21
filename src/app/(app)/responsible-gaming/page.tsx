'use client';
import { useState } from 'react';
import { Shield, Phone, Clock, Ban, TrendingDown, AlertCircle } from 'lucide-react';

const TOOLS = [
  { id: 'deposit', title: 'Deposit Limits', desc: 'Set daily, weekly, or monthly limits on how much you can purchase.', icon: TrendingDown },
  { id: 'wager', title: 'Wager Limits', desc: 'Limit the total amount you wager in a given period.', icon: TrendingDown },
  { id: 'session', title: 'Session Time Limits', desc: 'Set a maximum play session duration. You will be notified when your limit is reached.', icon: Clock },
  { id: 'cooloff', title: 'Cool-Off Period', desc: 'Take a break from Yala for 24 hours, 7 days, or 30 days.', icon: Clock },
  { id: 'selfexclude', title: 'Self-Exclusion', desc: 'Permanently or temporarily exclude yourself from playing. Requires contacting support.', icon: Ban },
];

const RESOURCES = [
  { name: 'National Council on Problem Gambling (NCPG)', phone: '1-800-522-4700', url: 'https://www.ncpgambling.org', desc: '24/7 free, confidential helpline.' },
  { name: 'Gamblers Anonymous', phone: 'Find local meetings', url: 'https://www.gamblersanonymous.org', desc: 'Peer support fellowship.' },
  { name: 'National Problem Gambling Helpline', phone: '1-800-522-4700', url: 'https://www.ncpgambling.org/help-treatment/national-helpline-network/', desc: 'Chat, call, or text support.' },
];

export default function ResponsibleGamingPage() {
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [setLimitId, setSetLimitId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const handleSet = (id: string) => {
    if (!limits[id]) return;
    setMsg(`✓ ${TOOLS.find((t) => t.id === id)?.title} set successfully.`);
    setSetLimitId(null);
    setTimeout(() => setMsg(''), 3000);
  };

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

      {/* Tools */}
      <div>
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: '#F5E8C8' }}>Self-Management Tools</h2>
        <div className="space-y-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isOpen = setLimitId === tool.id;
            return (
              <div key={tool.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#F5E8C8' }}>{tool.title}</p>
                      <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>{tool.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSetLimitId(isOpen ? null : tool.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 border transition-all hover:border-emerald-400/50"
                    style={{ borderColor: '#2a2a2a', color: '#9CA3AF' }}
                  >
                    {tool.id === 'selfexclude' ? 'Contact Support' : isOpen ? 'Cancel' : 'Set Limit'}
                  </button>
                </div>
                {isOpen && tool.id !== 'selfexclude' && (
                  <div className="mt-4 flex gap-3 pt-4 border-t border-[#1E1E1E]">
                    <input
                      type="number"
                      value={limits[tool.id] || ''}
                      onChange={(e) => setLimits({ ...limits, [tool.id]: e.target.value })}
                      placeholder={tool.id === 'session' ? 'Minutes' : 'GC Amount'}
                      className="flex-1 px-3 py-2 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-emerald-400/50"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
                    />
                    <button onClick={() => handleSet(tool.id)} className="px-4 py-2 rounded-xl text-sm font-semibold text-black" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {msg && <p className="mt-3 text-sm text-emerald-400">{msg}</p>}
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
