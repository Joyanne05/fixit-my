"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
    session: Session | null;
    isAuthenticated: boolean;
    authChecked: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    isAuthenticated: false,
    authChecked: false,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setAuthChecked(true);
        });

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, newSession) => {
                setSession(newSession);
                setAuthChecked(true);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                isAuthenticated: !!session,
                authChecked,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
