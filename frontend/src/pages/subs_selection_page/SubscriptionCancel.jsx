import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./SubscriptionCancel.css";
import Header from "./header/Header";
import {
  clearCheckoutSession,
  clearErrors,
  resetOperationStatus,
} from "../../redux/slices/subscriptionSlice";

const SubscriptionCancel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get current user/architect info
  const currentArchitect = useSelector((state) => state.auth?.user);
  const architectName =
    currentArchitect?.name || currentArchitect?.firstName || "there";

  useEffect(() => {
    // Clear any checkout-related data and errors
    dispatch(clearCheckoutSession());
    dispatch(clearErrors());
    dispatch(resetOperationStatus("checkout"));
  }, [dispatch]);

  const handleRetryPayment = () => {
    navigate("/pricing");
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard"); // Adjust route as needed
  };

  const handleContactSupport = () => {
    // You can either navigate to a contact page or open email client
    window.location.href =
      "mailto:support@yourplatform.com?subject=Subscription Payment Issue";
  };

  const handleContinueAsFree = () => {
    // Navigate to dashboard or main app area
    navigate("/dashboard");
  };

  return (
    <section className="subscription-cancel-section">
      <Header />
      <div className="container" style={{ paddingTop: "60px" }}>
        <motion.div
          className="cancel-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="cancel-icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            😔
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Payment Cancelled
          </motion.h1>

          <motion.p
            className="cancel-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Hi {architectName}, your payment was cancelled and no charges were
            made to your account.
          </motion.p>

          <motion.div
            className="cancel-reasons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3>Common reasons for cancellation:</h3>
            <ul className="reason-list">
              <li>🤔 Need more time to decide</li>
              <li>💳 Payment method issues</li>
              <li>📋 Want to review plan features</li>
              <li>💰 Considering a different plan</li>
            </ul>
          </motion.div>

          <motion.div
            className="what-now"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <h3>What would you like to do?</h3>

            <div className="option-cards">
              <motion.div
                className="option-card primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="option-icon">🔄</div>
                <h4>Try Again</h4>
                <p>Return to pricing and complete your subscription</p>
                <button className="btn-primary" onClick={handleRetryPayment}>
                  View Pricing Plans
                </button>
              </motion.div>

              <motion.div
                className="option-card"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="option-icon">🆓</div>
                <h4>Continue with Free Plan</h4>
                <p>Keep using our platform with basic features</p>
                <button
                  className="btn-secondary"
                  onClick={handleContinueAsFree}
                >
                  Continue Free
                </button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="free-features-reminder"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <h4>With your Free plan, you still get:</h4>
            <div className="features-grid">
              <div className="feature-item">
                <span className="checkmark">✅</span>
                <span>Access to project posting</span>
              </div>
              <div className="feature-item">
                <span className="checkmark">✅</span>
                <span>Basic architect matching</span>
              </div>
              <div className="feature-item">
                <span className="checkmark">✅</span>
                <span>View architect profiles</span>
              </div>
              <div className="feature-item">
                <span className="checkmark">✅</span>
                <span>Limited messaging with architects</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="action-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <button className="btn-primary" onClick={handleRetryPayment}>
              Choose a Plan
            </button>
            <button className="btn-secondary" onClick={handleGoToDashboard}>
              Go to Dashboard
            </button>
            <button className="btn-link" onClick={handleContactSupport}>
              Need Help? Contact Support
            </button>
          </motion.div>

          <motion.div
            className="reassurance-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <div className="note-card">
              <div className="note-icon">🔒</div>
              <div className="note-content">
                <h5>Your data is safe</h5>
                <p>
                  No charges were made and your account remains active with free
                  features. You can upgrade anytime from your dashboard.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="upgrade-reminder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <p className="reminder-text">
              💡 <strong>Remember:</strong> You can upgrade to a premium plan
              anytime to unlock exclusive features like priority architect
              matching, unlimited messaging, and premium support.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SubscriptionCancel;
