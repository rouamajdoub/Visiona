"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-context";

/**
 * Hook to synchronize authentication state between React and Next.js apps
 * This should be used in your Next.js app's layout or on critical pages
 */
export function useAuthSync() {
  const { refreshAuthState, isLoading } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Function to check auth status
    const checkAuth = async () => {
      await refreshAuthState();
      if (!initialized) {
        setInitialized(true);
      }
    };

    // Initial check
    checkAuth();

    // Set up event listeners for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "visiona_auth" || event.key === "token") {
        checkAuth();
      }
    };

    // Set up a timer to refresh auth state periodically
    const interval = setInterval(() => {
      checkAuth();
    }, 60000); // Check every minute

    // Listen for storage events (login/logout from other tabs)
    window.addEventListener("storage", handleStorageChange);

    // Custom event for direct communication between apps
    window.addEventListener("visiona_auth_changed", () => checkAuth());

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("visiona_auth_changed", () => checkAuth());
      clearInterval(interval);
    };
  }, [refreshAuthState, initialized]);

  return { isLoading, initialized };
}
