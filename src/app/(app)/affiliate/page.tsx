'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC } from '@/lib/utils';
import { Copy, CheckCircle2, Users, DollarSign, TrendingUp, Link as LinkIcon, Layers } from 'lucide-react';

const MOCK_REFERRALS = [
  { username: 'OasisHunter', joinDate: '2026-05-01', status: 'active', earned: 5000 },
  { username: 'SandstormX', joinDate: '2026-04-28', status: 'active', earned: 5000 },
  { username: 'NightBazaar7', joinDate: '2026-04-15', status: 'active', earned: 5000 },
  { username: 'DuneStrider', joinDate: '2026-04-02', status: 'pending', earned: 0 },
  { username: 'PyramidAce', joinDate: '2026-03-20', status: 'active', earned: 5000 },
];

export default function AffiliatePage() {
  const { isLoggedIn, user } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [copied, setCopied] = useState(false);
  const [creatorCode, setCreatorCode] = useState('');
  const [codeSubmitted, setCodeSubmitted] = useState(false);

  const referralCode = user?.referralCode || 'DESERT88';
  const referralUrl = `https://yala.com/join?ref=${referralCode}`;
  const totalEarned = MOCK_REFERRALS.filter((r) => r.status === 'active').reduce((s, r) => s + r.earned, 0);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 border border-[#1E1E1E]"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(214,168,79,0.1) 0%, transparent 60%), #0A0A0A' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4" style={{ color: '#D6A84F' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D6A84F' }}>Affiliate & Creator</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Grow the Oasis</h1>
          <p className="text-sm max-w-lg" style={{ color: '#9CA3AF' }}>Refer friends and earn GC for every active player. Creators earn on every wager from their audience.</p>
        </div>
      </div>

      {isLoggedIn ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Referrals', value: MOCK_REFERRALS.length.toString(), icon: Users, color: '#D6A84F' },
              { label: 'Active Referrals', value: MOCK_REFERRALS.filter((r) => r.status === 'active').length.toString(), icon: TrendingUp, color: '#10B981' },
              { label: 'Total Earned', value: formatGC(totalEarned) + ' GC', icon: DollarSign, color: '#8B5CF6' },
              { label: 'Commission Rate', value: '5,000 GC', icon: Layers, color: '#F59E0B' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>{stat.label}</p>
                  </div>
                  <p className="font-bold text-lg number-display" style={{ color: stat.color }}>{stat.value}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Referral code */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>Your Referral Code</h3>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(214,168,79,0.1)', border: '1px solid rgba(214,168,79,0.3)' }}>
                <span className="font-mono font-bold text-lg flex-1" style={{ color: '#D6A84F' }}>{referralCode}</span>
                <button onClick={() => handleCopy(referralCode)} className="p-1.5 rounded-lg hover:bg-white/10">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#9CA3AF]" />}
                </button>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: '#9CA3AF' }}>Referral Link</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a2a' }}>
                  <LinkIcon className="w-3.5 h-3.5 flex-shrink-0 text-[#9CA3AF]" />
                  <p className="text-xs font-mono flex-1 truncate" style={{ color: '#9CA3AF' }}>{referralUrl}</p>
                  <button onClick={() => handleCopy(referralUrl)} className="p-1 hover:bg-white/10 rounded">
                    <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  </button>
                </div>
              </div>

              <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(214,168,79,0.06)', border: '1px solid rgba(214,168,79,0.15)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#D6A84F' }}>How it works</p>
                <div className="space-y-1">
                  {['Share your referral code or link', 'Friend signs up using your code', 'They make their first purchase', 'You earn 5,000 GC reward'].map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs" style={{ color: '#9CA3AF' }}>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black flex-shrink-0" style={{ background: '#D6A84F' }}>{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Creator code */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>Creator Code</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(214,168,79,0.2)', color: '#D6A84F' }}>Creator Program</span>
              </div>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>If you are a content creator, apply for a custom creator code. Your audience uses your code at signup and you earn a % of their wagers.</p>
              {!codeSubmitted ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={creatorCode}
                    onChange={(e) => setCreatorCode(e.target.value.toUpperCase())}
                    placeholder="Choose your creator code"
                    className="w-full px-4 py-3 rounded-xl text-sm border text-[#F5E8C8] focus:outline-none focus:border-[#D6A84F]/50 transition-colors font-mono uppercase"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: '#2a2a2a' }}
                    maxLength={20}
                  />
                  <button
                    onClick={() => { if (creatorCode) setCodeSubmitted(true); }}
                    className="w-full py-3 rounded-xl font-semibold text-sm text-black"
                    style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
                  >
                    Apply for Creator Code
                  </button>
                </div>
              ) : (
                <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p className="text-sm font-semibold text-emerald-400">Application Submitted!</p>
                  <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Creator code <strong className="text-[#F5E8C8]">{creatorCode}</strong> is pending review. We will contact you within 3 business days.</p>
                </div>
              )}
            </div>
          </div>

          {/* Referrals table */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1E1E1E]">
              <h3 className="font-semibold" style={{ color: '#F5E8C8' }}>Your Referrals</h3>
            </div>
            <div className="divide-y divide-[#1E1E1E]">
              {MOCK_REFERRALS.map((ref, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black" style={{ background: 'linear-gradient(135deg, #D6A84F, #A07830)' }}>
                    {ref.username[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#F5E8C8' }}>{ref.username}</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Joined {ref.joinDate}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ref.status === 'active' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'}`}>{ref.status}</span>
                  <span className="text-sm font-bold number-display" style={{ color: ref.earned > 0 ? '#D6A84F' : '#9CA3AF' }}>
                    {ref.earned > 0 ? `+${formatGC(ref.earned)} GC` : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card p-10 text-center">
          <Users className="w-10 h-10 mx-auto mb-4" style={{ color: '#D6A84F', opacity: 0.5 }} />
          <p className="font-semibold mb-2" style={{ color: '#F5E8C8' }}>Login to access your affiliate dashboard</p>
          <p className="text-sm mb-5" style={{ color: '#9CA3AF' }}>Earn 5,000 GC for every friend who joins and makes a purchase.</p>
          <button onClick={() => openAuthModal()} className="px-6 py-3 rounded-xl font-semibold text-sm text-black" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>Login</button>
        </div>
      )}

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">18+ · No Purchase Necessary · Void Where Prohibited · Max 50 referrals per account</p>
      </div>
    </div>
  );
}
