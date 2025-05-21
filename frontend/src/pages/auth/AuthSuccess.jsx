import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setCredentials } from "../../redux/slices/authSlice";
import axios from "axios";
import "./styles/Login.css";

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get token and userId from URL params
        const token = searchParams.get("token");
        const userId = searchParams.get("userId");
        const role = searchParams.get("role");

        if (!token || !userId) {
          console.error("Missing token or userId in URL params");
          navigate("/login?error=auth_failed");
          return;
        }

        // Verify token with the backend
        const response = await axios.get(
          `http://localhost:5000/api/auth/google/success?token=${token}&userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Handle successful login
        if (response.data.success) {
          // Store token and user data in Redux state
          dispatch(
            setCredentials({
              token,
              user: response.data.user,
              isFirstLogin: response.data.isFirstLogin,
            })
          );

          // Redirect based on user role
          switch (role) {
            case "admin":
              navigate("/admin");
              break;
            case "architect":
              if (response.data.isFirstLogin) {
                navigate("/subs");
              } else {
                navigate("/architect");
              }
              break;
            case "client":
              navigate("/Home");
              break;
            default:
              navigate("/");
          }
        } else {
          navigate("/login?error=auth_failed");
        }
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
        navigate("/login?error=auth_failed");
      }
    };

    handleOAuthCallback();
  }, [searchParams, dispatch, navigate]);

  return (
    <div className="oauth-loading">
      <div className="spinner"></div>
      <p>Completing login, please wait...</p>
    </div>
  );
};

export default OAuthSuccess;
