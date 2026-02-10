"use client";
import { useEffect, useState } from 'react';
import { WifiOff, CloudUpload } from 'lucide-react';
import { getPendingCount } from '@/lib/offlineQueue';

export default function OfflineIndicator() {
    // Start with null to avoid hydration mismatch (server doesn't have navigator)
    const [isOffline, setIsOffline] = useState<boolean | null>(null);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        // Only check after mount (client-side only)
        setIsOffline(!navigator.onLine);

        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Refresh pending count when offline status changes
    useEffect(() => {
        if (isOffline) {
            getPendingCount().then(setPendingCount).catch(() => { });
        }
    }, [isOffline]);

    // Don't render anything until we've checked, or if online
    if (isOffline === null || !isOffline) return null;

    return (
        <div className="fixed bottom-6 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-gray-900/90 backdrop-blur text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 justify-center mx-auto max-w-sm">
                <WifiOff size={20} className="text-red-400" />
                <span className="font-medium">You are offline</span>
                {pendingCount > 0 && (
                    <span className="flex items-center gap-1.5 text-amber-300 text-sm">
                        <CloudUpload size={14} />
                        <span>{pendingCount} queued</span>
                    </span>
                )}
            </div>
        </div>
    );
}
