"use client";
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import { CloudUpload, CheckCircle, Loader2 } from 'lucide-react';

export default function PendingReportsBanner() {
    const { pendingCount, isSyncing, lastSyncResult, isOnline } = useOnlineStatus();

    // Show success briefly after sync
    if (lastSyncResult && lastSyncResult.synced > 0) {
        return (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-slide-up">
                <div className="p-2 bg-green-100 rounded-lg text-green-600 shrink-0">
                    <CheckCircle size={20} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-green-800">
                        {lastSyncResult.synced} {lastSyncResult.synced === 1 ? 'report' : 'reports'} uploaded successfully!
                    </p>
                    {lastSyncResult.failed > 0 && (
                        <p className="text-xs text-green-600">
                            {lastSyncResult.failed} {lastSyncResult.failed === 1 ? 'report' : 'reports'} failed — will retry later
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Show syncing state
    if (isSyncing) {
        return (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 animate-slide-up">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                    <Loader2 size={20} className="animate-spin" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-blue-800">Uploading queued reports...</p>
                    <p className="text-xs text-blue-600">Please wait while we sync your reports</p>
                </div>
            </div>
        );
    }

    // Show pending count when offline or has pending
    if (pendingCount === 0) return null;

    return (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 animate-slide-up">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0 relative">
                <CloudUpload size={20} />
                {/* Pulsing dot */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
            </div>
            <div className="min-w-0">
                <p className="text-sm font-bold text-amber-800">
                    {pendingCount} {pendingCount === 1 ? 'report' : 'reports'} pending upload
                </p>
                <p className="text-xs text-amber-600">
                    {isOnline
                        ? 'Uploading will start shortly...'
                        : 'Will be automatically submitted when you\u0027re back online'}
                </p>
            </div>
        </div>
    );
}
