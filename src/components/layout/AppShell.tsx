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
import { MessageCircle } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { activeCurrency } = useWalletStore();
  const { chatOpen, toggleChat } = useUIStore();

  return (
    <div data-currency={activeCurrency} className="flex h-screen overflow-hidden" style={{ backgroundColor: '#050505' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-4 py-6 pb-24 lg:pb-8">
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

      {/* Floating chat button — hidden when chat is open */}
      {!chatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #D6A84F, #A07830)' }}
          aria-label="Open live chat"
        >
          <MessageCircle className="w-5 h-5 text-black" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#050505] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </span>
        </button>
      )}
    </div>
  );
}
