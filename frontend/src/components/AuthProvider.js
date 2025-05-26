// components/AuthProvider.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadMe,
  selectIsAuthenticated,
  selectIsLoading,
  selectToken,
  selectAuthStatus,
} from "../redux/slices/authSlice";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const token = useSelector(selectToken);
  const status = useSelector(selectAuthStatus);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken && !isAuthenticated && status === "idle") {
        try {
          await dispatch(loadMe()).unwrap();
        } catch (error) {
          console.log("Failed to load user:", error);
          // Token is invalid, remove it
          localStorage.removeItem("token");
        }
      }

      setIsInitialized(true);
    };

    initializeAuth();
  }, [dispatch, isAuthenticated, status]);

  // Show loading spinner while initializing
  if (!isInitialized || (isLoading && status === "loading")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
