import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

const focusStack: HTMLElement[] = [];

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

type ModalFocusOptions = {
  initialFocus?: 'first' | 'panel';
};

export function useModalFocus<T extends HTMLElement>(options: ModalFocusOptions = {}) {
  const { initialFocus = 'first' } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    container.tabIndex = -1;

    const focusInitial = () => {
      const focusables = getFocusable(container);
      if (initialFocus === 'panel' || focusables.length === 0) {
        container.focus();
      } else {
        focusables[0].focus();
      }
    };
    focusInitial();

    focusStack.push(container);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (focusStack[focusStack.length - 1] !== container) return;

      const focusables = getFocusable(container);
      if (focusables.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      const index = focusStack.indexOf(container);
      if (index >= 0) focusStack.splice(index, 1);
      document.removeEventListener('keydown', handleKeyDown, true);
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [initialFocus]);

  return ref;
}
