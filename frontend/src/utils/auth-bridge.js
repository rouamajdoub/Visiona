/**
 * This utility provides functions to help synchronize auth state between
 * the React app (port 3000) and Next.js app (port 3001)
 */

// Shared constants for both apps
export const AUTH_STORAGE_KEY = "visiona_auth";
export const TOKEN_STORAGE_KEY = "token";

/**
 * Stores authentication data and notifies other tabs/windows
 * Should be called after successful login in the React app
 * @param {Object} user - The user object containing authentication data
 * @param {string} token - The authentication token
 */
export const syncAuthData = (user, token) => {
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
export const clearAuthData = () => {
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
 * @returns {Object|null} The user object or null if not authenticated
 */
export const getAuthUser = () => {
  if (typeof window === "undefined") return null;

  try {
    const userData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing auth data:", error);
    return null;
  }
};

/**
 * Gets the authentication token
 * @returns {string|null} The auth token or null if not present
 */
export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Checks if user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return getAuthUser() !== null && getAuthToken() !== null;
};
