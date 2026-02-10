"use client";

import { AuthProvider } from "@/shared/context/AuthContext";
import { PointsToastProvider } from "@/shared/context/PointsToastContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <PointsToastProvider>
                {children}
            </PointsToastProvider>
        </AuthProvider>
    );
}
