import { useEffect, useRef } from 'react';

interface UseTouchSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  minDistance?: number;
  maxTime?: number;
  enabled?: boolean;
}

export function useTouchSwipe<T extends HTMLElement = HTMLDivElement>(options: UseTouchSwipeOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minDistance = 60,
    maxTime = 400,
    enabled = true,
  } = options;

  const elementRef = useRef<T | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = elementRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      // If user is touching an input, select, textarea or a scrollable inner element, don't hijack
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('.no-swipe')
      ) {
        touchStartRef.current = null;
        return;
      }

      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now(),
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      if (e.changedTouches.length === 0) return;

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now(),
      };

      const diffX = touchEnd.x - touchStartRef.current.x;
      const diffY = touchEnd.y - touchStartRef.current.y;
      const diffTime = touchEnd.time - touchStartRef.current.time;

      touchStartRef.current = null;

      if (diffTime > maxTime) return;

      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);

      // Require horizontal dominance for left/right swipes
      if (absX > minDistance && absX > absY * 1.5) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(15);
          } catch {
            // Ignore vibration error
          }
        }

        // In RTL layout (Arabic):
        // Swiping fingers to the left (negative diffX) moves to next item
        // Swiping fingers to the right (positive diffX) moves to previous item
        if (diffX < 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      } else if (absY > minDistance && absY > absX * 1.5) {
        if (diffY < 0) {
          onSwipeUp?.();
        } else {
          onSwipeDown?.();
        }
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minDistance, maxTime, enabled]);

  return elementRef;
}
