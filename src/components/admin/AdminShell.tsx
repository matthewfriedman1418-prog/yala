'use client';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { X } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { useAdminStore } from '@/lib/store/admin';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Persisted sidebar state uses skipHydration — rehydrate after mount.
  useEffect(() => {
    useAdminStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#060E0A' }} data-currency="GC">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
          <div className="relative z-10">
            <AdminSidebar />
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 -right-10 p-2 text-white/80 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 pb-16">{children}</div>
        </main>
      </div>

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
  );
}
