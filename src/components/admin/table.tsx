'use client';
import { cn } from '@/lib/utils';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from './feedback';

// Composable table primitives — pages own their column config and row rendering,
// these just provide consistent styling, sticky headers, and hover states.

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#1A2E22] bg-[#0C1812]">
      <table className={cn('w-full text-sm border-collapse', className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-[#101C16] sticky top-0 z-10">
      <tr className="text-left">{children}</tr>
    </thead>
  );
}

export function Th({ children, className, align = 'left' }: { children?: React.ReactNode; className?: string; align?: 'left' | 'right' | 'center' }) {
  return (
    <th
      className={cn(
        'px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-[#8FA899] border-b border-[#1A2E22] whitespace-nowrap',
        align === 'right' && 'text-right', align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Tr({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-[#15241B] last:border-0 transition-colors',
        onClick && 'cursor-pointer hover:bg-white/[0.03]',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className, align = 'left' }: { children?: React.ReactNode; className?: string; align?: 'left' | 'right' | 'center' }) {
  return (
    <td className={cn('px-4 py-3 text-[#F5E8C8] align-middle', align === 'right' && 'text-right', align === 'center' && 'text-center', className)}>
      {children}
    </td>
  );
}

// ── Toolbar bits ─────────────────────────────────────────────────────────────
export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 mb-3">{children}</div>;
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8FA899]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0C1812] border border-[#1A2E22] text-sm text-[#F5E8C8] placeholder:text-[#8FA899] focus:outline-none focus:border-[var(--accent)]"
      />
    </div>
  );
}

export function FilterTabs<T extends string>({ tabs, value, onChange }: {
  tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0C1812] border border-[#1A2E22] overflow-x-auto no-scrollbar">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5',
            value === t.value ? 'bg-[var(--accent)] text-[#060E0A]' : 'text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5',
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={cn('text-[10px] px-1 rounded', value === t.value ? 'bg-black/20' : 'bg-white/10')}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// Reusable pagination footer.
export function Pagination({ page, pageCount, total, from, to, onPage }: {
  page: number; pageCount: number; total: number; from: number; to: number; onPage: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-between mt-3">
      <p className="text-xs text-[#8FA899]">Showing {total ? from : 0}–{to} of {total.toLocaleString()}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1.5 rounded-lg border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8] disabled:opacity-30" aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs text-[#8FA899] px-2">Page {page + 1} / {pageCount}</span>
        <button onClick={() => onPage(Math.min(pageCount - 1, page + 1))} disabled={page >= pageCount - 1} className="p-1.5 rounded-lg border border-[#1A2E22] text-[#8FA899] hover:text-[#F5E8C8] disabled:opacity-30" aria-label="Next page">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function EmptyRow({ colSpan, message = 'Nothing matches your filters yet.', title = 'No results' }: { colSpan: number; message?: string; title?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <EmptyState title={title} message={message} />
      </td>
    </tr>
  );
}
