"use client";
import React, { useState } from 'react';
import { Megaphone, Menu, X } from 'lucide-react';
import AuthModal from '@/app/auth/components/AuthModal';
import { useRouter } from 'next/navigation';

const Navbar: React.FC = () => {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const router = useRouter();

  return <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4 cursor-pointer">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-primary rounded-lg overflow-hidden flex items-center justify-center text-white ring-2 ring-brand-primary/10">
              <img src="/fixitmy_logo.jpg" alt="FixItMY Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900 hidden xs:block">FixItMY</span>
          </div>


          {/* Actions */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <button
              onClick={() => setIsSignInModalOpen(true)}
              className="cursor-pointer bg-brand-primary text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              Sign in
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