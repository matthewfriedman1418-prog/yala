'use client';
import Link from 'next/link';
import { PageHeader, StatCard, AdminCard, CardHeader, fmtNum, fmtUSD, fmtAgo, Avatar } from '@/components/admin/primitives';
import { AreaChart, BarChart, Donut } from '@/components/admin/charts';
import {
  KPIS, REVENUE_30D, DAU_14D, COIN_CIRCULATION, TOP_GAMES_BY_HANDLE, AUDIT_LOG, ALERTS,
} from '@/lib/mock-data/admin';
import { AlertTriangle, Info, OctagonAlert, ArrowRight } from 'lucide-react';

const SEV = {
  critical: { icon: OctagonAlert, cls: 'text-red-400 bg-red-500/10 border-red-500/25' },
  warning: { icon: AlertTriangle, cls: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  info: { icon: Info, cls: 'text-blue-400 bg-blue-500/10 border-blue-500/25' },
} as const;

export default function AdminOverview() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Platform health at a glance — last 30 days">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0C1812] border border-[#1A2E22]">
          {['24h', '7d', '30d', '90d'].map((r) => (
            <button key={r} className={`px-2.5 py-1 rounded-md text-xs font-semibold ${r === '30d' ? 'bg-[var(--accent)] text-[#060E0A]' : 'text-[#8FA899] hover:text-[#F5E8C8]'}`}>{r}</button>
          ))}
        </div>
      </PageHeader>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        {KPIS.map((k) => <StatCard key={k.key} kpi={k} />)}
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
          <CardHeader title="Coins in circulation" />
          <div className="p-4 flex flex-col items-center">
            <Donut data={COIN_CIRCULATION} />
            <div className="w-full space-y-1.5 mt-4">
              {COIN_CIRCULATION.map((c) => (
                <div key={c.label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-[#8FA899]">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} />{c.label}
                  </span>
                  <span className="font-semibold text-[#F5E8C8] number-display">{fmtNum(c.value)}</span>
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
              <span className="text-[11px] text-[#8FA899] whitespace-nowrap">{fmtAgo(e.ts)}</span>
            </div>
          ))}
        </div>
      </AdminCard>
    </>
  );
}
