'use client';
// Dependency-free SVG charts for the admin dashboard. No charting library is in
// the project deps, and these stay lightweight, themeable, and SSR-safe.
import { useId } from 'react';

// ── Sparkline ──────────────────────────────────────────────────────────────
export function Sparkline({ data, color = '#2DC97A', width = 96, height = 28 }: {
  data: number[]; color?: string; width?: number; height?: number;
}) {
  const gid = useId();
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const dx = width / (data.length - 1);
  const pts = data.map((v, i) => [i * dx, height - ((v - min) / span) * (height - 4) - 2]);
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Stacked area line chart (revenue by channel) ─────────────────────────────
export function AreaChart({ series, height = 220 }: {
  series: { label: string; color: string; data: number[] }[];
  height?: number;
}) {
  const gid = useId();
  const W = 720;
  const H = height;
  const pad = { t: 12, r: 8, b: 24, l: 8 };
  const n = series[0]?.data.length ?? 0;
  if (!n) return null;
  // stack the series so areas sit on top of each other
  const stacked = series[0].data.map((_, i) => series.reduce((sum, s) => sum + s.data[i], 0));
  const max = Math.max(...stacked) * 1.1 || 1;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const dx = innerW / (n - 1);
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;

  // Prefix sums per series, computed up front so nothing is reassigned in render.
  const prefixes: number[][] = [];
  series.reduce((prev, s) => {
    const next = prev.map((v, i) => v + s.data[i]);
    prefixes.push(next);
    return next;
  }, new Array(n).fill(0) as number[]);

  const layers = series.map((s, si) => {
    const lower = si === 0 ? new Array(n).fill(0) : prefixes[si - 1];
    const upper = prefixes[si];
    const top = upper.map((v, i) => [pad.l + i * dx, y(v)]);
    const bottom = lower.map((v: number, i: number) => [pad.l + i * dx, y(v)]).reverse();
    const d = [...top, ...bottom].map(([x, yy], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${yy.toFixed(1)}`).join(' ') + ' Z';
    const lineD = top.map(([x, yy], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${yy.toFixed(1)}`).join(' ');
    return { d, lineD, color: s.color };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        {layers.map((l, i) => (
          <linearGradient key={i} id={`${gid}-${i}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={l.color} stopOpacity="0.45" />
            <stop offset="100%" stopColor={l.color} stopOpacity="0.04" />
          </linearGradient>
        ))}
      </defs>
      {/* gridlines */}
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={pad.l} x2={W - pad.r} y1={pad.t + innerH * g} y2={pad.t + innerH * g} stroke="#1A2E22" strokeWidth="1" />
      ))}
      {layers.map((l, i) => (
        <g key={i}>
          <path d={l.d} fill={`url(#${gid}-${i})`} />
          <path d={l.lineD} fill="none" stroke={l.color} strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

// ── Bar chart (DAU) ──────────────────────────────────────────────────────────
export function BarChart({ data, color = '#F0B232', height = 200 }: {
  data: { day: string; value: number }[]; color?: string; height?: number;
}) {
  const W = 720;
  const H = height;
  const pad = { t: 10, r: 6, b: 22, l: 6 };
  const max = Math.max(...data.map((d) => d.value)) * 1.08 || 1;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const gap = 6;
  const bw = innerW / data.length - gap;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={pad.l} x2={W - pad.r} y1={pad.t + innerH * g} y2={pad.t + innerH * g} stroke="#1A2E22" strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = pad.l + i * (bw + gap);
        const yy = pad.t + innerH - h;
        return <rect key={i} x={x} y={yy} width={bw} height={h} rx="2" fill={color} opacity={0.55 + 0.45 * (d.value / max)} />;
      })}
    </svg>
  );
}

// ── Donut (coins in circulation) ─────────────────────────────────────────────
export function Donut({ data, size = 168, thickness = 22 }: {
  data: { label: string; value: number; color: string }[]; size?: number; thickness?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  // Precompute each segment's dash length and starting offset (no render-time reassignment).
  const dashes = data.map((d) => (d.value / total) * circ);
  const offsets = dashes.map((_, i) => dashes.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${c} ${c})`}>
        {data.map((d, i) => (
          <circle
            key={i}
            cx={c} cy={c} r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={thickness}
            strokeDasharray={`${dashes[i]} ${circ - dashes[i]}`}
            strokeDashoffset={-offsets[i]}
          />
        ))}
      </g>
    </svg>
  );
}
