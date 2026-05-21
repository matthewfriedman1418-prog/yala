'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth';
import { useUIStore } from '@/lib/store/ui';
import { formatGC } from '@/lib/utils';
import { Target, Trophy, Star, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAILY_MISSIONS = [
  { id: 'm1', title: 'Morning Spin', desc: 'Claim your daily free spin', reward: 500, rewardSC: 0, progress: 1, total: 1, completed: true, icon: '🎡' },
  { id: 'm2', title: 'Oasis Explorer', desc: 'Play any 3 Yala Originals games', reward: 2000, rewardSC: 0, progress: 2, total: 3, completed: false, icon: '🌴' },
  { id: 'm3', title: 'Desert Dealer', desc: 'Place 10 bets today', reward: 1500, rewardSC: 0, progress: 7, total: 10, completed: false, icon: '🎲' },
  { id: 'm4', title: 'Chat Companion', desc: 'Send a message in Live Chat', reward: 200, rewardSC: 0, progress: 0, total: 1, completed: false, icon: '💬' },
  { id: 'm5', title: 'Sweep Seeker', desc: 'Play 5 games in SC mode', reward: 0, rewardSC: 0.5, progress: 1, total: 5, completed: false, icon: '◇' },
];

const WEEKLY_MISSIONS = [
  { id: 'wm1', title: 'Vault Guardian', desc: 'Keep 10,000+ GC in the vault for 7 days', reward: 15000, rewardSC: 0, progress: 5, total: 7, completed: false, icon: '🏛️' },
  { id: 'wm2', title: 'Originals Champion', desc: 'Play all 12 Yala Originals this week', reward: 25000, rewardSC: 2, progress: 8, total: 12, completed: false, icon: '⚡' },
  { id: 'wm3', title: 'Social Butterfly', desc: 'Join 3 rooms with other players', reward: 5000, rewardSC: 0, progress: 1, total: 3, completed: false, icon: '🦋' },
  { id: 'wm4', title: "Caravan's Streak", desc: 'Maintain a 7-day login streak', reward: 10000, rewardSC: 1, progress: 7, total: 7, completed: true, icon: '🐪' },
];

const ACHIEVEMENTS = [
  { id: 'a1', title: 'First Step', desc: 'Make your first GC wager', earned: true, icon: '👣', rarity: 'Common' },
  { id: 'a2', title: 'Oasis Found', desc: 'Reach 100,000 total XP', earned: true, icon: '🌴', rarity: 'Uncommon' },
  { id: 'a3', title: 'Desert Prince', desc: 'Reach VIP Tier 5', earned: true, icon: '👑', rarity: 'Rare' },
  { id: 'a4', title: 'Rain Maker', desc: 'Send a rain of 10,000+ GC', earned: false, icon: '🌧️', rarity: 'Rare' },
  { id: 'a5', title: 'Vault Baron', desc: 'Hold 1,000,000 GC in the Vault', earned: false, icon: '🏛️', rarity: 'Epic' },
  { id: 'a6', title: 'Sheikh of Sheikhness', desc: 'Reach VIP Tier 6 (Sheikh)', earned: false, icon: '♾️', rarity: 'Legendary' },
  { id: 'a7', title: 'Mirage Surfer', desc: 'Hit 100× on Mirage Crash', earned: false, icon: '🌊', rarity: 'Epic' },
  { id: 'a8', title: 'Perfect Streak', desc: 'Maintain a 30-day login streak', earned: false, icon: '🔥', rarity: 'Legendary' },
];

const RARITY_COLORS: Record<string, string> = {
  Common: '#9CA3AF',
  Uncommon: '#10B981',
  Rare: '#3B82F6',
  Epic: '#8B5CF6',
  Legendary: '#D6A84F',
};

export default function MissionsPage() {
  const { isLoggedIn } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'achievements'>('daily');
  const [claimedIds, setClaimedIds] = useState<string[]>(['m1', 'wm4']);

  const claimMission = (id: string) => setClaimedIds((prev) => [...prev, id]);

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden p-6 sm:p-10 border border-[#1E1E1E]"
        style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(214,168,79,0.1) 0%, transparent 60%), #0A0A0A' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4" style={{ color: '#D6A84F' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D6A84F' }}>Missions</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F5E8C8' }}>Quests & Achievements</h1>
          <p className="text-sm max-w-lg" style={{ color: '#9CA3AF' }}>Complete daily and weekly missions to earn bonus GC, SC, and exclusive achievements.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1E1E1E] pb-0">
        {[
          { id: 'daily' as const, label: 'Daily', icon: Clock },
          { id: 'weekly' as const, label: 'Weekly', icon: Star },
          { id: 'achievements' as const, label: 'Achievements', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all',
                activeTab === tab.id ? 'border-[#D6A84F] text-[#D6A84F]' : 'border-transparent text-[#9CA3AF] hover:text-[#F5E8C8]'
              )}
            >
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Daily missions */}
      {activeTab === 'daily' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              {DAILY_MISSIONS.filter((m) => m.completed || claimedIds.includes(m.id)).length}/{DAILY_MISSIONS.length} completed
            </p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Resets in 14h 22m</p>
          </div>
          {DAILY_MISSIONS.map((mission, i) => {
            const isComplete = mission.completed || claimedIds.includes(mission.id);
            const progress = (mission.progress / mission.total) * 100;
            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: isComplete ? 'rgba(16,185,129,0.15)' : 'rgba(214,168,79,0.1)', border: `1px solid ${isComplete ? 'rgba(16,185,129,0.3)' : 'rgba(214,168,79,0.2)'}` }}>
                    {isComplete ? '✓' : mission.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm" style={{ color: isComplete ? '#10B981' : '#F5E8C8' }}>{mission.title}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {mission.reward > 0 && <span className="text-xs font-bold number-display" style={{ color: '#D6A84F' }}>+{formatGC(mission.reward)} GC</span>}
                        {mission.rewardSC > 0 && <span className="text-xs font-bold text-emerald-400">+{mission.rewardSC} SC</span>}
                      </div>
                    </div>
                    <p className="text-xs mb-2" style={{ color: '#9CA3AF' }}>{mission.desc}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1E1E1E' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${isComplete ? 100 : progress}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className="h-full rounded-full"
                          style={{ background: isComplete ? '#10B981' : 'linear-gradient(90deg, #D6A84F, #F0C97A)' }}
                        />
                      </div>
                      <span className="text-[10px] flex-shrink-0" style={{ color: '#9CA3AF' }}>
                        {isComplete ? 'Done' : `${mission.progress}/${mission.total}`}
                      </span>
                    </div>
                  </div>
                  {isComplete && !claimedIds.includes(mission.id) ? (
                    <button
                      onClick={() => isLoggedIn ? claimMission(mission.id) : openAuthModal()}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-black flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
                    >Claim</button>
                  ) : claimedIds.includes(mission.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Weekly missions */}
      {activeTab === 'weekly' && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Resets in 3d 14h 22m</p>
          {WEEKLY_MISSIONS.map((mission, i) => {
            const isComplete = mission.completed || claimedIds.includes(mission.id);
            const progress = (mission.progress / mission.total) * 100;
            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: isComplete ? 'rgba(16,185,129,0.15)' : 'rgba(214,168,79,0.1)' }}>
                    {isComplete ? '✓' : mission.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm" style={{ color: isComplete ? '#10B981' : '#F5E8C8' }}>{mission.title}</p>
                      <div className="flex items-center gap-1">
                        {mission.reward > 0 && <span className="text-xs font-bold" style={{ color: '#D6A84F' }}>+{formatGC(mission.reward)} GC</span>}
                        {mission.rewardSC > 0 && <span className="text-xs font-bold text-emerald-400">+{mission.rewardSC} SC</span>}
                      </div>
                    </div>
                    <p className="text-xs mb-2" style={{ color: '#9CA3AF' }}>{mission.desc}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1E1E1E' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${isComplete ? 100 : progress}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ background: isComplete ? '#10B981' : 'linear-gradient(90deg, #D6A84F, #F0C97A)' }}
                        />
                      </div>
                      <span className="text-[10px] flex-shrink-0" style={{ color: '#9CA3AF' }}>{isComplete ? 'Done' : `${mission.progress}/${mission.total}`}</span>
                    </div>
                  </div>
                  {isComplete && !claimedIds.includes(mission.id) ? (
                    <button onClick={() => claimMission(mission.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-black flex-shrink-0" style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}>Claim</button>
                  ) : claimedIds.includes(mission.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Achievements */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((ach, i) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 flex items-start gap-4"
              style={{ opacity: ach.earned ? 1 : 0.5 }}
            >
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0', ach.earned ? '' : 'grayscale')}
                style={{ background: ach.earned ? `${RARITY_COLORS[ach.rarity]}20` : 'rgba(255,255,255,0.05)', border: `1px solid ${ach.earned ? `${RARITY_COLORS[ach.rarity]}40` : '#1E1E1E'}` }}>
                {ach.earned ? ach.icon : '🔒'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm" style={{ color: ach.earned ? '#F5E8C8' : '#9CA3AF' }}>{ach.title}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: RARITY_COLORS[ach.rarity], background: `${RARITY_COLORS[ach.rarity]}15` }}>{ach.rarity}</span>
                </div>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{ach.desc}</p>
                {ach.earned && <p className="text-[10px] mt-1 text-emerald-400">✓ Earned</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="border-t border-[#1E1E1E] pt-4 text-center">
        <p className="text-xs text-[#9CA3AF]/60">18+ · No Purchase Necessary · Void Where Prohibited</p>
      </div>
    </div>
  );
}
