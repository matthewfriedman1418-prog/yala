'use client';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PageHeader, StatusBadge, PriorityBadge, Badge, AdminCard, CardHeader, Avatar, fmtAgo } from '@/components/admin/primitives';
import { FilterTabs, SearchInput } from '@/components/admin/table';
import { TICKETS, type Ticket, type TicketStatus } from '@/lib/mock-data/admin';
import { Send, CheckCircle2, UserPlus } from 'lucide-react';

type Filter = 'all' | TicketStatus;

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS);
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState(TICKETS[0]?.id ?? '');
  const [reply, setReply] = useState('');

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tickets.filter((t) => {
      if (filter !== 'all' && t.status !== filter) return false;
      if (needle && !t.subject.toLowerCase().includes(needle) && !t.player.toLowerCase().includes(needle) && !t.id.includes(needle)) return false;
      return true;
    });
  }, [tickets, filter, q]);

  const selected = tickets.find((t) => t.id === selectedId) ?? list[0];
  const counts = tickets.reduce((a, t) => { a[t.status] = (a[t.status] ?? 0) + 1; return a; }, {} as Record<string, number>);

  const sendReply = () => {
    if (!reply.trim() || !selected) return;
    setTickets((prev) => prev.map((t) => (t.id === selected.id ? { ...t, status: 'pending', messages: t.messages + 1, assignee: t.assignee ?? 'Mara Okonkwo' } : t)));
    toast.success('Reply sent');
    setReply('');
  };

  const resolve = () => {
    if (!selected) return;
    setTickets((prev) => prev.map((t) => (t.id === selected.id ? { ...t, status: 'resolved' } : t)));
    toast.success(`${selected.id} marked resolved`);
  };

  const assignSelf = () => {
    if (!selected) return;
    setTickets((prev) => prev.map((t) => (t.id === selected.id ? { ...t, assignee: 'Mara Okonkwo' } : t)));
    toast.success('Assigned to you');
  };

  return (
    <>
      <PageHeader title="Support" subtitle={`${(counts.open ?? 0) + (counts.pending ?? 0)} open conversations`} />

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <SearchInput value={q} onChange={setQ} placeholder="Search subject, player, or ticket ID…" />
        <FilterTabs<Filter>
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: 'all', label: 'All', count: tickets.length },
            { value: 'open', label: 'Open', count: counts.open },
            { value: 'pending', label: 'Pending', count: counts.pending },
            { value: 'resolved', label: 'Resolved', count: counts.resolved },
            { value: 'closed', label: 'Closed', count: counts.closed },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inbox list */}
        <div className="space-y-2 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto no-scrollbar">
          {list.length === 0 && <p className="text-sm text-[#8FA899] text-center py-8">No tickets.</p>}
          {list.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`w-full text-left rounded-xl border p-3 transition-colors ${selected?.id === t.id ? 'border-[var(--accent)] bg-white/[0.04]' : 'border-[#1A2E22] bg-[#0C1812] hover:bg-white/[0.02]'}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-[11px] text-[#8FA899]">{t.id}</span>
                <PriorityBadge priority={t.priority} />
              </div>
              <p className="text-sm font-semibold text-[#F5E8C8] truncate">{t.subject}</p>
              <p className="text-xs text-[#8FA899] truncate mt-0.5">{t.player} · {t.category}</p>
              <div className="flex items-center justify-between mt-2">
                <StatusBadge status={t.status} />
                <span className="text-[11px] text-[#8FA899]">{fmtAgo(t.updatedAt)}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div className="lg:col-span-2">
          {!selected ? (
            <AdminCard className="p-10 text-center text-[#8FA899]">Select a ticket.</AdminCard>
          ) : (
            <AdminCard className="flex flex-col">
              <CardHeader
                title={selected.subject}
                sub={`${selected.id} · ${selected.category}`}
                action={<div className="flex items-center gap-2"><PriorityBadge priority={selected.priority} /><StatusBadge status={selected.status} /></div>}
              />

              <div className="px-4 py-3 border-b border-[#1A2E22] flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Avatar initials={selected.player.slice(0, 2).toUpperCase()} size={28} />
                  <Link href={`/admin/players/${selected.playerId}`} className="text-sm font-semibold text-[#F5E8C8] hover:text-[var(--accent)]">{selected.player}</Link>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8FA899]">
                  <span>Assignee:</span>
                  {selected.assignee ? <Badge tone="blue">{selected.assignee}</Badge> : <span className="italic">Unassigned</span>}
                </div>
              </div>

              {/* Thread */}
              <div className="p-4 space-y-3 flex-1">
                <div className="flex gap-3">
                  <Avatar initials={selected.player.slice(0, 2).toUpperCase()} size={32} />
                  <div className="flex-1">
                    <div className="rounded-xl rounded-tl-sm bg-white/[0.03] border border-[#1A2E22] p-3">
                      <p className="text-sm text-[#F5E8C8]">{selected.preview}</p>
                    </div>
                    <p className="text-[11px] text-[#8FA899] mt-1">{fmtAgo(selected.createdAt)}</p>
                  </div>
                </div>
                {selected.messages > 1 && (
                  <div className="flex gap-3 flex-row-reverse">
                    <Avatar initials="MO" size={32} hue="#F0B232" />
                    <div className="flex-1 text-right">
                      <div className="inline-block text-left rounded-xl rounded-tr-sm bg-[var(--accent)]/10 border border-[var(--accent)]/25 p-3">
                        <p className="text-sm text-[#F5E8C8]">Thanks for reaching out — we&apos;re looking into this now and will update you shortly.</p>
                      </div>
                      <p className="text-[11px] text-[#8FA899] mt-1">{fmtAgo(selected.updatedAt)} · {selected.assignee ?? 'Support'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="p-4 border-t border-[#1A2E22]">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  placeholder="Type a reply…"
                  className="w-full rounded-lg bg-[#0C1812] border border-[#1A2E22] text-sm text-[#F5E8C8] placeholder:text-[#8FA899] p-2.5 focus:outline-none focus:border-[var(--accent)] resize-none"
                />
                <div className="flex items-center gap-2 mt-2">
                  {!selected.assignee && (
                    <button onClick={assignSelf} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5">
                      <UserPlus className="w-4 h-4" /> Assign to me
                    </button>
                  )}
                  <button onClick={resolve} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                    <CheckCircle2 className="w-4 h-4" /> Resolve
                  </button>
                  <button onClick={sendReply} disabled={!reply.trim()} className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-[#060E0A] bg-[var(--accent)] hover:brightness-110 disabled:opacity-40">
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </>
  );
}
