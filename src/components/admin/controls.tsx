'use client';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, Upload, Bold, Italic, List, Link2, Heading } from 'lucide-react';

// ── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs<T extends string>({ tabs, value, onChange }: {
  tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-[#1A2E22] overflow-x-auto no-scrollbar">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            'px-3.5 py-2 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors flex items-center gap-1.5',
            value === t.value
              ? 'border-[var(--accent)] text-[#F5E8C8]'
              : 'border-transparent text-[#8FA899] hover:text-[#F5E8C8]',
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ── Toggle switch ────────────────────────────────────────────────────────────
export function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      role="switch" aria-checked={on} aria-label={label} onClick={onClick}
      className={cn('relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0', on ? 'bg-[var(--accent)]' : 'bg-[#1A2E22]')}
    >
      <span className={cn('inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform', on ? 'translate-x-[18px]' : 'translate-x-1')} />
    </button>
  );
}

// ── Right-side drawer ────────────────────────────────────────────────────────
export function Drawer({ open, onClose, title, children, footer, width = 'max-w-xl' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; width?: string;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onClose} />
      <div className={cn('relative z-10 w-full bg-[#0A140F] border-l border-[#1A2E22] flex flex-col animate-slide-in-right', width)}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1A2E22] flex-shrink-0">
          <h3 className="font-bold text-[#F5E8C8]">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="px-5 py-3.5 border-t border-[#1A2E22] flex-shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

// ── Center modal ─────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-[#1A2E22] bg-[#0A140F] animate-bounce-in">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1A2E22]">
          <h3 className="font-bold text-[#F5E8C8]">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#8FA899] hover:text-[#F5E8C8] hover:bg-white/5"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-3.5 border-t border-[#1A2E22]">{footer}</div>}
      </div>
    </div>
  );
}

// ── Form fields ──────────────────────────────────────────────────────────────
export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#8FA899] uppercase tracking-wide">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="text-[11px] text-[#8FA899] mt-1 block">{hint}</span>}
    </label>
  );
}

const inputCls = 'w-full px-3 py-2 rounded-lg bg-[#0C1812] border border-[#1A2E22] text-sm text-[#F5E8C8] placeholder:text-[#8FA899] focus:outline-none focus:border-[var(--accent)]';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputCls, 'appearance-none', props.className)} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputCls, 'resize-none', props.className)} />;
}

// ── Mock upload box ──────────────────────────────────────────────────────────
export function UploadBox({ label = 'Drop files here or click to upload' }: { label?: string }) {
  const [name, setName] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button" onClick={() => ref.current?.click()}
      className="w-full rounded-lg border border-dashed border-[#1A2E22] bg-[#0C1812] py-6 flex flex-col items-center justify-center text-[#8FA899] hover:border-[var(--accent)] transition-colors"
    >
      <Upload className="w-5 h-5 mb-1.5" />
      <span className="text-xs">{name ?? label}</span>
      <input ref={ref} type="file" className="hidden" onChange={(e) => setName(e.target.files?.[0]?.name ?? null)} />
    </button>
  );
}

// ── Mock rich-text editor (toolbar is decorative; textarea is real) ───────────
export function RichText({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <div className="rounded-lg border border-[#1A2E22] bg-[#0C1812] overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#1A2E22]">
        {[Heading, Bold, Italic, List, Link2].map((Icon, i) => (
          <span key={i} className="p-1.5 rounded text-[#8FA899] hover:bg-white/5 cursor-default"><Icon className="w-3.5 h-3.5" /></span>
        ))}
        <span className="ml-auto text-[10px] text-[#8FA899] pr-1">Rich text</span>
      </div>
      <textarea defaultValue={defaultValue} rows={4} placeholder="Write content…" className="w-full bg-transparent text-sm text-[#F5E8C8] placeholder:text-[#8FA899] p-3 focus:outline-none resize-none" />
    </div>
  );
}
