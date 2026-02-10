"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { getPendingCount, syncPendingReports } from '@/lib/offlineQueue';
import { useAuth } from '@/shared/context/AuthContext';

export interface OnlineStatus {
  isOnline: boolean | null;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncResult: { synced: number; failed: number } | null;
  refreshPendingCount: () => Promise<void>;
}

export function useOnlineStatus(): OnlineStatus {
  const { session } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ synced: number; failed: number } | null>(null);
  const hasSyncedRef = useRef(false);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPendingCount(count);
    } catch {
      // IndexedDB may not be available (SSR)
    }
  }, []);

  // Track online/offline state
  useEffect(() => {
    setIsOnline(navigator.onLine);
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      hasSyncedRef.current = false; // Allow sync on next effect cycle
    };
    const handleOffline = () => {
      setIsOnline(false);
      setLastSyncResult(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshPendingCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && !hasSyncedRef.current && pendingCount > 0 && session?.access_token) {
      hasSyncedRef.current = true;

      const doSync = async () => {
        setIsSyncing(true);
        setLastSyncResult(null);
        try {
          const result = await syncPendingReports(session.access_token);
          setLastSyncResult(result);
          await refreshPendingCount();
        } catch (error) {
          console.error('Sync failed:', error);
        } finally {
          setIsSyncing(false);
        }
      };

      doSync();
    }
  }, [isOnline, pendingCount, session, refreshPendingCount]);

  // Clear sync result after 4 seconds
  useEffect(() => {
    if (lastSyncResult) {
      const timer = setTimeout(() => setLastSyncResult(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [lastSyncResult]);

  return { isOnline, pendingCount, isSyncing, lastSyncResult, refreshPendingCount };
}
