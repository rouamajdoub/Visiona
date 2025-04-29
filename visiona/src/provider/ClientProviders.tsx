// src/provider/ClientProviders.tsx
"use client";

import { AuthProvider } from "@/utils/auth-context";
import { useAuthSync } from "@/utils/useAuthSync";

function AuthSyncWrapper({ children }: { children: React.ReactNode }) {
  useAuthSync();
  return <>{children}</>;
}

// ✅ This is a NAMED export
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthSyncWrapper>{children}</AuthSyncWrapper>
    </AuthProvider>
  );
}
