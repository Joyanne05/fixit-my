'use client';

import { X, LogIn, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';
import { api } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

interface SignInPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SignInPromptModal({ isOpen, onClose }: SignInPromptModalProps) {
    const router = useRouter();
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleAdminSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/admin/auth/login', {
                email,
                password,
            });

            const { access_token } = response.data;
            console.log("Admin login success, token received:", access_token);

            // Store admin token
            localStorage.setItem('admin_token', access_token);
            console.log("Token stored in localStorage");

            // Redirect
            onClose();
            router.push('/admin');
            console.log("Redirecting to /admin...");

        } catch (err: any) {
            console.error("Admin login error:", err);
            setError(err.response?.data?.detail || "Invalid email or password");
            setLoading(false);
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
                        {isAdminMode ? <Lock size={28} className="text-brand-primary" /> : <LogIn size={28} className="text-brand-primary" />}
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                    {isAdminMode ? 'Admin Login' : 'Sign In Required'}
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-center mb-8">
                    {isAdminMode ? 'Enter your admin credentials.' : 'Sign in to view reports and interact with your community.'}
                </p>

                {/* Sign In Forms */}
                {!isAdminMode ? (
                    <>
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

                        <div className="mt-4">
                            <button
                                onClick={() => setIsAdminMode(true)}
                                className="w-full text-gray-400 text-xs hover:text-brand-primary transition-colors"
                            >
                                Are you an admin? Login here
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleAdminSignIn} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                placeholder="Admin Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl hover:bg-brand-secondary transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In as Admin'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsAdminMode(false)}
                            className="w-full text-gray-500 text-sm hover:underline"
                        >
                            Back to Social Login
                        </button>
                    </form>
                )}

                {/* Cancel - Only show in normal mode as Admin mode has back button */}
                {!isAdminMode && (
                    <button
                        onClick={onClose}
                        className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                    >
                        Maybe later
                    </button>
                )}
            </div>
        </div>
    );
}
