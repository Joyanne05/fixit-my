"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { Trophy } from "lucide-react";

interface ToastData {
    id: number;
    points: number;
    label: string;
}

interface PointsToastContextType {
    showPointsToast: (points: number, label: string) => void;
}

const PointsToastContext = createContext<PointsToastContextType>({
    showPointsToast: () => { },
});

export const usePointsToast = () => useContext(PointsToastContext);

let toastCounter = 0;

export function PointsToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const showPointsToast = useCallback((points: number, label: string) => {
        const id = ++toastCounter;
        setToasts((prev) => [...prev, { id, points, label }]);

        // Auto-remove after animation
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <PointsToastContext.Provider value={{ showPointsToast }}>
            {children}

            {/* Toast container */}
            <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="points-toast pointer-events-auto flex items-center gap-3 bg-white border border-gray-100 shadow-xl rounded-2xl px-5 py-3.5 min-w-[220px]"
                    >
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <Trophy size={20} className="text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900">+{toast.points} Points!</p>
                            <p className="text-xs text-gray-500 truncate">{toast.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </PointsToastContext.Provider>
    );
}
