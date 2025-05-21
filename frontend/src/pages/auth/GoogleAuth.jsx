import React from "react";
import { FcGoogle } from "react-icons/fc";
import "./styles/Login.css";

const GoogleAuth = () => {
  const handleGoogleLogin = () => {
    // Use the correct backend route path
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <button
      type="button"
      className="google-auth-btn"
      onClick={handleGoogleLogin}
    >
      <FcGoogle className="google-icon" />
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleAuth;
