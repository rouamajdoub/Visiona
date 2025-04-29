"use client";

/**
 * This utility provides functions to help synchronize auth state between
 * the React app (port 3000) and Next.js app (port 3001)
 */

// Shared constants for both apps
export const AUTH_STORAGE_KEY = "visiona_auth";
export const TOKEN_STORAGE_KEY = "token";

export interface User {
  _id: string;
  name?: string;
  pseudo?: string;
  prenom?: string;
  nomDeFamille?: string;
  email: string;
  role: "client" | "architect";
  subscription?: {
    status?: "free" | "vip" | "premium";
    expiresAt?: string;
  };
  profilePicture?: string;
  status?: string; // For architect approval status
}

/**
 * Stores authentication data and notifies other tabs/windows
 * Should be called after successful login in the React app
 */
export const syncAuthData = (user: User, token: string): void => {
  if (typeof window === "undefined") return;

  try {
    // Store user data and token
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    // Dispatch storage event to notify other tabs/windows
    const event = new StorageEvent("storage", {
      key: AUTH_STORAGE_KEY,
      newValue: JSON.stringify(user),
      url: window.location.href,
    });
    window.dispatchEvent(event);

    // Dispatch custom event for direct communication
    const customEvent = new CustomEvent("visiona_auth_changed");
    window.dispatchEvent(customEvent);
  } catch (error) {
    console.error("Failed to sync auth data:", error);
  }
};

/**
 * Clears authentication data and notifies other tabs/windows
 * Should be called after logout in either app
 */
export const clearAuthData = (): void => {
  if (typeof window === "undefined") return;

  try {
    // Store previous values for event
    const prevUserData = localStorage.getItem(AUTH_STORAGE_KEY);

    // Remove data from localStorage
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);

    // Dispatch storage event to notify other tabs/windows
    const event = new StorageEvent("storage", {
      key: AUTH_STORAGE_KEY,
      oldValue: prevUserData,
      newValue: null,
      url: window.location.href,
    });
    window.dispatchEvent(event);

    // Dispatch custom event for direct communication
    const customEvent = new CustomEvent("visiona_auth_changed");
    window.dispatchEvent(customEvent);
  } catch (error) {
    console.error("Failed to clear auth data:", error);
  }
};

/**
 * Gets the current authenticated user
 */
export const getAuthUser = (): User | null => {
  if (typeof window === "undefined") return null;

  try {
    const userData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!userData) return null;
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error("Error parsing auth data:", error);
    return null;
  }
};

/**
 * Gets the authentication token
 */
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Checks if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuthUser() !== null && getAuthToken() !== null;
};
