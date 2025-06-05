import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./SubscriptionSuccess.css";
import Header from "./header/Header";
import {
  verifyCheckoutSession,
  fetchArchitectSubscription,
  selectVerifyStatus,
  selectCurrentSubscription,
  selectSubscriptionError,
  clearErrors,
  resetOperationStatus,
} from "../../redux/slices/subscriptionSlice";

const SubscriptionSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const verifyStatus = useSelector(selectVerifyStatus);
  const currentSubscription = useSelector(selectCurrentSubscription);
  const subscriptionError = useSelector(selectSubscriptionError);

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);

  // Get current user/architect ID
  const currentArchitect = useSelector((state) => state.auth?.user);
  const architectId = currentArchitect?._id || currentArchitect?.id;

  // Get session_id from URL parameters
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    dispatch(clearErrors());

    if (sessionId) {
      // Verify the checkout session
      dispatch(verifyCheckoutSession(sessionId));
    } else {
      setIsVerifying(false);
      console.error("No session_id found in URL");
    }
  }, [dispatch, sessionId]);

  useEffect(() => {
    if (verifyStatus === "succeeded") {
      setIsVerifying(false);
      setVerificationComplete(true);
      setSubscriptionDetails(currentSubscription);

      // Fetch updated subscription details
      if (architectId) {
        dispatch(fetchArchitectSubscription(architectId));
      }

      // Reset verify status
      dispatch(resetOperationStatus("verify"));
    } else if (verifyStatus === "failed") {
      setIsVerifying(false);
      console.error("Subscription verification failed:", subscriptionError);
    }
  }, [
    verifyStatus,
    currentSubscription,
    subscriptionError,
    dispatch,
    architectId,
  ]);

  const handleContinue = () => {
    navigate("/dashboard"); // Adjust route as needed
  };

  // Loading state
  if (isVerifying) {
    return (
      <section className="subscription-success-section">
        <Header />
        <div className="container" style={{ paddingTop: "60px" }}>
          <div className="success-content">
            <motion.div
              className="loading-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="loading-spinner"></div>
              <h2>Verifying your subscription...</h2>
              <p>Please wait while we confirm your payment.</p>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (verifyStatus === "failed" || !sessionId) {
    return (
      <section className="subscription-success-section">
        <Header />
        <div className="container" style={{ paddingTop: "60px" }}>
          <motion.div
            className="success-content error-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="error-icon">❌</div>
            <h1>Verification Failed</h1>
            <p className="error-message">
              {subscriptionError ||
                "Unable to verify your subscription. Please contact support."}
            </p>
            <div className="action-buttons"></div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Success state
  return (
    <section className="subscription-success-section">
      <Header />
      <div className="container" style={{ paddingTop: "60px" }}>
        <motion.div
          className="success-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="success-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            ✅
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Subscription Successful!
          </motion.h1>

          <motion.p
            className="success-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Welcome to your new plan! Your subscription has been activated
            successfully.
          </motion.p>

          {subscriptionDetails && (
            <motion.div
              className="subscription-details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3>Subscription Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="label">Plan:</span>
                  <span className="value">{subscriptionDetails.plan}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className="value status-active">
                    {subscriptionDetails.status}
                  </span>
                </div>
                {subscriptionDetails.startDate && (
                  <div className="detail-item">
                    <span className="label">Start Date:</span>
                    <span className="value">
                      {new Date(
                        subscriptionDetails.startDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {subscriptionDetails.endDate && (
                  <div className="detail-item">
                    <span className="label">Valid Until:</span>
                    <span className="value">
                      {new Date(
                        subscriptionDetails.endDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <motion.div
            className="next-steps"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <h3>What's Next?</h3>
            <ul className="next-steps-list">
              <li>✨ Access all premium features</li>
              <li>🏗️ Connect with top-rated architects</li>
              <li>📋 Use your project management dashboard</li>
              <li>💬 Enjoy unlimited messaging</li>
              <li>🎯 Get priority support</li>
            </ul>
          </motion.div>

          <motion.div
            className="action-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <button className="btn-primary" onClick={handleContinue}>
              Go to Dashboard
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SubscriptionSuccess;
