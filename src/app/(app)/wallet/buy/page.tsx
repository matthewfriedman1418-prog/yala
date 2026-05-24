'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/store/ui';

/**
 * /wallet/buy is a shortcut URL — it opens the Buy Coins modal and
 * lands the user on the wallet hub. Useful for marketing links and
 * the sidebar/header CTAs that need a clean URL to point at.
 */
export default function BuyRedirectPage() {
  const router = useRouter();
  const { openBuyCoins } = useUIStore();

  useEffect(() => {
    openBuyCoins();
    router.replace('/wallet');
  }, [openBuyCoins, router]);

  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div
          className="w-10 h-10 rounded-full mx-auto mb-3 border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(240,178,50,0.4)', borderTopColor: 'transparent' }}
        />
        <p className="text-sm" style={{ color: '#8FA899' }}>Opening Buy Coins…</p>
      </div>
    </div>
  );
}
