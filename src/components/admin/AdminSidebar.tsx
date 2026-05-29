'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/lib/store/admin';
import {
  LayoutDashboard, Users, Wallet, ShieldAlert, Gamepad2, Megaphone, Crown,
  Send, FileText, LifeBuoy, SlidersHorizontal, UserCog, ScrollText, BarChart3,
  ChevronsLeft, ChevronsRight, ChevronDown, ExternalLink,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { REDEMPTIONS, KYC_CASES, RG_RECORDS } from '@/lib/mock-data/admin';
import { AML_CASES, CHARGEBACKS, AMOE_ENTRIES } from '@/lib/mock-data/admin-extra';

interface Leaf { href: string; label: string; badge?: number; }
interface Group { label: string; icon: ComponentType<{ className?: string }>; href?: string; children?: Leaf[]; }

function nav(): Group[] {
  const pendRedemptions = REDEMPTIONS.filter((r) => r.status === 'pending' || r.status === 'in_review').length;
  const pendKyc = KYC_CASES.filter((k) => k.status === 'pending' || k.status === 'in_review').length;
  const rgReq = RG_RECORDS.filter((r) => r.status === 'requested').length;
  const amlOpen = AML_CASES.filter((c) => c.status === 'open' || c.status === 'escalated').length;
  const cbNew = CHARGEBACKS.filter((c) => c.status === 'new').length;
  const amoePend = AMOE_ENTRIES.filter((a) => a.status === 'pending').length;
  return [
    { label: 'Command Center', icon: LayoutDashboard, href: '/admin' },
    { label: 'Players', icon: Users, href: '/admin/players' },
    { label: 'Payments & Finance', icon: Wallet, children: [
      { href: '/admin/transactions', label: 'Transactions' },
      { href: '/admin/redemptions', label: 'Redemptions', badge: pendRedemptions },
      { href: '/admin/finance/ledger', label: 'Ledger & Recon' },
      { href: '/admin/finance/packages', label: 'Packages & Pricing' },
      { href: '/admin/finance/chargebacks', label: 'Chargebacks', badge: cbNew },
      { href: '/admin/finance/tax', label: 'Tax & Statements' },
    ] },
    { label: 'Compliance & Risk', icon: ShieldAlert, children: [
      { href: '/admin/kyc', label: 'KYC Queue', badge: pendKyc },
      { href: '/admin/compliance/aml', label: 'AML · Sanctions', badge: amlOpen },
      { href: '/admin/compliance/fraud', label: 'Fraud Rules' },
      { href: '/admin/compliance/devices', label: 'Devices & Dupes' },
      { href: '/admin/compliance', label: 'Responsible Gaming', badge: rgReq },
      { href: '/admin/compliance/geo', label: 'Geo & Jurisdiction' },
      { href: '/admin/compliance/amoe', label: 'AMOE', badge: amoePend },
    ] },
    { label: 'Casino / Game Ops', icon: Gamepad2, children: [
      { href: '/admin/games', label: 'Games' },
      { href: '/admin/games/providers', label: 'Providers' },
      { href: '/admin/games/categories', label: 'Categories' },
      { href: '/admin/games/rtp', label: 'RTP & Weighting' },
      { href: '/admin/games/rounds', label: 'Bet / Round Explorer' },
      { href: '/admin/games/jackpots', label: 'Jackpots' },
      { href: '/admin/games/monitors', label: 'Provider Monitors' },
    ] },
    { label: 'Engagement', icon: Megaphone, children: [
      { href: '/admin/engagement/bonuses', label: 'Bonuses' },
      { href: '/admin/promotions', label: 'Promos & Drops' },
      { href: '/admin/engagement/tags', label: 'Tags & Widgets' },
      { href: '/admin/engagement/spin-wheel', label: 'Spin Wheel' },
      { href: '/admin/engagement/missions', label: 'Missions' },
      { href: '/admin/engagement/tournaments', label: 'Tournaments' },
      { href: '/admin/engagement/leaderboards', label: 'Leaderboards' },
      { href: '/admin/affiliates', label: 'Referrals & Affiliates' },
    ] },
    { label: 'VIP & Hosts', icon: Crown, children: [
      { href: '/admin/vip/tiers', label: 'Tiers & Benefits' },
      { href: '/admin/vip/pnl', label: 'Player PNL Calculator' },
      { href: '/admin/vip/adjustments', label: 'Manual Adjustments' },
      { href: '/admin/vip/creators', label: 'Creator Program' },
    ] },
    { label: 'CRM & Messaging', icon: Send, children: [
      { href: '/admin/crm/segments', label: 'Segments' },
      { href: '/admin/crm/campaigns', label: 'Campaigns' },
      { href: '/admin/crm/bulk-assign', label: 'Bulk Assign (CSV)' },
    ] },
    { label: 'Content (CMS)', icon: FileText, children: [
      { href: '/admin/content/pages', label: 'Pages' },
      { href: '/admin/content/banners', label: 'Banners' },
      { href: '/admin/content/promo-content', label: 'Promo Content' },
    ] },
    { label: 'Support', icon: LifeBuoy, href: '/admin/support' },
    { label: 'System Settings', icon: SlidersHorizontal, children: [
      { href: '/admin/system/flags', label: 'Feature Flags' },
      { href: '/admin/system/jobs', label: 'Jobs & Monitors' },
      { href: '/admin/system/webhooks', label: 'Webhooks' },
      { href: '/admin/system/health', label: 'System Health' },
    ] },
    { label: 'Administrator', icon: UserCog, href: '/admin/staff' },
    { label: 'Audit Log', icon: ScrollText, href: '/admin/audit' },
    { label: 'Reports', icon: BarChart3, href: '/admin/reports' },
  ];
}

function YalaMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.85)} viewBox="0 0 40 34" fill="none">
      <defs><clipPath id="pyr-adm"><polygon points="20,0 40,34 0,34" /></clipPath></defs>
      <rect x="0" y="0" width="40" height="8.5" fill="#F0B232" clipPath="url(#pyr-adm)" />
      <rect x="0" y="8.5" width="40" height="8.5" fill="#84CC16" clipPath="url(#pyr-adm)" />
      <rect x="0" y="17" width="40" height="8.5" fill="#2DC97A" clipPath="url(#pyr-adm)" />
      <rect x="0" y="25.5" width="40" height="8.5" fill="#1A5C8A" clipPath="url(#pyr-adm)" />
    </svg>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useAdminStore();
  const collapsed = sidebarCollapsed;
  const groups = nav();

  const leafActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname === href;
  const groupActive = (g: Group) =>
    g.href ? leafActive(g.href) : !!g.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'));

  // Track which groups are open; default-open the group containing the active route.
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of groups) if (g.children && groupActive(g)) init[g.label] = true;
    return init;
  });

  const badge = (n?: number) =>
    n ? <span className="text-[10px] font-bold rounded-full min-w-[18px] text-center px-1 py-0.5 bg-[var(--accent)] text-[#060E0A]">{n}</span> : null;

  return (
    <aside
      className={cn('h-screen flex flex-col border-r border-[#1A2E22] overflow-y-auto no-scrollbar transition-[width] duration-200 ease-out flex-shrink-0', collapsed ? 'w-[68px]' : 'w-64')}
      style={{ backgroundColor: '#0A140F' }}
    >
      <Link href="/admin" className={cn('flex items-center border-b border-[#1A2E22] flex-shrink-0', collapsed ? 'justify-center px-2 py-4' : 'gap-2.5 px-4 py-4')}>
        <YalaMark size={collapsed ? 24 : 26} />
        {!collapsed && (
          <div className="leading-none">
            <p className="font-display text-base text-[#F5E8C8] tracking-wide">YALA</p>
            <p className="text-[9px] tracking-[0.18em] uppercase font-bold font-mono text-[#8FA899] mt-0.5">Admin Console</p>
          </div>
        )}
      </Link>

      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {groups.map((g) => {
          const Icon = g.icon;
          const active = groupActive(g);
          if (!g.children) {
            return (
              <Link
                key={g.label} href={g.href!} title={collapsed ? g.label : undefined}
                className={cn('w-full flex items-center rounded-lg text-sm transition-all', collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2',
                  active ? 'nav-item-active font-semibold' : 'text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5')}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="flex-1">{g.label}</span>}
              </Link>
            );
          }
          const isOpen = open[g.label] ?? false;
          return (
            <div key={g.label}>
              <button
                onClick={() => collapsed ? toggleSidebar() : setOpen((o) => ({ ...o, [g.label]: !o[g.label] }))}
                title={collapsed ? g.label : undefined}
                className={cn('w-full flex items-center rounded-lg text-sm transition-all', collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2',
                  active ? 'text-[#F5E8C8] font-semibold' : 'text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5')}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{g.label}</span>
                    <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isOpen && 'rotate-180')} />
                  </>
                )}
              </button>
              {!collapsed && isOpen && (
                <div className="ml-4 pl-2.5 border-l border-[#1A2E22] py-0.5 space-y-0.5">
                  {g.children.map((c) => (
                    <Link
                      key={c.href} href={c.href}
                      className={cn('flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] transition-all',
                        leafActive(c.href) ? 'nav-item-active font-semibold' : 'text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5')}
                    >
                      <span className="flex-1">{c.label}</span>
                      {badge(c.badge)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className={cn('flex-shrink-0 border-t border-[#1A2E22]', collapsed ? 'px-2 py-2' : 'px-3 py-2')}>
        <Link href="/casino" title={collapsed ? 'Back to site' : undefined}
          className={cn('w-full flex items-center rounded-lg text-xs font-semibold transition-all hover:bg-white/5 text-[#8FA899] hover:text-[#F5E8C8]', collapsed ? 'justify-center py-2' : 'gap-2 px-2 py-2')}>
          <ExternalLink className="w-4 h-4" />{!collapsed && 'Back to site'}
        </Link>
        <button onClick={toggleSidebar} aria-label={collapsed ? 'Expand' : 'Collapse'}
          className={cn('w-full flex items-center rounded-lg text-xs font-semibold transition-all hover:bg-white/5 text-[#8FA899] hover:text-[#F5E8C8]', collapsed ? 'justify-center py-2' : 'gap-2 px-2 py-2')}>
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <><ChevronsLeft className="w-4 h-4" />Collapse</>}
        </button>
      </div>
    </aside>
  );
}
