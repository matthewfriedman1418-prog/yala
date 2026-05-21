'use client';
import { useEffect } from 'react';
import { useUIStore } from '@/lib/store/ui';

export default function BuyPage() {
  const { openBuyCoins } = useUIStore();
  useEffect(() => { openBuyCoins(); }, [openBuyCoins]);
  return (
    <div className="flex items-center justify-center min-h-64">
      <p className="text-[#9CA3AF]">Opening buy coins…</p>
    </div>
  );
}
