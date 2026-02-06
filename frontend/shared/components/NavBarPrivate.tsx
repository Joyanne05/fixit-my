"use client";
import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import AuthModal from '@/app/auth/components/AuthModal';

import { CircleUser } from 'lucide-react';


const Navbar: React.FC = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

    return <>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo */}
                    <div
                        onClick={() => router.push("/dashboard")}
                        className="flex-shrink-0 flex items-center gap-2 sm:gap-4 cursor-pointer"
                    >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-primary rounded-lg overflow-hidden flex items-center justify-center text-white ring-2 ring-brand-primary/10">
                            <img src="/fixitmy_logo.jpg" alt="FixItMY Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-lg sm:text-xl tracking-tight text-gray-900 hidden xs:block">FixItMY</span>
                    </div>


                    {/* Actions */}
                    <div className="flex items-center space-x-3 sm:space-x-6">
                        <button
                            onClick={() => router.push("/dashboard/report")}
                            className="cursor-pointer bg-brand-primary text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
                        >
                            + Report Issue
                        </button>
                        <button className="cursor-pointer shadow-sm p-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors border border-gray-100">
                            <CircleUser size={20} />
                        </button>
                    </div>


                </div>
            </div>


        </nav>

        {/* 3. Render the Modal Component */}
        <AuthModal
            isOpen={isSignInModalOpen}
            onClose={() => setIsSignInModalOpen(false)}
        />
    </>;
};

export default Navbar;