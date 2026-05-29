'use client';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { PageHeader, Badge, AdminCard, fmtUSD, fmtNum } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, Toolbar, SearchInput, FilterTabs, EmptyRow } from '@/components/admin/table';
import { ADMIN_GAMES, type AdminGame } from '@/lib/mock-data/admin';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={cn('relative inline-flex h-5 w-9 items-center rounded-full transition-colors', on ? 'bg-[var(--accent)]' : 'bg-[#1A2E22]')}
    >
      <span className={cn('inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform', on ? 'translate-x-[18px]' : 'translate-x-1')} />
    </button>
  );
}

type Filter = 'all' | 'enabled' | 'disabled' | 'Originals' | 'Slots' | 'Live';

export default function GamesPage() {
  const [games, setGames] = useState<AdminGame[]>(ADMIN_GAMES);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const update = (id: string, patch: Partial<AdminGame>, msg: string) => {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    toast.success(msg);
  };

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return games.filter((g) => {
      if (filter === 'enabled' && !g.enabled) return false;
      if (filter === 'disabled' && g.enabled) return false;
      if ((filter === 'Originals' || filter === 'Slots' || filter === 'Live') && g.category !== filter) return false;
      if (needle && !g.name.toLowerCase().includes(needle) && !g.provider.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [games, q, filter]);

  const enabledCount = games.filter((g) => g.enabled).length;

  return (
    <>
      <PageHeader title="Games" subtitle={`${enabledCount} of ${games.length} games live`}>
        <button onClick={() => toast('Add game flow (mock)')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110">
          <Plus className="w-4 h-4" /> Add game
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Live games</p><p className="text-xl font-extrabold text-emerald-400 number-display mt-1">{enabledCount}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Featured</p><p className="text-xl font-extrabold text-[#F0B232] number-display mt-1">{games.filter((g) => g.featured).length}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">Disabled</p><p className="text-xl font-extrabold text-[#8FA899] number-display mt-1">{games.length - enabledCount}</p></AdminCard>
        <AdminCard className="p-4"><p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">30d GGR</p><p className="text-xl font-extrabold text-[#F5E8C8] number-display mt-1">{fmtUSD(games.reduce((s, g) => s + g.ggr30d, 0), { compact: true })}</p></AdminCard>
      </div>

      <Toolbar>
        <SearchInput value={q} onChange={setQ} placeholder="Search game or provider…" />
        <FilterTabs<Filter>
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: 'all', label: 'All' },
            { value: 'enabled', label: 'Live' },
            { value: 'disabled', label: 'Disabled' },
            { value: 'Originals', label: 'Originals' },
            { value: 'Slots', label: 'Slots' },
            { value: 'Live', label: 'Live casino' },
          ]}
        />
      </Toolbar>

      <Table>
        <THead>
          <Th>Game</Th>
          <Th>Category</Th>
          <Th align="right">RTP</Th>
          <Th align="right">30d GGR</Th>
          <Th align="right">Sessions</Th>
          <Th align="center">Featured</Th>
          <Th align="center">Hot</Th>
          <Th align="center">New</Th>
          <Th align="center">Live</Th>
        </THead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={9} /> : rows.map((g) => (
            <Tr key={g.id} className={cn(!g.enabled && 'opacity-55')}>
              <Td>
                <p className="font-semibold text-[#F5E8C8]">{g.name}</p>
                <p className="text-[11px] text-[#8FA899]">{g.provider}</p>
              </Td>
              <Td><Badge tone={g.category === 'Originals' ? 'purple' : g.category === 'Live' ? 'blue' : 'gray'}>{g.category}</Badge></Td>
              <Td align="right" className="number-display">{g.rtp.toFixed(1)}%</Td>
              <Td align="right" className="number-display">{g.enabled ? fmtUSD(g.ggr30d, { compact: true }) : '—'}</Td>
              <Td align="right" className="number-display text-[#8FA899]">{g.enabled ? fmtNum(g.sessions30d) : '—'}</Td>
              <Td align="center"><div className="flex justify-center"><Toggle on={g.featured} label={`Feature ${g.name}`} onClick={() => update(g.id, { featured: !g.featured }, `${g.name} ${g.featured ? 'unfeatured' : 'featured'}`)} /></div></Td>
              <Td align="center"><div className="flex justify-center"><Toggle on={g.isHot} label={`Hot ${g.name}`} onClick={() => update(g.id, { isHot: !g.isHot }, `${g.name} HOT ${g.isHot ? 'removed' : 'set'}`)} /></div></Td>
              <Td align="center"><div className="flex justify-center"><Toggle on={g.isNew} label={`New ${g.name}`} onClick={() => update(g.id, { isNew: !g.isNew }, `${g.name} NEW ${g.isNew ? 'removed' : 'set'}`)} /></div></Td>
              <Td align="center"><div className="flex justify-center"><Toggle on={g.enabled} label={`Enable ${g.name}`} onClick={() => update(g.id, { enabled: !g.enabled }, `${g.name} ${g.enabled ? 'disabled' : 'enabled'}`)} /></div></Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
