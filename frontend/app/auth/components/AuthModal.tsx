"use client";

import { supabase } from "@/lib/supabaseClient";
import { X, Lock, LogIn } from 'lucide-react'; // Added icons
import { useState } from "react";
import { api } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      onClose(); // Close modal first
      router.push('/admin');
      console.log("Redirecting to /admin...");

    } catch (err: any) {
      console.error("Admin login error:", err);
      setError(err.response?.data?.detail || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-12 h-12 bg-brand-bg-light rounded-full flex items-center justify-center mb-3 text-brand-primary">
            {isAdminMode ? <Lock size={20} /> : <LogIn size={20} />}
          </div>
          <h2 className="text-2xl font-bold">{isAdminMode ? 'Admin Login' : 'Sign In'}</h2>
        </div>

        {!isAdminMode ? (
          <>
            <button
              onClick={handleGoogleSignIn}
              className="flex justify-center items-center bg-white border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition duration-300 ease-in-out cursor-pointer w-full font-medium text-gray-700"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-3" />
              Sign in with Google
            </button>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsAdminMode(true)}
                className="text-gray-400 text-xs hover:text-brand-primary transition-colors"
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
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-secondary transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In as Admin'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsAdminMode(false)}
                className="text-gray-500 text-sm hover:underline"
              >
                Back to Social Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
