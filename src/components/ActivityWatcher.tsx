import React, { useEffect, useRef } from 'react';
import { useCatchUpStore } from '../store/useCatchUpStore';

export const ActivityWatcher: React.FC = () => {
  const { setAway, isAway } = useCatchUpStore();
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Page Visibility API
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setAway(true);
      } else {
        setAway(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 2. Inactivity detector (20 seconds)
    const resetInactivity = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      // If user was away from idle and moves, mark back
      if (isAway && !document.hidden) {
        setAway(false);
      }

      inactivityTimerRef.current = setTimeout(() => {
        // 20 seconds of no user interaction
        setAway(true);
      }, 20000);
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((event) => window.addEventListener(event, resetInactivity, { passive: true }));

    // Start timer initially
    resetInactivity();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      activityEvents.forEach((event) => window.removeEventListener(event, resetInactivity));
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [setAway, isAway]);

  return null;
};
