'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui';
import { useAuthStore } from '@/lib/store/auth';
import { ArrowRight, Shield, Zap, Users, Star, ChevronRight } from 'lucide-react';
import { AuthModal } from '@/components/modals/AuthModal';
import { BuyCoinsModal } from '@/components/modals/BuyCoinsModal';

const FEATURES = [
  { icon: Zap, title: 'Yala Originals', desc: '12 exclusive provably fair desert games crafted in-house.' },
  { icon: Shield, title: 'Vault Rewards', desc: 'Lock your Gold Coins in the Vault and earn daily interest.' },
  { icon: Star, title: 'VIP Tiers', desc: 'Six prestige tiers from Wanderer to Sheikh. Each with real rakeback.' },
  { icon: Users, title: 'Play Together', desc: 'Join rooms, watch live, tip friends, and share the experience.' },
];

const ORIGINALS_PREVIEW = [
  { name: 'Mirage Crash', type: 'Crash', colors: ['#92400e', '#78350f'] },
  { name: 'Oasis Plinko', type: 'Plinko', colors: ['#065f46', '#134e4a'] },
  { name: 'Dune Mines', type: 'Mines', colors: ['#78350f', '#1c1917'] },
  { name: 'Scorpion Cases', type: 'Cases', colors: ['#1c1917', '#292524'] },
];

