// src/app/ClientProviders.tsx
"use client";

import { AuthProvider } from "@/utils/auth-context";
import { useAuthSync } from "@/utils/useAuthSync";

function AuthSyncWrapper({ children }: { children: React.ReactNode }) {
  useAuthSync();
  return <>{children}</>;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthSyncWrapper>{children}</AuthSyncWrapper>
    </AuthProvider>
  );
}
