'use client';
import { MotionConfig } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet';
import { useUIStore } from '@/lib/store/ui';
import { useSettingsStore } from '@/lib/store/settings';
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
import { NotificationsModal } from '../modals/NotificationsModal';
import { StoreHydration } from '../system/StoreHydration';
import { Toaster } from 'sonner';
import { PromotionsDrawer } from '../drawers/PromotionsDrawer';
import { RainBanner } from '../social/RainBanner';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { activeCurrency } = useWalletStore();
  const { chatOpen } = useUIStore();
  // Honor the user's "reduce motion" preference across every framer-motion
  // component in the app. "always" forces non-animated state regardless of
  // OS preference; "never" lets framer-motion animate freely.
  const reduceMotion = useSettingsStore((s) => s.display.reduceMotion);

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>
    <div data-currency={activeCurrency} className="flex h-screen overflow-hidden" style={{ backgroundColor: '#060E0A' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content column — header stays full-width (chat starts BELOW the
          h-14 header line, so the header doesn't need to make room), only the
          scrolling content gets pushed when chat opens. */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header — never shifts when chat opens */}
        <Header />

        {/* Scrollable page content — this is what makes room for the chat panel */}
        <main
          className={cn(
            'flex-1 overflow-y-auto transition-[margin] duration-300 ease-out',
            chatOpen && 'lg:mr-80'
          )}
        >
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
      <NotificationsModal />
      <RainBanner />

      {/* Persisted Zustand stores rehydrate after mount (skipHydration: true) */}
      <StoreHydration />

      {/* Global toast outlet — replaces ad-hoc `msg`/`copied` state on individual pages */}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#0C1812',
            border: '1px solid #1A2E22',
            color: '#F5E8C8',
            fontFamily: 'Manrope, system-ui, sans-serif',
          },
        }}
      />
    </div>
    </MotionConfig>
  );
}
