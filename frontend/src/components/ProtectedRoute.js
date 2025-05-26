// components/ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({
  children,
  roles = [], // Array of allowed roles
  requireApproved = false, // For architects, require approved status
  fallbackPath = "/login",
}) => {
  const { user, isAuthenticated, isLoading, isApprovedArchitect } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Check if architect needs to be approved
  if (requireApproved && user.role === "architect" && !isApprovedArchitect) {
    return (
      <Navigate
        to="/architect/pending-approval"
        state={{ from: location }}
        replace
      />
    );
  }

  // All checks passed - render children
  return children;
};

export default ProtectedRoute;
