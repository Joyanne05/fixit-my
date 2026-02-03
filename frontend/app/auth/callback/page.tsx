"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/apiClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error: authError } = await supabase.auth.getSession();

      console.log("Auth callback data:", data.session);

      if (authError) {
        setError(authError.message);
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      // Check if the user is authenticated
      if (data.session) {
        // Run your sync
        try {
          console.log("Access token: ", data.session.access_token); 
          await api.post(
            "/auth/sync-user",
            {},
            {
              headers: {
                Authorization: `Bearer ${data.session?.access_token}`,
              },
            }
          );
          router.replace("/dashboard");
        } catch (err) {
          console.error("Sync failed", err);
          router.replace("/dashboard");
        }
      } else {
        router.push("/");
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        {!error ? (
          <>
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
            <h1 className="text-xl font-medium text-gray-900">Sigining you in...</h1>
            <p className="text-gray-500">Preparing your IssueGuard dashboard.</p>
          </>
        ) : (
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <p className="text-red-600 font-medium">Authentication Error</p>
            <p className="text-sm text-red-500">{error}</p>
            <p className="text-xs text-gray-400 mt-2">Redirecting you back...</p>
          </div>
        )}
      </div>
    </div>
  );
}