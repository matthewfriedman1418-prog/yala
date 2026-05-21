'use client';
import { useWalletStore } from '@/lib/store/wallet';
import { useUIStore } from '@/lib/store/ui';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { GlobalChat } from '../social/GlobalChat';
import { AuthModal } from '../modals/AuthModal';
import { ComingSoonModal } from '../modals/ComingSoonModal';
import { BuyCoinsModal } from '../modals/BuyCoinsModal';
import { RedeemModal } from '../modals/RedeemModal';
import { PromotionsDrawer } from '../drawers/PromotionsDrawer';
import { RainBanner } from '../social/RainBanner';
import { LiveWinFeed } from '../ui/LiveWinFeed';
import { MessageCircle } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { activeCurrency } = useWalletStore();
  const { chatOpen, toggleChat } = useUIStore();

  return (
    <div data-currency={activeCurrency} className="flex h-screen overflow-hidden" style={{ backgroundColor: '#060E0A' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        {/* Extra bottom padding = 36px LiveWinFeed + 16px gap */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-4 py-6 pb-28 lg:pb-14">
            {children}
          </div>
        </main>
      </div>

      {/* Panels */}
      <GlobalChat />
      <PromotionsDrawer />

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <MobileBottomNav />
      </div>

      {/* Modals */}
      <AuthModal />
      <ComingSoonModal />
      <BuyCoinsModal />
      <RedeemModal />
      <RainBanner />

      {/* Floating chat button — teal-gold gradient, sits above LiveWinFeed */}
      {!chatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-14 right-4 lg:bottom-12 lg:right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #2DC97A, #F0B232)', boxShadow: '0 4px 16px rgba(45,201,122,0.4)' }}
          aria-label="Open live chat"
        >
          <MessageCircle className="w-5 h-5 text-black font-bold" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 flex items-center justify-center" style={{ borderColor: '#060E0A' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </span>
        </button>
      )}

      {/* Live Win Feed — fixed bottom strip */}
      <LiveWinFeed />
    </div>
  );
}
