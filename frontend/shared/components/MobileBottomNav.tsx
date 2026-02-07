"use client";
import React from 'react';
import { Home, PlusCircle, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function MobileBottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true;
        if (path !== '/dashboard' && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 py-6 px-6 z-50 pb-safe">
            <div className="flex justify-center gap-20 items-center max-w-sm mx-auto">
                <button
                    onClick={() => router.push('/dashboard')}
                    className={`flex flex-col items-center gap-1 transition-colors ${isActive('/dashboard') ? 'text-brand-primary' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <Home size={24} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Home</span>
                </button>

                <button
                    onClick={() => router.push('/dashboard/report')}
                    className="flex flex-col items-center justify-center -mt-8"
                >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${isActive('/dashboard/report')
                        ? 'bg-brand-primary text-white ring-4 ring-brand-bg-light'
                        : 'bg-brand-primary text-white shadow-brand-primary/30'
                        }`}>
                        <PlusCircle size={28} />
                    </div>
                    <span className={`text-[10px] font-bold mt-1 ${isActive('/dashboard/report') ? 'text-brand-primary' : 'text-gray-400'
                        }`}>Add Report</span>
                </button>

                <button
                    onClick={() => router.push('/profile')}
                    className={`flex flex-col items-center gap-1 transition-colors ${isActive('/profile') ? 'text-brand-primary' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <User size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Profile</span>
                </button>
            </div>
        </div>
    );
}
