'use client';
import { useEffect } from 'react';

/**
 * Accessibility helper for modals + drawers + the notifications panel.
 *
 *   - Escape key closes the panel
 *   - body scroll is locked while it's open (preserves scrollbar gutter
 *     to avoid the page jumping right when the bar disappears)
 *
 * Focus trap is intentionally NOT included here — Radix Dialog handles
 * that better than a hand-roll, and we'll migrate to it for v2. This
 * hook delivers ~80% of the win with ~10 lines of code.
 */
export function useModalA11y(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    // Body scroll lock with scrollbar-gutter preservation
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open, onClose]);
}
