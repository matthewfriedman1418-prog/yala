'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC } from '@/lib/utils';
import { CheckCircle2, Lock as LockIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoldCoinIcon, SweepCoinIcon, YalaIcon, type YalaIconName } from '@/components/ui/YalaIcon';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/EmptyState';

interface Mission {
  id: string;
  title: string;
  desc: string;
  reward: number;     // GC
  rewardSC: number;   // SC
  progress: number;
  total: number;
  completed: boolean;
  icon: YalaIconName;
}

const DAILY_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Morning Spin',     desc: 'Claim your daily free spin',          reward:   500, rewardSC: 0,   progress: 1, total: 1,  completed: true,  icon: 'daily-star' },
  { id: 'm2', title: 'Originals Run',    desc: 'Play any 3 Yala Originals games',     reward: 2_000, rewardSC: 0,   progress: 2, total: 3,  completed: false, icon: 'lightning' },
  { id: 'm3', title: 'Roll Call',        desc: 'Place 10 bets today',                 reward: 1_500, rewardSC: 0,   progress: 7, total: 10, completed: false, icon: 'dice' },
  { id: 'm4', title: 'Speak Up',         desc: 'Send a message in Live Chat',         reward:   200, rewardSC: 0,   progress: 0, total: 1,  completed: false, icon: 'sparkle' },
  { id: 'm5', title: 'Sweeps Sampler',   desc: 'Play 5 games in SC mode',             reward:     0, rewardSC: 0.5, progress: 1, total: 5,  completed: false, icon: 'cash-bill' },
];

const WEEKLY_MISSIONS: Mission[] = [
  { id: 'wm1', title: 'Vault Keeper',       desc: 'Keep 10+ SC in the vault for 7 days',     reward: 15_000, rewardSC: 0, progress: 5, total: 7,  completed: false, icon: 'lock' },
  { id: 'wm2', title: 'Originals Sweep',    desc: 'Play all 12 Yala Originals this week',    reward: 25_000, rewardSC: 2, progress: 8, total: 12, completed: false, icon: 'lightning' },
  { id: 'wm3', title: 'Crew Builder',       desc: 'Join 3 rooms with other players',         reward:  5_000, rewardSC: 0, progress: 1, total: 3,  completed: false, icon: 'activity' },
  { id: 'wm4', title: 'Streak Master',      desc: 'Maintain a 7-day login streak',           reward: 10_000, rewardSC: 1, progress: 7, total: 7,  completed: true,  icon: 'daily-star' },
];

type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

interface Achievement {
  id: string;
  title: string;
  desc: string;
  earned: boolean;
  icon: YalaIconName;
  rarity: Rarity;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'First Step',         desc: 'Make your first GC wager',          earned: true,  icon: 'sparkle',    rarity: 'Common' },
  { id: 'a2', title: 'Century',            desc: 'Reach 100,000 total XP',            earned: true,  icon: 'star',       rarity: 'Uncommon' },
  { id: 'a3', title: 'Legend Tier',        desc: 'Reach VIP Tier 5',                  earned: true,  icon: 'diamond',    rarity: 'Rare' },
  { id: 'a4', title: 'Rain Maker',         desc: 'Send a rain of 10,000+ GC',         earned: false, icon: 'cash-bill',  rarity: 'Rare' },
  { id: 'a5', title: 'Vault Tycoon',       desc: 'Hold 1,000+ SC in the Vault',       earned: false, icon: 'lock',       rarity: 'Epic' },
  { id: 'a6', title: 'Icon Status',        desc: 'Reach VIP Tier 6 (Icon)',           earned: false, icon: 'crown',      rarity: 'Legendary' },
  { id: 'a7', title: 'Multiplier Master',  desc: 'Hit 100× on any Yala Original',     earned: false, icon: 'lightning',  rarity: 'Epic' },
  { id: 'a8', title: 'Perfect Streak',     desc: 'Maintain a 30-day login streak',    earned: false, icon: 'daily-star', rarity: 'Legendary' },
];

const RARITY: Record<Rarity, { color: string; label: string }> = {
  Common:    { color: '#8FA3B8', label: 'Common' },
  Uncommon:  { color: '#2DC97A', label: 'Uncommon' },
  Rare:      { color: '#60A5FA', label: 'Rare' },
  Epic:      { color: '#A78BFA', label: 'Epic' },
  Legendary: { color: '#F0B232', label: 'Legendary' },
};

type Tab = 'daily' | 'weekly' | 'achievements';

