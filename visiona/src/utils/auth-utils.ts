// src/utils/auth-utils.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "client" | "architect";
  subscription?: "free" | "vip" | "premium";
}

export const AUTH_STORAGE_KEY = "visiona_auth";

export const getUser = (): User | null => {
  if (typeof window === "undefined") {
    return null; // Return null when running on the server
  }

  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return null;

    return JSON.parse(authData) as User;
  } catch (error) {
    console.error("Error parsing auth data:", error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getUser() !== null;
};

export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = "/"; // Redirect to homepage after logout
  }
};

// This function would be called from your React app (port 3000) after login
export const setAuthData = (user: User): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
};
