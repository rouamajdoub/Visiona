// hooks/useAuth.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadMe,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectToken,
  selectAuthStatus,
  logoutUser,
} from "../redux/slices/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();

  // Selectors
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  const token = useSelector(selectToken);
  const status = useSelector(selectAuthStatus);

  // Load user data on hook initialization if token exists
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken && !user && !isLoading && status === "idle") {
      dispatch(loadMe());
    }
  }, [dispatch, user, isLoading, status]);

  // Functions to return
  const logout = () => {
    dispatch(logoutUser());
  };

  const reloadUser = () => {
    if (token) {
      dispatch(loadMe());
    }
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    token,
    status,

    // Actions
    logout,
    reloadUser,

    // Computed values
    isClient: user?.role === "client",
    isArchitect: user?.role === "architect",
    isAdmin: user?.role === "admin",
    isApprovedArchitect:
      user?.role === "architect" && user?.status === "approved",
  };
};
