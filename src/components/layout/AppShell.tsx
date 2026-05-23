'use client';
import { useWalletStore } from '@/lib/store/wallet';
import { useUIStore } from '@/lib/store/ui';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileSideMenu } from './MobileSideMenu';
import { GlobalChat } from '../social/GlobalChat';
import { AuthModal } from '../modals/AuthModal';
import { ComingSoonModal } from '../modals/ComingSoonModal';
import { BuyCoinsModal } from '../modals/BuyCoinsModal';
import { RedeemModal } from '../modals/RedeemModal';
import { OnboardingModal } from '../modals/OnboardingModal';
import { PromotionsDrawer } from '../drawers/PromotionsDrawer';
import { RainBanner } from '../social/RainBanner';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { activeCurrency } = useWalletStore();
  const { chatOpen } = useUIStore();

  return (
    <div data-currency={activeCurrency} className="flex h-screen overflow-hidden" style={{ backgroundColor: '#060E0A' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content column — shrinks on desktop when chat is open so content
          isn't hidden behind the side panel */}
      <div
        className={cn(
          'flex flex-col flex-1 min-w-0 overflow-hidden transition-[margin] duration-300 ease-out',
          chatOpen && 'lg:mr-80'
        )}
      >
        {/* Header */}
        <Header />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-4 py-6 pb-20 lg:pb-10">
            {children}
          </div>
        </main>

      </div>

      {/* Side panels */}
      <GlobalChat />
      <PromotionsDrawer />

      {/* Mobile bottom nav + slide-up menu */}
      <div className="lg:hidden">
        <MobileBottomNav />
        <MobileSideMenu />
      </div>

      {/* Modals */}
      <AuthModal />
      <ComingSoonModal />
      <BuyCoinsModal />
      <RedeemModal />
      <OnboardingModal />
      <RainBanner />
    </div>
  );
}
