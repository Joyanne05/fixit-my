"use client";

import { supabase } from "@/lib/supabaseClient";
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Error signing in:", error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg w-80 md:w-96">
        <div className="relative flex items-center justify-center mb-6">
          <h2 className="text-2xl font-bold">Sign In</h2>
          <button
            onClick={onClose}
            className="absolute right-0 p-1 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X size={24} onClick={onClose}/>
          </button>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="flex justify-center bg-slate-white border border-slate-300 px-6 py-3 rounded-lg hover:bg-slate-100 transition duration-300 ease-in-out cursor-pointer w-full"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-3" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
