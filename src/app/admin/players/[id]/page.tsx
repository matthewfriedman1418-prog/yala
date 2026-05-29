'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AdminCard, CardHeader, StatusBadge, Badge, Avatar, RiskBadge, fmtUSD, fmtNum, fmtAgo } from '@/components/admin/primitives';
import { Table, THead, Th, Tr, Td, FilterTabs, EmptyRow } from '@/components/admin/table';
import { Tabs, Modal, Field, Input, Select } from '@/components/admin/controls';
import { getPlayer, PLAYER_EVENTS, RG_RECORDS, RG_LABELS } from '@/lib/mock-data/admin';
import { ROUNDS, DEVICE_CLUSTERS } from '@/lib/mock-data/admin-extra';
import { useLedgerStore, balancesFor, entriesFor, playthroughsFor, type LedgerCurrency } from '@/lib/admin/ledger';
import { playerRevenue } from '@/lib/admin/finance';
import { confirm } from '@/components/admin/confirm';
import { useAdminStore } from '@/lib/store/admin';
import {
  ArrowLeft, Ban, Flag, Coins, ShieldCheck, Mail, Calendar, Globe,
  BadgeCheck, Crown, Sparkles, Trash2, Users as UsersIcon,
} from 'lucide-react';

type Tab = 'details' | 'balances' | 'activity' | 'bets' | 'referrals' | 'duplicates' | 'notes' | 'promos';
type LimitTab = 'self_exclusion' | 'withdrawal' | 'deposit';

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const player = getPlayer(id);
  const operator = useAdminStore((s) => s.operator);
  const { entries, playthroughs, adjustBalance, voidPlaythrough } = useLedgerStore();

  const [tab, setTab] = useState<Tab>('details');
  const [limitTab, setLimitTab] = useState<LimitTab>('self_exclusion');
  const [activityFilter, setActivityFilter] = useState<'all' | 'purchases' | 'redemptions' | 'bonuses' | 'bets'>('all');
  const [note, setNote] = useState('');
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adj, setAdj] = useState({ currency: 'GC' as LedgerCurrency, amount: '', reason: 'goodwill' });

  if (!player) {
    return (
      <div className="text-center py-20">
        <p className="text-[#8FA899] mb-4">Player <code className="text-[#F5E8C8]">{id}</code> not found.</p>
        <Link href="/admin/players" className="text-[var(--accent)] font-semibold">← Back to players</Link>
      </div>
    );
  }

  const bal = balancesFor(entries, player.id);
  const ledger = entriesFor(entries, player.id);
  const pts = playthroughsFor(playthroughs, player.id);
  const limits = RG_RECORDS.filter((r) => r.player === player.username);
  const playerRounds = ROUNDS.filter((_, i) => i % 5 === 0).slice(0, 8); // sample
  const dupes = DEVICE_CLUSTERS.filter((d) => d.accounts.some((a) => a.username === player.username));

  const submitAdjust = () => {
    const amt = Number(adj.amount);
    if (!amt) return;
    adjustBalance({ playerId: player.id, currency: adj.currency, amount: amt, reason: adj.reason, operator: operator.email });
    toast.success(`${amt > 0 ? 'Credited' : 'Debited'} ${Math.abs(amt).toLocaleString()} ${adj.currency} · reason: ${adj.reason}`);
    setAdjustOpen(false);
    setAdj({ currency: 'GC', amount: '', reason: 'goodwill' });
  };

  return (
    <>
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-[#8FA899] hover:text-[#F5E8C8] mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <Avatar initials={player.avatar} size={56} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[#F5E8C8]">{player.username}</h1>
              <StatusBadge status={player.status} />
              <Badge tone="gray">T{player.vipTier} · {player.vipName}</Badge>
              <StatusBadge status={player.kyc} />
            </div>
            <div className="flex items-center gap-3 text-xs text-[#8FA899] mt-1 flex-wrap">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{player.email}</span>
              <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{player.country}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {player.joinDate}</span>
              <span>· {player.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setAdjustOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] hover:brightness-110"><Coins className="w-4 h-4" /> Manage Balance</button>
          <button onClick={() => toast.success(`${player.username} promoted to VIP`)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-purple-500/30 text-purple-400 hover:bg-purple-500/10"><Crown className="w-4 h-4" /> Promote VIP</button>
          <button onClick={() => toast(`Documentary KYC required for ${player.username}`)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5"><BadgeCheck className="w-4 h-4" /> Require Doc KYC</button>
          <button
            onClick={async () => {
              const r = await confirm({ title: `Ban ${player.username}?`, message: 'They lose access immediately and any pending redemptions are held. Reversible by an admin.', danger: true, requireReason: true, reasonOptions: ['Fraud confirmed', 'Multi-account abuse', 'Chargeback fraud', 'Compliance / sanctions', 'Other'], confirmLabel: 'Ban player' });
              if (r.confirmed) toast.error(`${player.username} banned · ${r.reason}`);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10"><Ban className="w-4 h-4" /> Ban</button>
        </div>
      </div>

      {/* Flags */}
      {player.flags.length > 0 && (
        <div className="mb-5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
          <p className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-1"><Flag className="w-4 h-4" /> Active flags</p>
          <ul className="text-sm text-[#F5E8C8] list-disc list-inside space-y-0.5">{player.flags.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
      )}

      {/* Balances */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {([['Gold Coins', bal.GC, '#F0B232'], ['Sweep Coins', bal.SC, '#10B981'], ['Bonus', bal.BONUS, '#F59E0B'], ['USD', bal.USD, '#3B82F6'], ['XP', bal.XP, '#8B5CF6']] as const).map(([label, val, color]) => (
          <AdminCard key={label} className="p-4">
            <p className="text-[11px] uppercase tracking-wide text-[#8FA899] font-semibold">{label}</p>
            <p className="text-lg font-extrabold number-display mt-1" style={{ color }}>{label === 'Sweep Coins' || label === 'USD' ? val.toFixed(2) : fmtNum(val)}</p>
          </AdminCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main column with tabs */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <Tabs<Tab>
              value={tab} onChange={setTab}
              tabs={[
                { value: 'details', label: 'Details' },
                { value: 'balances', label: 'Balances & Playthroughs', count: pts.length },
                { value: 'activity', label: 'Activity' },
                { value: 'bets', label: 'Bet History' },
                { value: 'referrals', label: 'Referrals' },
                { value: 'duplicates', label: 'Duplicates', count: dupes.length || undefined },
                { value: 'promos', label: 'Promos' },
                { value: 'notes', label: 'Notes' },
              ]}
            />
          </div>

          {tab === 'details' && (
            <AdminCard>
              <CardHeader title="Revenue" sub="NGR (profit) = GGR − Bonuses" />
              <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-[#15241B]">
                {(() => { const r = playerRevenue(player); return [
                  ['Deposits', fmtUSD(r.deposits), '#F5E8C8'],
                  ['Withdrawals', fmtUSD(r.withdrawals), '#F59E0B'],
                  ['Bonuses', fmtUSD(r.bonuses), '#8B5CF6'],
                  ['GGR', fmtUSD(r.ggr), '#F0B232'],
                  ['NGR (profit)', fmtUSD(r.ngr), r.ngr >= 0 ? '#2DC97A' : '#EF4444'],
                ] as const; })().map(([l, v, c]) => (
                  <div key={l} className="p-4"><p className="text-lg font-extrabold number-display" style={{ color: c }}>{v}</p><p className="text-[11px] text-[#8FA899]">{l}</p></div>
                ))}
              </div>
              <div className="border-t border-[#1A2E22] grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 p-4 text-sm">
                {([['Account type', 'Google'], ['Last login IP', '49.43.6.243'], ['Referred by', 'lapwing'], ['Jurisdiction', `${player.country} (last)`], ['Created', player.joinDate], ['Last seen', fmtAgo(player.lastSeen)]] as const).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-[#15241B] pb-1.5"><span className="text-[#8FA899]">{k}</span><span className="text-[#F5E8C8] font-medium">{v}</span></div>
                ))}
              </div>
            </AdminCard>
          )}

          {tab === 'balances' && (
            <>
              <AdminCard>
                <CardHeader title="Active playthroughs" sub="SC becomes withdrawable once the play requirement is met" />
                <Table>
                  <THead><Th>Type</Th><Th align="right">Amount</Th><Th align="right">×</Th><Th align="right">Requirement</Th><Th align="right">Total bet</Th><Th>Achieved</Th><Th></Th></THead>
                  <tbody>
                    {pts.length === 0 ? <EmptyRow colSpan={7} message="No playthroughs." /> : pts.map((p) => (
                      <Tr key={p.id}>
                        <Td className="capitalize">{p.type}</Td>
                        <Td align="right" className="number-display">{p.amount} {p.currency}</Td>
                        <Td align="right" className="number-display">{p.multiplier}</Td>
                        <Td align="right" className="number-display">{p.playRequirement}</Td>
                        <Td align="right" className="number-display">{p.totalBet}</Td>
                        <Td>{p.achieved ? <Badge tone="green">Met</Badge> : <Badge tone="amber">{Math.round((p.totalBet / p.playRequirement) * 100)}%</Badge>}</Td>
                        <Td align="right">{!p.achieved && <button onClick={async () => { const r = await confirm({ title: 'Void this playthrough?', message: 'Marks the requirement met and writes a reversal to the ledger.', danger: true, requireReason: true, reasonOptions: ['Goodwill', 'Support correction', 'Bonus error', 'Other'] }); if (r.confirmed) voidPlaythrough(p.id, r.reason ?? 'manual void', operator.email); }} className="text-red-400 hover:text-red-300" title="Void playthrough"><Trash2 className="w-4 h-4" /></button>}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </AdminCard>
              <AdminCard>
                <CardHeader title="Ledger" sub="Append-only · derived balances" />
                <Table>
                  <THead><Th>Type</Th><Th>Reason</Th><Th align="right">Amount</Th><Th>Counter</Th><Th>By</Th><Th>When</Th></THead>
                  <tbody>
                    {ledger.slice(0, 12).map((e) => (
                      <Tr key={e.id}>
                        <Td><Badge tone={e.type === 'adjustment' ? 'purple' : e.amount >= 0 ? 'green' : 'gray'}>{e.type}</Badge></Td>
                        <Td className="text-[#8FA899] max-w-[220px] truncate">{e.reason}</Td>
                        <Td align="right" className={cnAmount(e.amount)}>{e.amount >= 0 ? '+' : ''}{e.amount.toLocaleString()} {e.currency}</Td>
                        <Td className="text-xs text-[#8FA899] font-mono">{e.counter}</Td>
                        <Td className="text-xs text-[#8FA899]">{e.operator ? e.operator.split('@')[0] : 'system'}</Td>
                        <Td className="text-xs text-[#8FA899]">{fmtAgo(e.ts)}</Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </AdminCard>
            </>
          )}

          {tab === 'activity' && (
            <AdminCard>
              <div className="p-3 border-b border-[#1A2E22]"><FilterTabs value={activityFilter} onChange={setActivityFilter} tabs={[{ value: 'all', label: 'All' }, { value: 'purchases', label: 'Purchases' }, { value: 'redemptions', label: 'Redemptions' }, { value: 'bonuses', label: 'Bonuses' }, { value: 'bets', label: 'Bets' }]} /></div>
              <div className="divide-y divide-[#15241B]">
                {PLAYER_EVENTS.map((e, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="text-sm text-[#F5E8C8]">{e.text}</span>
                    <span className="text-[11px] text-[#8FA899] whitespace-nowrap">{fmtAgo(e.ts)}</span>
                  </div>
                ))}
              </div>
            </AdminCard>
          )}

          {tab === 'bets' && (
            <AdminCard>
              <CardHeader title="Bet history" sub="Round-level · provably fair" />
              <Table>
                <THead><Th>Round</Th><Th>Game</Th><Th align="right">Bet</Th><Th align="right">×</Th><Th align="right">Payout</Th><Th>When</Th></THead>
                <tbody>
                  {playerRounds.map((r) => (
                    <Tr key={r.id}>
                      <Td className="font-mono text-xs">{r.id}</Td>
                      <Td>{r.game}</Td>
                      <Td align="right" className="number-display">{r.bet} {r.currency}</Td>
                      <Td align="right" className="number-display">{r.multiplier}×</Td>
                      <Td align="right" className={cnAmount(r.result === 'win' ? 1 : -1)}>{r.payout} {r.currency}</Td>
                      <Td className="text-xs text-[#8FA899]">{fmtAgo(r.ts)}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </AdminCard>
          )}

          {tab === 'referrals' && (
            <AdminCard>
              <CardHeader title="Referred users" sub="L1 reward 100K · L2 reward 400K" />
              <Table>
                <THead><Th>Display name</Th><Th align="right">Wagered</Th><Th>Joined</Th></THead>
                <tbody>
                  {['User2001', 'shrillingredjelly1870'].map((u) => (
                    <Tr key={u}><Td className="font-semibold">{u}</Td><Td align="right" className="number-display">0.00 SC</Td><Td className="text-xs text-[#8FA899]">Mar 26, 2024</Td></Tr>
                  ))}
                </tbody>
              </Table>
            </AdminCard>
          )}

          {tab === 'duplicates' && (
            <AdminCard>
              <CardHeader title="Linked accounts" sub="Shared device / IP / payment instrument" />
              <div className="p-4 space-y-3">
                {dupes.length === 0 ? <p className="text-sm text-[#8FA899] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> No duplicate signals.</p> : dupes.map((d) => (
                  <div key={d.id} className="rounded-lg border border-[#1A2E22] p-3">
                    <div className="flex items-center justify-between mb-2"><span className="text-sm text-[#F5E8C8] flex items-center gap-2"><UsersIcon className="w-4 h-4 text-amber-400" />{d.detail}</span><RiskBadge score={d.riskScore} /></div>
                    <div className="flex flex-wrap gap-2">{d.accounts.map((a) => <Link key={a.username} href={`/admin/players/${a.playerId}`} className="text-xs px-2 py-1 rounded bg-white/5 text-[#F5E8C8] hover:bg-white/10">{a.username} · {a.status}</Link>)}</div>
                    <button onClick={() => toast.success('Consolidation workflow started (mock)')} className="mt-2 text-xs font-semibold text-[var(--accent)]">Consolidate accounts →</button>
                  </div>
                ))}
              </div>
            </AdminCard>
          )}

          {tab === 'promos' && (
            <AdminCard>
              <CardHeader title="Assigned promos" action={<button onClick={() => toast.success('Promo assigned (mock)')} className="text-xs font-semibold text-[var(--accent)]">+ Assign</button>} />
              <Table>
                <THead><Th>Name</Th><Th>Type</Th><Th>Claimed</Th><Th>Status</Th><Th>Expires</Th></THead>
                <tbody>
                  {['Day 1 Reward', 'Weekend Reload', 'Welcome Pack'].map((n, i) => (
                    <Tr key={n}><Td className="font-semibold">{n}</Td><Td><Badge tone="blue">{i === 1 ? 'spin' : 'direct'}</Badge></Td><Td className="text-[#8FA899]">{i === 2 ? 'Claimed' : 'Unclaimed'}</Td><Td><StatusBadge status={i === 2 ? 'approved' : 'pending'} /></Td><Td className="text-xs text-[#8FA899]">Jun {10 + i}, 2026</Td></Tr>
                  ))}
                </tbody>
              </Table>
            </AdminCard>
          )}

          {tab === 'notes' && (
            <AdminCard>
              <CardHeader title="Status updates & notes" />
              <div className="divide-y divide-[#15241B]">
                <div className="px-4 py-3"><div className="flex items-center justify-between text-xs text-[#8FA899] mb-1"><span>lubaldo@yala.com</span><span>{fmtAgo('2026-05-27T22:44:00Z')}</span></div><p className="text-sm text-[#F5E8C8]"><Badge tone="gray">Closed</Badge> → <Badge tone="green">Active</Badge> Compliance reviewed; no significant risk observed.</p></div>
                <div className="px-4 py-3"><div className="flex items-center justify-between text-xs text-[#8FA899] mb-1"><span>lubaldo@yala.com</span><span>{fmtAgo('2026-05-27T22:43:00Z')}</span></div><p className="text-sm text-[#F5E8C8]"><Badge tone="green">Active</Badge> → <Badge tone="red">Closed</Badge> Suspended — duplicate account; consolidating.</p></div>
              </div>
              <div className="p-4 border-t border-[#1A2E22] flex gap-2">
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" />
                <button onClick={() => { if (note.trim()) { toast.success('Note saved'); setNote(''); } }} disabled={!note.trim()} className="px-4 py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)] disabled:opacity-40">Add</button>
              </div>
            </AdminCard>
          )}
        </div>

        {/* Right rail: limits */}
        <div className="space-y-4">
          <AdminCard>
            <CardHeader title="Player controls" />
            <div className="p-4">
              <div className="flex gap-1 p-1 rounded-lg bg-[#0C1812] border border-[#1A2E22] mb-3">
                {([['self_exclusion', 'Self-Excl.'], ['withdrawal', 'Withdrawal'], ['deposit', 'Deposit']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setLimitTab(v)} className={`flex-1 px-2 py-1.5 rounded-md text-xs font-semibold ${limitTab === v ? 'bg-[var(--accent)] text-[#060E0A]' : 'text-[#8FA899] hover:text-[#F5E8C8]'}`}>{l}</button>
                ))}
              </div>
              {limitTab === 'self_exclusion' ? (
                <div className="space-y-2">
                  <Field label="Exclusion period"><Select defaultValue=""><option value="">Select…</option><option>72 hours</option><option>30 days</option><option>6 months</option><option>1 year</option><option>Permanent</option></Select></Field>
                  <button onClick={() => toast.success('Self-exclusion applied')} className="w-full py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)]">Apply exclusion</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Field label="Daily limit"><Input type="number" placeholder="$ amount" /></Field>
                  <Field label="Weekly limit"><Input type="number" placeholder="$ amount" /></Field>
                  <Field label="Monthly limit"><Input type="number" placeholder="$ amount" /></Field>
                  <button onClick={() => toast.success(`${limitTab} limits saved`)} className="w-full py-2 rounded-lg text-sm font-semibold text-[#060E0A] bg-[var(--accent)]">Save limits</button>
                </div>
              )}
            </div>
          </AdminCard>

          <AdminCard>
            <CardHeader title="Active limits" />
            <div className="p-4 space-y-2">
              {limits.length === 0 ? <p className="text-sm text-[#8FA899] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> None.</p> : limits.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-2 text-sm"><span className="text-[#F5E8C8]">{RG_LABELS[l.type]}<span className="text-[#8FA899]"> · {l.detail}</span></span><StatusBadge status={l.status} /></div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>

      {/* Manage balance modal */}
      <Modal
        open={adjustOpen} onClose={() => setAdjustOpen(false)} title="Manage balance"
        footer={<div className="flex gap-2"><button onClick={() => setAdjustOpen(false)} className="flex-1 py-2 rounded-lg text-sm font-semibold border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8]">Cancel</button><button onClick={submitAdjust} disabled={!Number(adj.amount)} className="flex-1 py-2 rounded-lg text-sm font-bold text-[#060E0A] bg-[var(--accent)] disabled:opacity-40">Post adjustment</button></div>}
      >
        <div className="space-y-3">
          <p className="text-xs text-[#8FA899] flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Writes a reason-coded double-entry to the ledger. Balances are never set directly.</p>
          <Field label="Currency"><Select value={adj.currency} onChange={(e) => setAdj({ ...adj, currency: e.target.value as LedgerCurrency })}><option value="GC">Gold Coins</option><option value="SC">Sweep Coins</option><option value="BONUS">Bonus</option><option value="XP">XP</option></Select></Field>
          <Field label="Amount" hint="Positive to credit, negative to debit."><Input type="number" value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: e.target.value })} placeholder="e.g. 5000 or -2500" /></Field>
          <Field label="Reason code"><Select value={adj.reason} onChange={(e) => setAdj({ ...adj, reason: e.target.value })}><option value="goodwill">Goodwill</option><option value="correction">Correction</option><option value="promo_manual">Manual promo</option><option value="chargeback_reversal">Chargeback reversal</option><option value="vip_bonus">VIP bonus</option></Select></Field>
        </div>
      </Modal>
    </>
  );
}

function cnAmount(n: number) {
  return n >= 0 ? 'number-display text-emerald-400 font-semibold' : 'number-display text-red-400 font-semibold';
}