export default function MissionsPage() {
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [activeTab, setActiveTab]   = useState<Tab>('daily');
  const [claimedIds, setClaimedIds] = useState<string[]>(['m1', 'wm4']);

  const handleClaim = (m: Mission) => {
    if (!isLoggedIn) { openAuthModal(); return; }
    setClaimedIds((prev) => [...prev, m.id]);
    const gc = m.reward ? `${formatGC(m.reward)} GC` : '';
    const sc = m.rewardSC ? `${m.rewardSC} SC` : '';
    const reward = [gc, sc].filter(Boolean).join(' + ');
    toast.success(`${m.title} claimed`, { description: `${reward} added to your wallet.` });
  };

  // Aggregate counts for the stat strip
  const dailyDone   = DAILY_MISSIONS.filter((m) => m.completed || claimedIds.includes(m.id)).length;
  const weeklyDone  = WEEKLY_MISSIONS.filter((m) => m.completed || claimedIds.includes(m.id)).length;
  const earnedCount = ACHIEVEMENTS.filter((a) => a.earned).length;

  return (
    <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">

      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(240,178,50,0.1)', border: '1px solid rgba(240,178,50,0.22)' }}
          >
            <YalaIcon name="badge-star" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F0B232]">Missions</span>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Quests & Achievements</h1>
        <p style={{ color: '#8FA3B8' }}>Complete missions for bonus GC and SC. Unlock achievements as you play.</p>
      </div>

      {/* ── STAT STRIP (3 cells) ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCell
          label="Today"
          value={`${dailyDone}/${DAILY_MISSIONS.length}`}
          sub="missions complete"
          accent="#F0B232"
          icon={<Clock className="w-4 h-4" style={{ color: '#F0B232' }} />}
        />
        <StatCell
          label="This week"
          value={`${weeklyDone}/${WEEKLY_MISSIONS.length}`}
          sub="quests complete"
          accent="#2DC97A"
          icon={<YalaIcon name="trophy" size={16} />}
        />
        <StatCell
          label="Unlocked"
          value={`${earnedCount}/${ACHIEVEMENTS.length}`}
          sub="achievements"
          accent="#A78BFA"
          icon={<YalaIcon name="badge-star" size={16} />}
        />
      </div>

      {/* ── TAB SWITCHER ── */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#0F1828', border: '1px solid #1A2238' }}>
        {[
          { id: 'daily'        as const, label: 'Daily',        hint: `${dailyDone}/${DAILY_MISSIONS.length}` },
          { id: 'weekly'       as const, label: 'Weekly',       hint: `${weeklyDone}/${WEEKLY_MISSIONS.length}` },
          { id: 'achievements' as const, label: 'Achievements', hint: `${earnedCount}/${ACHIEVEMENTS.length}` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
            style={activeTab === t.id
              ? { background: 'rgba(240,178,50,0.12)', color: '#F0B232', border: '1px solid rgba(240,178,50,0.28)' }
              : { color: '#8FA3B8', border: '1px solid transparent' }
            }
          >
            {t.label}
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.06)', color: activeTab === t.id ? '#F0B232' : '#8FA3B8' }}
            >
              {t.hint}
            </span>
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'daily' && (
          <motion.div
            key="daily"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: '#8FA3B8' }}>
                <span className="font-bold" style={{ color: '#F5E8C8' }}>{dailyDone}</span> of {DAILY_MISSIONS.length} complete
              </p>
              <p className="text-xs font-mono" style={{ color: '#8FA3B8' }}>
                Resets in <span className="font-bold" style={{ color: '#F5E8C8' }}>14h 22m</span>
              </p>
            </div>
            <div className="space-y-2.5">
              {DAILY_MISSIONS.map((m, i) => (
                <MissionRow
                  key={m.id}
                  mission={m}
                  delay={i * 0.04}
                  claimed={claimedIds.includes(m.id)}
                  onClaim={handleClaim}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'weekly' && (
          <motion.div
            key="weekly"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: '#8FA3B8' }}>
                <span className="font-bold" style={{ color: '#F5E8C8' }}>{weeklyDone}</span> of {WEEKLY_MISSIONS.length} complete
              </p>
              <p className="text-xs font-mono" style={{ color: '#8FA3B8' }}>
                Resets in <span className="font-bold" style={{ color: '#F5E8C8' }}>3d 14h</span>
              </p>
            </div>
            <div className="space-y-2.5">
              {WEEKLY_MISSIONS.map((m, i) => (
                <MissionRow
                  key={m.id}
                  mission={m}
                  delay={i * 0.04}
                  claimed={claimedIds.includes(m.id)}
                  onClaim={handleClaim}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="ach"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="space-y-4"
          >
            {ACHIEVEMENTS.length === 0 ? (
              <EmptyState
                icon="badge-star"
                title="No achievements yet"
                body="Play a few games and your first unlocks will land here."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ACHIEVEMENTS.map((a, i) => (
                  <AchievementCard key={a.id} achievement={a} delay={i * 0.04} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t pt-4 text-center" style={{ borderColor: '#1A2238' }}>
        <p className="text-xs" style={{ color: 'rgba(143,163,184,0.5)' }}>
          18+ · No Purchase Necessary · Void Where Prohibited · <Link href="/sweepstakes-rules" className="underline transition-colors hover:opacity-80">Sweepstakes Rules</Link>
        </p>
      </div>
    </div>
  );
}

// ─── StatCell ───────────────────────────────────────────────────────────────
function StatCell({ label, value, sub, accent, icon }: {
  label: string; value: string; sub: string; accent: string; icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: '#0F1828', border: '1px solid #1A2238' }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#8FA3B8' }}>
          {label}
        </span>
      </div>
      <p className="font-display text-2xl font-black number-display leading-none" style={{ color: accent }}>{value}</p>
      <p className="text-[10px] mt-1" style={{ color: '#4A5878' }}>{sub}</p>
    </div>
  );
}

// ─── MissionRow ─────────────────────────────────────────────────────────────
function MissionRow({ mission, claimed, delay, onClaim }: {
  mission: Mission;
  claimed: boolean;
  delay: number;
  onClaim: (m: Mission) => void;
}) {
  const isComplete = mission.completed || claimed;
  const progress   = (mission.progress / mission.total) * 100;
  const canClaim   = isComplete && !claimed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl p-4 flex items-start gap-4 transition-all"
      style={{
        background: canClaim
          ? 'linear-gradient(135deg, rgba(240,178,50,0.10), rgba(240,178,50,0.02))'
          : '#0F1828',
        border: `1px solid ${canClaim ? 'rgba(240,178,50,0.32)' : '#1A2238'}`,
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: isComplete ? 'rgba(45,201,122,0.12)' : 'rgba(240,178,50,0.08)',
          border: `1px solid ${isComplete ? 'rgba(45,201,122,0.3)' : 'rgba(240,178,50,0.22)'}`,
        }}
      >
        {claimed
          ? <CheckCircle2 className="w-5 h-5" style={{ color: '#2DC97A' }} />
          : <YalaIcon name={mission.icon} size={22} />
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1 flex-wrap">
          <p className="font-bold text-sm" style={{ color: isComplete ? '#2DC97A' : '#F5E8C8' }}>
            {mission.title}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {mission.reward > 0 && (
              <span className="text-xs font-bold number-display flex items-center gap-1" style={{ color: '#F0B232' }}>
                <GoldCoinIcon size={11} /> +{formatGC(mission.reward)}
              </span>
            )}
            {mission.rewardSC > 0 && (
              <span className="text-xs font-bold number-display flex items-center gap-1" style={{ color: '#2DC97A' }}>
                <SweepCoinIcon size={13} /> +{mission.rewardSC}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs mb-2" style={{ color: '#8FA3B8' }}>{mission.desc}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1A2238' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${isComplete ? 100 : progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: delay + 0.1 }}
              className="h-full rounded-full"
              style={{
                background: isComplete
                  ? 'linear-gradient(90deg, #2DC97A, #10B981)'
                  : 'linear-gradient(90deg, #F0B232, #FFD166)',
              }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold flex-shrink-0" style={{ color: '#8FA3B8' }}>
            {isComplete ? 'Done' : `${mission.progress}/${mission.total}`}
          </span>
        </div>
      </div>

      {canClaim ? (
        <button
          onClick={() => onClaim(mission)}
          className="px-3.5 py-2 rounded-xl text-xs font-black transition-all hover:brightness-110 active:scale-95 flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #F0B232, #FFD166)',
            color: '#040814',
            boxShadow: '0 2px 12px rgba(240,178,50,0.3)',
          }}
        >
          Claim
        </button>
      ) : claimed ? (
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(45,201,122,0.1)' }}>
          <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#2DC97A' }} />
          <span className="text-[10px] font-bold" style={{ color: '#2DC97A' }}>Claimed</span>
        </div>
      ) : null}
    </motion.div>
  );
}

// ─── AchievementCard ────────────────────────────────────────────────────────
function AchievementCard({ achievement, delay }: { achievement: Achievement; delay: number }) {
  const r = RARITY[achievement.rarity];
  const earned = achievement.earned;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="rounded-2xl p-4 flex items-start gap-3 transition-all relative overflow-hidden"
      style={{
        background: earned
          ? `linear-gradient(135deg, ${r.color}10, transparent)`
          : '#0F1828',
        border: `1px solid ${earned ? `${r.color}44` : '#1A2238'}`,
        opacity: earned ? 1 : 0.85,
      }}
    >
      {earned && (
        <div
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${r.color}22, transparent 60%)`, filter: 'blur(12px)' }}
        />
      )}

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative"
        style={{
          background: earned ? `${r.color}14` : 'rgba(255,255,255,0.03)',
          border: `1px solid ${earned ? `${r.color}40` : '#1A2238'}`,
          opacity: earned ? 1 : 0.5,
          filter: earned ? 'none' : 'grayscale(80%)',
        }}
      >
        <YalaIcon name={achievement.icon} size={24} />
        {!earned && (
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: '#0F1828', border: '1px solid #1A2238' }}
          >
            <LockIcon className="w-2.5 h-2.5" style={{ color: '#8FA3B8' }} strokeWidth={3} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 relative">
        <p className="font-bold text-sm" style={{ color: earned ? '#F5E8C8' : '#8FA3B8' }}>
          {achievement.title}
        </p>
        <p className="text-[11px] mt-0.5 leading-snug" style={{ color: earned ? '#8FA3B8' : '#4A5878' }}>
          {achievement.desc}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: `${r.color}18`, color: r.color }}
          >
            {r.label}
          </span>
          {earned && (
            <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: '#2DC97A' }}>
              <CheckCircle2 className="w-3 h-3" /> Earned
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
