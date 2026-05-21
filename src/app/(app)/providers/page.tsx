'use client';
import { motion } from 'framer-motion';
import { ALL_PROVIDERS } from '@/lib/mock-data/games';
import { useUIStore } from '@/lib/store/ui';
import { Layers } from 'lucide-react';

export default function ProvidersPage() {
  const { openComingSoon } = useUIStore();

  return (
    <div className="space-y-8 animate-[fade-in_0.3s_ease-out]">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4" style={{ color: '#D6A84F' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D6A84F' }}>Providers</span>
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5E8C8' }}>Game Providers</h1>
        <p style={{ color: '#9CA3AF' }}>World-class studios powering the Yala casino library.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {ALL_PROVIDERS.map((provider, i) => (
          <motion.button
            key={provider.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => openComingSoon(`${provider.name} games`)}
            className="glass-card p-5 text-center hover:border-[#D6A84F]/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center font-display font-bold text-lg" style={{ background: 'rgba(214,168,79,0.1)', color: '#D6A84F', border: '1px solid rgba(214,168,79,0.15)' }}>
              {provider.name.charAt(0)}
            </div>
            <p className="font-semibold text-sm mb-1 group-hover:text-[#D6A84F] transition-colors" style={{ color: '#F5E8C8' }}>{provider.name}</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>{provider.count} games</p>
          </motion.button>
        ))}
      </div>

      <div className="glass-card p-5 text-center">
        <p className="text-sm" style={{ color: '#9CA3AF' }}>More providers being added regularly. Contact us to inquire about provider partnerships.</p>
      </div>
    </div>
  );
}
