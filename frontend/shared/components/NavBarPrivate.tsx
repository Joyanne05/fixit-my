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
                    <div className="flex-shrink-0 flex items-center gap-4 cursor-pointer">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <img src="/fixitmy_logo.jpg" alt="FixItMY Logo" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">FixItMY</span>
                    </div>


                    {/* Desktop Actions */}
                    <div className="md:flex items-center space-x-6">
                        {/* <button className="text-sm font-semibold text-gray-700 hover:text-gray-900">Sign In</button> */}
                        <button onClick={() => router.push("/dashboard/report")} className="cursor-pointer bg-[#30a59c] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                            Report an Issue
                        </button>
                        <button className="cursor-pointer shadow-sm px-2 py-2 rounded-lg"><CircleUser /></button>
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