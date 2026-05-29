'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, Bell, ChevronDown, Rows3, Rows4 } from 'lucide-react';
import { useAdminStore } from '@/lib/store/admin';
import { ROLE_LABELS, PLAYERS } from '@/lib/mock-data/admin';
import { Avatar, StatusBadge } from './primitives';
import { ALERTS } from '@/lib/mock-data/admin';

export function AdminTopbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const router = useRouter();
  const { operator, density, toggleDensity } = useAdminStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return [];
    return PLAYERS.filter((p) => p.username.toLowerCase().includes(n) || p.email.toLowerCase().includes(n) || p.id.toLowerCase().includes(n)).slice(0, 6);
  }, [q]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setFocused(false); };
    window.addEventListener('mousedown', h);
    return () => window.removeEventListener('mousedown', h);
  }, []);

  const go = (id: string) => { setQ(''); setFocused(false); router.push(`/admin/players/${id}`); };

  return (
    <header className="h-14 flex-shrink-0 border-b border-[#1A2E22] flex items-center gap-3 px-4" style={{ backgroundColor: '#0A140F' }}>
      <button onClick={onOpenMobileNav} className="lg:hidden p-2 -ml-2 text-[#8FA899] hover:text-[#F5E8C8]" aria-label="Open menu">
        <Menu className="w-5 h-5" />
      </button>

      {/* Working global player search */}
      <div ref={boxRef} className="relative hidden sm:block flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FA899]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) go(results[0].id); }}
          placeholder="Search players by name, email, or ID…"
          className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0C1812] border border-[#1A2E22] text-sm text-[#F5E8C8] placeholder:text-[#8FA899] focus:outline-none focus:border-[var(--accent)]"
        />
        {focused && q.trim() && (
          <div className="absolute top-full mt-1 w-full rounded-xl border border-[#1A2E22] bg-[#0C1812] shadow-xl z-40 overflow-hidden">
            {results.length === 0 ? (
              <p className="px-3 py-3 text-sm text-[#8FA899]">No players match “{q}”.</p>
            ) : results.map((p) => (
              <button key={p.id} onMouseDown={() => go(p.id)} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 text-left">
                <Avatar initials={p.avatar} size={28} />
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#F5E8C8] truncate">{p.username}</p><p className="text-[11px] text-[#8FA899] truncate">{p.email} · {p.id}</p></div>
                <StatusBadge status={p.status} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 sm:hidden" />

      <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> DEMO DATA
      </span>

      {/* Density toggle */}
      <button onClick={toggleDensity} title={`Density: ${density}`} aria-label="Toggle row density" className="p-2 text-[#8FA899] hover:text-[#F5E8C8]">
        {density === 'comfortable' ? <Rows3 className="w-5 h-5" /> : <Rows4 className="w-5 h-5" />}
      </button>

      <button className="relative p-2 text-[#8FA899] hover:text-[#F5E8C8]" aria-label="Alerts">
        <Bell className="w-5 h-5" />
        {ALERTS.length > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">{ALERTS.length}</span>}
      </button>

      <div className="relative">
        <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/5">
          <Avatar initials={operator.avatar} size={30} />
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-xs font-bold text-[#F5E8C8]">{operator.name}</p>
            <p className="text-[10px] text-[#8FA899]">{ROLE_LABELS[operator.role]}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#8FA899]" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#1A2E22] bg-[#0C1812] shadow-xl z-30 overflow-hidden py-1">
              <div className="px-3 py-2 border-b border-[#1A2E22]">
                <p className="text-sm font-bold text-[#F5E8C8]">{operator.name}</p>
                <p className="text-xs text-[#8FA899]">{operator.email}</p>
              </div>
              {['Profile', 'Activity log', 'Help'].map((l) => (
                <button key={l} className="w-full text-left px-3 py-2 text-sm text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5">{l}</button>
              ))}
              <div className="border-t border-[#1A2E22] mt-1 pt-1"><button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">Sign out</button></div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
