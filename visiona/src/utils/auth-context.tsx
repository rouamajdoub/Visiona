"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  AUTH_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  User,
  getAuthUser,
  getAuthToken,
  clearAuthData,
} from "./auth-bridge";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  logout: async () => {},
  refreshAuthState: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthWithAPI = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/check", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Authentication check failed");
      }

      const data = await response.json();

      if (data.isAuthenticated && data.user) {
        // Store user data in localStorage for future use
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        return data.user;
      }

      return null;
    } catch (error) {
      console.error("Auth check error:", error);
      return null;
    }
  };

  const refreshAuthState = async () => {
    setIsLoading(true);

    // First try to get from localStorage
    let userData = getAuthUser();

    // If no user in localStorage but token exists, check with API
    if (!userData) {
      const token = getAuthToken();
      if (token) {
        userData = await checkAuthWithAPI(token);
      }
    }

    setUser(userData);
    setIsLoading(false);
  };

  const logout = async (): Promise<void> => {
    if (typeof window !== "undefined") {
      try {
        const token = getAuthToken();
        if (token) {
          // Call logout API
          await fetch("http://localhost:5000/api/auth/logout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        }
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        // Use the bridge utility to clear auth data
        clearAuthData();

        // Update local state
        setUser(null);

        // Redirect to homepage after logout
        window.location.href = "/";
      }
    }
  };

  useEffect(() => {
    // Initialize auth state
    refreshAuthState();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    refreshAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
