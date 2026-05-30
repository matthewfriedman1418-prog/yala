'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PageHeader, StatCard, AdminCard, CardHeader, fmtNum, fmtUSD, Avatar } from '@/components/admin/primitives';
import { AreaChart, BarChart, Sparkline } from '@/components/admin/charts';
import { TimeAgo } from '@/components/admin/feedback';
import { Drawer } from '@/components/admin/controls';
import { Table, THead, Th, Tr, Td } from '@/components/admin/table';
import {
  KPIS, REVENUE_30D, DAU_14D, TOP_GAMES_BY_HANDLE, AUDIT_LOG, ALERTS,
} from '@/lib/mock-data/admin';
import { SC_ECONOMY, SIGNUPS_DAILY } from '@/lib/mock-data/admin-extra';
import { FINANCE_KPIS } from '@/lib/admin/finance';
import { AlertTriangle, Info, OctagonAlert, ArrowRight, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';

const ACCENT_HEX = { gold: '#F0B232', teal: '#2DC97A', blue: '#3B82F6', purple: '#8B5CF6', amber: '#F59E0B' } as const;

const SEV = {
  critical: { icon: OctagonAlert, cls: 'text-red-400 bg-red-500/10 border-red-500/25' },
  warning: { icon: AlertTriangle, cls: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  info: { icon: Info, cls: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
} as const;

export default function AdminOverview() {
  const [signupsOpen, setSignupsOpen] = useState(false);
  const signupsTotal = SIGNUPS_DAILY.reduce((s, d) => s + d.value, 0);
  const maxSignup = Math.max(...SIGNUPS_DAILY.map((d) => d.value));
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Platform health at a glance — last 30 days">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0C1812] border border-[#1A2E22]">
          {['24h', '7d', '30d', '90d'].map((r) => (
            <button key={r} className={`px-2.5 py-1 rounded-md text-xs font-semibold ${r === '30d' ? 'bg-[var(--accent)] text-[#060E0A]' : 'text-[#8FA899] hover:text-[#F5E8C8]'}`}>{r}</button>
          ))}
        </div>
      </PageHeader>

      {/* Headline revenue stack: Deposits · Withdrawals · Bonuses · GGR · NGR(profit) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-3">
        {FINANCE_KPIS.map((k) => {
          const hex = ACCENT_HEX[k.accent];
          const positive = k.delta >= 0;
          const good = positive === k.upIsGood;
          return (
            <AdminCard key={k.key} className="p-4 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: hex, opacity: 0.7 }} />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8FA899]">{k.label}</p>
              <div className="flex items-end justify-between gap-2 mt-1.5">
                <p className="text-2xl font-extrabold text-[#F5E8C8] number-display">{fmtUSD(k.value, { compact: true })}</p>
                <Sparkline data={k.spark} color={hex} />
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded ${good ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                  {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{Math.abs(k.delta)}%
                </span>
                <span className="text-[11px] text-[#8FA899]">{k.note ?? 'vs prev. 30d'}</span>
              </div>
            </AdminCard>
          );
        })}
      </div>

      {/* Secondary engagement KPIs — New Signups drills into a daily breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {KPIS.filter((k) => ['dau', 'signups', 'arpu', 'kyc'].includes(k.key)).map((k) =>
          k.key === 'signups' ? (
            <button key={k.key} onClick={() => setSignupsOpen(true)} className="text-left group relative">
              <StatCard kpi={k} />
              <span className="absolute bottom-3 right-3 text-[11px] font-semibold text-[var(--accent)] inline-flex items-center gap-0.5 opacity-80 group-hover:opacity-100">Daily<ChevronRight className="w-3 h-3" /></span>
            </button>
          ) : <StatCard key={k.key} kpi={k} />,
        )}
      </div>

      {/* Alerts */}
      {ALERTS.length > 0 && (
        <AdminCard className="mb-5">
          <CardHeader title="Needs attention" sub={`${ALERTS.length} open items`} />
          <div className="divide-y divide-[#15241B]">
            {ALERTS.map((a) => {
              const s = SEV[a.severity];
              const Icon = s.icon;
              return (
                <Link key={a.id} href={a.href} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors group">
                  <span className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${s.cls}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#F5E8C8] truncate">{a.title}</p>
                    <p className="text-xs text-[#8FA899] truncate">{a.detail}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8FA899] group-hover:text-[var(--accent)] flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </AdminCard>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <AdminCard className="lg:col-span-2">
          <CardHeader
            title="Revenue by channel"
            sub="Card vs. crypto · last 30 days"
            action={
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-[#8FA899]"><span className="w-2.5 h-2.5 rounded-sm bg-[#2DC97A]" />Card</span>
                <span className="flex items-center gap-1.5 text-[#8FA899]"><span className="w-2.5 h-2.5 rounded-sm bg-[#F0B232]" />Crypto</span>
              </div>
            }
          />
          <div className="p-4">
            <AreaChart
              series={[
                { label: 'Card', color: '#2DC97A', data: REVENUE_30D.map((d) => d.card) },
                { label: 'Crypto', color: '#F0B232', data: REVENUE_30D.map((d) => d.crypto) },
              ]}
            />
            <div className="flex justify-between text-[10px] text-[#8FA899] mt-1 px-1">
              <span>{REVENUE_30D[0].day.slice(5)}</span>
              <span>{REVENUE_30D[Math.floor(REVENUE_30D.length / 2)].day.slice(5)}</span>
              <span>{REVENUE_30D[REVENUE_30D.length - 1].day.slice(5)}</span>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <CardHeader title="Sweep Coin economy" sub="GC has no cash value — only SC is tracked" />
          <div className="p-4 space-y-3">
            <div>
              <div className="flex items-end justify-between mb-1">
                <span className="text-xs text-[#8FA899]">In circulation</span>
                <span className="text-xl font-extrabold number-display" style={{ color: '#10B981' }}>{fmtNum(SC_ECONOMY.inCirculation)} SC</span>
              </div>
              {/* circulation vs issued bar */}
              <div className="h-2 rounded-full bg-[#101C16] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(SC_ECONOMY.inCirculation / SC_ECONOMY.issued) * 100}%`, background: '#10B981' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {([['Total issued', `${fmtNum(SC_ECONOMY.issued)} SC`], ['Redeemed to date', `${fmtNum(SC_ECONOMY.redeemed)} SC`], ['Pending redemption', `${fmtNum(SC_ECONOMY.pendingRedemption)} SC`], ['Redemption rate', `${SC_ECONOMY.redemptionRatePct}%`]] as const).map(([l, v]) => (
                <div key={l} className="rounded-lg bg-white/[0.02] border border-[#1A2E22] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-[#8FA899]">{l}</p>
                  <p className="text-sm font-bold text-[#F5E8C8] number-display mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </AdminCard>
      </div>

      {/* DAU + top games */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <AdminCard className="lg:col-span-2">
          <CardHeader title="Daily active players" sub="Last 14 days" />
          <div className="p-4">
            <BarChart data={DAU_14D} />
            <div className="flex justify-between text-[10px] text-[#8FA899] mt-1 px-1">
              <span>{DAU_14D[0].day.slice(5)}</span>
              <span>{DAU_14D[DAU_14D.length - 1].day.slice(5)}</span>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <CardHeader title="Top games" sub="By 30d handle" />
          <div className="divide-y divide-[#15241B]">
            {TOP_GAMES_BY_HANDLE.map((g, i) => (
              <div key={g.name} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-xs font-bold text-[#8FA899] w-4">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#F5E8C8] truncate">{g.name}</p>
                  <p className="text-[11px] text-[#8FA899] truncate">{g.provider}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#F5E8C8] number-display">{fmtNum(g.handle)}</p>
                  <p className="text-[11px] text-emerald-400 number-display">{fmtUSD(g.ggr, { compact: true })} GGR</p>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Activity log */}
      <AdminCard>
        <CardHeader title="Recent activity" sub="Operator & system audit trail" action={<Link href="#" className="text-xs font-semibold text-[var(--accent)]">View all</Link>} />
        <div className="divide-y divide-[#15241B]">
          {AUDIT_LOG.map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-2.5">
              <Avatar initials={e.actor === 'auto' ? 'SYS' : e.actor.split(' ').map((w) => w[0]).join('')} size={28} hue={e.actor === 'auto' ? '#8B5CF6' : '#2DC97A'} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[#F5E8C8]">
                  <span className="font-semibold">{e.actor === 'auto' ? 'System' : e.actor}</span>{' '}
                  <span className="text-[#8FA899]">{e.action.toLowerCase()}</span>{' '}
                  <span className="font-medium">{e.target}</span>
                </p>
              </div>
              <span className="text-[11px] text-[#8FA899] whitespace-nowrap"><TimeAgo ts={e.ts} /></span>
            </div>
          ))}
        </div>
      </AdminCard>

      {/* New Signups — daily breakdown drill-down */}
      <Drawer open={signupsOpen} onClose={() => setSignupsOpen(false)} title="New signups — daily breakdown" width="max-w-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div><p className="text-2xl font-extrabold text-[#F5E8C8] number-display">{fmtNum(signupsTotal)}</p><p className="text-xs text-[#8FA899]">last 30 days</p></div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#8FA899]"><span className="w-2.5 h-2.5 rounded-sm bg-[#2DC97A]" />Organic</span>
              <span className="flex items-center gap-1.5 text-[#8FA899]"><span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]" />Paid</span>
              <span className="flex items-center gap-1.5 text-[#8FA899]"><span className="w-2.5 h-2.5 rounded-sm bg-[#F0B232]" />Affiliate</span>
            </div>
          </div>
          {/* stacked daily bars */}
          <div className="flex items-end gap-[3px] h-32">
            {SIGNUPS_DAILY.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col justify-end" title={`${d.day}: ${d.value}`}>
                <div style={{ height: `${(d.source.affiliate / maxSignup) * 100}%`, background: '#F0B232' }} />
                <div style={{ height: `${(d.source.paid / maxSignup) * 100}%`, background: '#3B82F6' }} />
                <div style={{ height: `${(d.source.organic / maxSignup) * 100}%`, background: '#2DC97A' }} className="rounded-b-sm" />
              </div>
            ))}
          </div>
          <Table>
            <THead><Th>Day</Th><Th align="right">Total</Th><Th align="right">Organic</Th><Th align="right">Paid</Th><Th align="right">Affiliate</Th></THead>
            <tbody>
              {[...SIGNUPS_DAILY].reverse().slice(0, 14).map((d) => (
                <Tr key={d.day}>
                  <Td className="text-xs">{d.day}</Td>
                  <Td align="right" className="number-display font-semibold">{d.value}</Td>
                  <Td align="right" className="number-display text-[#8FA899]">{d.source.organic}</Td>
                  <Td align="right" className="number-display text-[#8FA899]">{d.source.paid}</Td>
                  <Td align="right" className="number-display text-[#8FA899]">{d.source.affiliate}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <p className="text-xs text-[#8FA899]">This is the pattern every KPI gets once real data flows in — click a metric, drill to its daily series and dimensional split.</p>
        </div>
      </Drawer>
    </>
  );
}
