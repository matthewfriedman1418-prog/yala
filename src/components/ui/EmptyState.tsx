'use client';
import { YalaIcon, type YalaIconName } from './YalaIcon';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: YalaIconName;
  title: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Branded empty state — single source of truth for "no data" UI.
 * Replaces the previous habit of each page rendering its own ad-hoc
 * "no items" message.
 */
export function EmptyState({
  icon = 'sparkle',
  title,
  body,
  ctaLabel,
  ctaHref,
  ctaOnClick,
  className,
  size = 'md',
}: EmptyStateProps) {
  const iconSize = size === 'lg' ? 48 : size === 'sm' ? 28 : 36;
  const padding  = size === 'lg' ? 'py-16' : size === 'sm' ? 'py-6' : 'py-12';

  const cta = ctaLabel && (
    <button
      onClick={ctaOnClick}
      className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95"
      style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', color: '#040814' }}
    >
      {ctaLabel}
    </button>
  );

  return (
    <div className={cn('flex flex-col items-center justify-center text-center px-6', padding, className)}>
      <div
        className="rounded-2xl flex items-center justify-center mb-4"
        style={{
          width:  size === 'lg' ? 80 : size === 'sm' ? 48 : 64,
          height: size === 'lg' ? 80 : size === 'sm' ? 48 : 64,
          background: 'rgba(240,178,50,0.06)',
          border: '1px solid rgba(240,178,50,0.18)',
        }}
      >
        <YalaIcon name={icon} size={iconSize} />
      </div>
      <p className={cn('font-semibold mb-1', size === 'sm' ? 'text-sm' : 'text-base')} style={{ color: '#F5E8C8' }}>
        {title}
      </p>
      {body && (
        <p className={cn('max-w-sm', size === 'sm' ? 'text-xs' : 'text-sm')} style={{ color: '#8FA3B8' }}>
          {body}
        </p>
      )}
      {ctaHref
        ? <Link href={ctaHref}>{cta}</Link>
        : cta}
    </div>
  );
}