export default function LandingPage() {
  const { openAuthModal } = useUIStore();
  const { isLoggedIn } = useAuthStore();

  if (isLoggedIn && typeof window !== 'undefined') {
    window.location.replace('/casino');
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#050505', color: '#F5E8C8' }}>
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E]" style={{ backgroundColor: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(12px)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D6A84F, #A07830)' }}>
            <span className="text-black font-bold text-sm font-display">Y</span>
          </div>
          <span className="font-display text-xl font-bold tracking-wide" style={{ color: '#D6A84F' }}>YALA</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openAuthModal('login')}
            className="hidden sm:block px-4 py-2 text-sm font-medium border border-[#D6A84F]/30 text-[#D6A84F] rounded-lg hover:bg-[#D6A84F]/10 transition-all"
          >
            Login
          </button>
          <button
            onClick={() => openAuthModal('register')}
            className="px-4 py-2 text-sm font-semibold text-black rounded-lg transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
          >
            Sign Up Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(214,168,79,0.08) 0%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(16,185,129,0.04) 0%, transparent 60%)' }} />

        <svg className="absolute bottom-0 left-0 right-0 opacity-10" viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none">
          <path d="M0 150 Q360 80 720 140 Q1080 200 1440 120 V200 H0Z" fill="#D6A84F" />
          <path d="M0 170 Q360 110 720 160 Q1080 210 1440 140 V200 H0Z" fill="#B9915A" opacity="0.5" />
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
            style={{ borderColor: 'rgba(214,168,79,0.3)', backgroundColor: 'rgba(214,168,79,0.05)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6A84F] animate-pulse" />
            <span className="text-xs font-medium tracking-wide" style={{ color: '#D6A84F' }}>Luxury Desert Sweepstakes Casino</span>
          </motion.div>

          <h1 className="font-display text-5xl sm:text-7xl font-bold leading-tight mb-6">
            <span className="gold-shimmer">The Oasis</span>
            <br />
            <span style={{ color: '#F5E8C8' }}>Awaits</span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: '#9CA3AF' }}>
            Premium sweepstakes social casino. Play free with Gold Coins or compete with Sweep Coins. No purchase necessary. Pure desert luxury.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-8">
            <button
              onClick={() => openAuthModal('register')}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-black transition-all hover:opacity-90 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
            >
              Enter the Oasis
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/casino"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base border transition-all"
              style={{ borderColor: 'rgba(214,168,79,0.3)', color: '#D6A84F' }}
            >
              Browse Casino
            </Link>
          </div>

          <p className="text-xs" style={{ color: 'rgba(156,163,175,0.6)' }}>
            No Purchase Necessary · 18+ Only · Void Where Prohibited · Gold Coins Have No Cash Value
          </p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl font-bold mb-4" style={{ color: '#F5E8C8' }}>Built for the Discerning Player</h2>
            <p style={{ color: '#9CA3AF' }} className="max-w-xl mx-auto">Every feature crafted with the precision of a desert architect.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(214,168,79,0.1)', border: '1px solid rgba(214,168,79,0.2)' }}>
                    <Icon className="w-5 h-5" style={{ color: '#D6A84F' }} />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: '#F5E8C8' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#9CA3AF' }}>{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Originals preview */}
      <section className="py-20 px-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold" style={{ color: '#F5E8C8' }}>Yala Originals</h2>
              <p className="mt-1" style={{ color: '#9CA3AF' }}>12 exclusive games. Provably fair. Desert crafted.</p>
            </div>
            <Link href="/originals" className="flex items-center gap-1 text-sm hover:opacity-80 transition-opacity" style={{ color: '#D6A84F' }}>
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ORIGINALS_PREVIEW.map((g, i) => (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group"
                style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` }}
                onClick={() => openAuthModal('register')}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-xs font-bold" style={{ color: '#F5E8C8' }}>{g.name}</p>
                  <p className="text-[10px]" style={{ color: '#D6A84F' }}>{g.type}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="px-3 py-1.5 rounded-full text-xs font-semibold text-black" style={{ background: '#D6A84F' }}>
                    Sign Up to Play
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl font-bold mb-4" style={{ color: '#F5E8C8' }}>Six Tiers of Desert Prestige</h2>
            <p className="mb-12 max-w-xl mx-auto" style={{ color: '#9CA3AF' }}>From Wanderer to Sheikh — each tier unlocks higher rakeback, exclusive rewards, and private access.</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Wanderer', color: '#CD7F32', rakeback: '5%' },
              { name: 'Nomad', color: '#C0C0C0', rakeback: '8%' },
              { name: 'Oasis Seeker', color: '#D6A84F', rakeback: '12%' },
              { name: 'Caravan Lord', color: '#E5E4E2', rakeback: '16%' },
              { name: 'Desert Prince', color: '#10B981', rakeback: '20%' },
              { name: 'Sheikh', color: '#D6A84F', rakeback: '25%' },
            ].map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="px-5 py-4 rounded-xl border text-center min-w-[120px]"
                style={{ borderColor: `${tier.color}30`, backgroundColor: `${tier.color}08` }}
              >
                <p className="font-semibold text-sm mb-1" style={{ color: tier.color }}>{tier.name}</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{tier.rakeback} Rakeback</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12">
            <button
              onClick={() => openAuthModal('register')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-black transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #D6A84F, #F0C97A)' }}
            >
              Begin Your Journey
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E1E1E] px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D6A84F, #A07830)' }}>
                  <span className="text-black font-bold text-xs font-display">Y</span>
                </div>
                <span className="font-display text-lg font-bold" style={{ color: '#D6A84F' }}>YALA</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>
                Yala is a social sweepstakes casino. No real money gambling. Gold Coins have no cash value. For entertainment purposes only.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-3 text-sm">
              {[
                { label: 'Play', links: [{ href: '/casino', label: 'Casino' }, { href: '/originals', label: 'Originals' }, { href: '/sportsbook', label: 'Sportsbook' }] },
                { label: 'Legal', links: [{ href: '/terms', label: 'Terms' }, { href: '/privacy', label: 'Privacy' }, { href: '/sweepstakes-rules', label: 'Sweepstakes Rules' }, { href: '/responsible-gaming', label: 'Responsible Gaming' }] },
                { label: 'Help', links: [{ href: '/support', label: 'Support' }, { href: '/affiliate', label: 'Affiliate' }, { href: '/providers', label: 'Providers' }] },
              ].map((section) => (
                <div key={section.label} className="space-y-2">
                  <p className="font-semibold text-xs uppercase tracking-wide mb-2" style={{ color: '#D6A84F' }}>{section.label}</p>
                  {section.links.map((link) => (
                    <Link key={link.href} href={link.href} className="block text-sm transition-colors" style={{ color: '#9CA3AF' }}>{link.label}</Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-[#1E1E1E] pt-6 text-center space-y-2">
            <p className="text-xs" style={{ color: '#9CA3AF' }}>18+ | No Purchase Necessary | Void Where Prohibited | Play Responsibly</p>
            <p className="text-xs" style={{ color: 'rgba(156,163,175,0.6)' }}>
              © 2026 Yala Gaming LLC. Yala is a social sweepstakes platform. Gold Coins are virtual currency with no real-world value. Sweep Coins may be redeemed as permitted by applicable law. For problem gambling resources, call 1-800-522-4700 (NCPG).
            </p>
          </div>
        </div>
      </footer>

      <AuthModal />
      <BuyCoinsModal />
    </div>
  );
}
