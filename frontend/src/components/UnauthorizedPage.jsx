// components/UnauthorizedPage.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    if (user?.role === "client") {
      navigate("/Home");
    } else if (user?.role === "architect") {
      navigate("/architect");
    } else if (user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <style>{`
        .unauthorized-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
        }

        .unauthorized-content {
          max-width: 28rem;
          width: 100%;
          text-align: center;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
          padding: 2rem;
        }

        .unauthorized-header {
          margin-top: 1.5rem;
        }

        .unauthorized-title {
          margin-top: 1.5rem;
          font-size: 1.875rem;
          font-weight: 800;
          color: #1f2937;
          line-height: 1.2;
        }

        .unauthorized-description {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #4b5563;
          line-height: 1.4;
        }

        .lottie-container {
          width: 200px;
          height: 200px;
          margin: 1rem auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .unauthorized-buttons {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .btn-base {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          text-decoration: none;
        }

        .btn-base:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 0 4px rgba(99, 102, 241, 0.5);
        }

        .btn-secondary {
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #374151;
          background-color: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        .btn-secondary:hover {
          background-color: rgba(255, 255, 255, 0.9);
        }

        .btn-primary {
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #ffffff;
          background: #c095e9;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        .btn-primary:hover {
          background: #a97cd4;
        }

        .btn-danger {
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #dc2626;
          background-color: rgba(254, 242, 242, 0.7);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
        }

        .btn-danger:hover {
          background-color: rgba(254, 226, 226, 0.9);
        }

        .btn-danger:focus {
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 0 4px rgba(239, 68, 68, 0.5);
        }

        .user-info {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(243, 244, 246, 0.6);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .user-info-text {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0.25rem 0;
        }

        .user-info-highlight {
          font-weight: 500;
        }

        @media (min-width: 640px) {
          .unauthorized-container {
            padding: 3rem 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .unauthorized-container {
            padding: 3rem 2rem;
          }
        }
      `}</style>

      <div className="unauthorized-container">
        <div className="unauthorized-content">
          <div className="unauthorized-header">
            <h2 className="unauthorized-title">Unauthorized Access</h2>
            <p className="unauthorized-description">
              You do not have the necessary permissions to access this page.
            </p>

            <div className="lottie-container">
              <DotLottieReact
                src="https://lottie.host/65ab311d-9be8-426e-9ff2-435b85d688c1/9tN3oIqVR0.lottie"
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>

          <div className="unauthorized-buttons">
            <button onClick={handleGoBack} className="btn-base btn-secondary">
              Go Back
            </button>

            <button onClick={handleGoHome} className="btn-base btn-primary">
              Go to Home
            </button>

            <button onClick={logout} className="btn-base btn-danger">
              Sign Out
            </button>
          </div>

          {user && (
            <div className="user-info">
              <p className="user-info-text">
                Logged in as:{" "}
                <span className="user-info-highlight">{user.role}</span>
              </p>
              <p className="user-info-text">
                Email: <span className="user-info-highlight">{user.email}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UnauthorizedPage;
