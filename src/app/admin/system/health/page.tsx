'use client';
import { PageHeader, AdminCard } from '@/components/admin/primitives';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const SERVICES = [
  { name: 'API Gateway', status: 'ok', latency: '42ms', uptime: '99.99%' },
  { name: 'Ledger (Postgres)', status: 'ok', latency: '8ms', uptime: '99.99%' },
  { name: 'Wallet service', status: 'ok', latency: '15ms', uptime: '99.98%' },
  { name: 'Game RNG', status: 'ok', latency: '11ms', uptime: '100%' },
  { name: 'KYC vendor (Persona)', status: 'degraded', latency: '1.9s', uptime: '99.2%' },
  { name: 'Real-time (Pusher)', status: 'ok', latency: '60ms', uptime: '99.95%' },
  { name: 'Payments (Nuvei)', status: 'ok', latency: '210ms', uptime: '99.9%' },
];

export default function HealthPage() {
  return (
    <>
      <PageHeader title="System Health" subtitle="Service status & latency" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SERVICES.map((s) => (
          <AdminCard key={s.name} className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#F5E8C8]">{s.name}</span>
              {s.status === 'ok'
                ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                : <AlertTriangle className="w-5 h-5 text-amber-400" />}
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-[#8FA899]">
              <span>Latency <span className="text-[#F5E8C8] number-display">{s.latency}</span></span>
              <span>Uptime <span className="text-[#F5E8C8] number-display">{s.uptime}</span></span>
            </div>
          </AdminCard>
        ))}
      </div>
    </>
  );
}
