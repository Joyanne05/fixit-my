"use client";
import React, { useState } from 'react';
import { Megaphone, Menu, X } from 'lucide-react';
import AuthModal from '@/app/auth/components/AuthModal';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  return <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-4 cursor-pointer">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Megaphone size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">IssueGuard</span>
          </div>


          {/* Desktop Actions */}
          <div className="md:flex items-center space-x-6">
            {/* <button className="text-sm font-semibold text-gray-700 hover:text-gray-900">Sign In</button> */}
            <button onClick ={() => setIsSignInModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md">
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