'use client';

import { X, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface SignInPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SignInPromptModal({ isOpen, onClose }: SignInPromptModalProps) {
    if (!isOpen) return null;

    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error('Error signing in:', error.message);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-brand-bg-light rounded-full flex items-center justify-center">
                        <LogIn size={28} className="text-brand-primary" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                    Sign In Required
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-center mb-8">
                    Sign in to view reports and interact with your community.
                </p>

                {/* Sign In Button */}
                <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center justify-center w-full bg-white border-2 border-gray-200 px-6 py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer group"
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        className="w-5 h-5 mr-3"
                    />
                    <span className="font-semibold text-gray-700 group-hover:text-gray-900">
                        Continue with Google
                    </span>
                </button>

                {/* Cancel */}
                <button
                    onClick={onClose}
                    className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                    Maybe later
                </button>
            </div>
        </div>
    );
}
