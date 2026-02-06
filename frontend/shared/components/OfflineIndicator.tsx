"use client";
import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        // Initial check
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

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="bg-gray-900/90 backdrop-blur text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 justify-center mx-auto max-w-sm">
                <WifiOff size={20} className="text-red-400" />
                <span className="font-medium">You are offline</span>
            </div>
        </div>
    );
}
