"use client";
import React, { useEffect, useState } from "react";
import { X, Share } from "lucide-react";

export default function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://');

        setIsStandalone(isStandaloneMode);
        if (isStandaloneMode) return;

        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Handle Android/Chrome native prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if (!isIosDevice) {
                setIsVisible(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Show iOS prompt after a delay
        if (isIosDevice) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000);
            return () => clearTimeout(timer);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsVisible(false);
        }
        setDeferredPrompt(null);
    };

    if (!isVisible || isStandalone) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
            <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                    <img
                        src="/fixit-my-192x192.jpg"
                        alt="FixItMY"
                        className="w-10 h-10 rounded-xl"
                    />
                    <div className="flex-1">
                        <h3 className="text-gray-900 font-bold text-sm">Install FixItMY</h3>
                        <p className="text-gray-500 text-xs">
                            Add to home screen for the best experience.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {isIOS ? (
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <span className="text-gray-400">1.</span>
                                <p className="text-gray-600">
                                    Tap the <Share size={14} className="inline mx-1 text-blue-500" /> <span className="text-gray-900 font-medium">Share</span> button below
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-gray-400">2.</span>
                                <p className="text-gray-600">
                                    Select <span className="text-gray-900 font-medium">Add to Home Screen</span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleInstallClick}
                            className="w-full bg-brand-primary text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-green-200 active:scale-[0.98] transition-transform"
                        >
                            Install Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
