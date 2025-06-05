import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import "./Pricing.css";
import Header from "./header/Header";
import Diff from "./Diff/Diff";
import {
  createCheckoutSession,
  fetchArchitectSubscription,
  selectCheckoutStatus,
  selectCheckoutSession,
  selectSubscriptionError,
  selectCurrentSubscription,
  clearErrors,
  clearCheckoutSession,
  resetOperationStatus,
} from "../../redux/slices/subscriptionSlice";

const pricingTiers = [
  {
    title: "Free",
    monthlyPrice: 0,
    buttonText: "Get started for free",
    popular: false,
    inverse: false,
    features: [
      "Access to project posting",
      "Basic architect matching",
      "View architect profiles",
      "Limited messaging with architects",
      "Basic support",
    ],
  },
  {
    title: "VIP",
    monthlyPrice: 120,
    buttonText: "Upgrade to VIP",
    popular: true,
    inverse: true,
    features: [
      "Priority architect matching",
      "Unlimited messaging with architects",
      "Access to architect portfolios & reviews",
      "Project management dashboard",
      "Exclusive architect recommendations",
      "Priority customer support",
    ],
  },
  {
    title: "Premium",
    monthlyPrice: 200,
    buttonText: "Get Premium Plan",
    popular: false,
    inverse: false,
    features: [
      "All VIP features included",
      "Personalized architect selection assistance",
      "Priority access to top-rated architects",
      "Project milestone tracking",
      "Legal and contract assistance",
      "Premium customer support",
    ],
  },
];

export const Pricing = () => {
  const dispatch = useDispatch();
  const checkoutStatus = useSelector(selectCheckoutStatus);
  const checkoutSession = useSelector(selectCheckoutSession);
  const subscriptionError = useSelector(selectSubscriptionError);
  const currentSubscription = useSelector(selectCurrentSubscription);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);

  // Get current user/architect ID - adjust this based on your auth implementation
  const currentArchitect = useSelector((state) => state.auth?.user);
  const architectId = currentArchitect?._id || currentArchitect?.id;

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearErrors());

    // Fetch current subscription if architect is logged in
    if (architectId) {
      dispatch(fetchArchitectSubscription(architectId));
    }
  }, [dispatch, architectId]);

  useEffect(() => {
    // Handle checkout session creation
    if (checkoutStatus === "succeeded" && checkoutSession) {
      // Redirect to Stripe Checkout
      if (checkoutSession.url) {
        window.location.href = checkoutSession.url;
      }

      // Reset states
      setIsProcessing(false);
      setProcessingPlan(null);
      dispatch(clearCheckoutSession());
      dispatch(resetOperationStatus("checkout"));
    } else if (checkoutStatus === "failed") {
      // Handle error
      setIsProcessing(false);
      setProcessingPlan(null);
      console.error("Checkout session creation failed:", subscriptionError);
      alert(
        `Failed to create checkout session: ${
          subscriptionError || "Unknown error"
        }`
      );
      dispatch(resetOperationStatus("checkout"));
    }
  }, [checkoutStatus, checkoutSession, subscriptionError, dispatch]);

  const handlePayment = async (plan) => {
    // Handle free plan differently
    if (plan === "Free") {
      alert("You're already on the free plan!");
      return;
    }

    // Check if user is authenticated
    if (!architectId) {
      alert("Please log in to subscribe to a plan.");
      return;
    }

    // Check if already processing
    if (isProcessing) {
      return;
    }

    // Check if user already has an active subscription
    if (currentSubscription && currentSubscription.status === "active") {
      const confirmUpgrade = window.confirm(
        `You already have an active ${currentSubscription.plan} subscription. Do you want to upgrade to ${plan}?`
      );
      if (!confirmUpgrade) {
        return;
      }
    }

    try {
      setIsProcessing(true);
      setProcessingPlan(plan);

      // Create success and cancel URLs
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/subscription/cancel`;

      // Create checkout session
      dispatch(
        createCheckoutSession({
          architectId,
          plan,
          successUrl,
          cancelUrl,
        })
      );
    } catch (error) {
      console.error("Error handling payment:", error);
      alert("An error occurred. Please try again.");
      setIsProcessing(false);
      setProcessingPlan(null);
    }
  };

  const getButtonText = (tier) => {
    if (isProcessing && processingPlan === tier.title) {
      return "Processing...";
    }

    // Show current subscription status
    if (currentSubscription && currentSubscription.status === "active") {
      if (currentSubscription.plan === tier.title) {
        return "Current Plan";
      }
    }

    return tier.buttonText;
  };

  const isButtonDisabled = (tier) => {
    // Disable if processing
    if (isProcessing) return true;

    // Disable if not authenticated and not free plan
    if (tier.monthlyPrice > 0 && !architectId) return true;

    // Disable if current plan is the same
    if (
      currentSubscription &&
      currentSubscription.status === "active" &&
      currentSubscription.plan === tier.title
    ) {
      return true;
    }

    return false;
  };

  const getCardClassName = (tier) => {
    let className = `pricing-card ${tier.inverse ? "inverse" : ""}`;

    // Add special styling for current plan
    if (
      currentSubscription &&
      currentSubscription.status === "active" &&
      currentSubscription.plan === tier.title
    ) {
      className += " current-plan";
    }

    return className;
  };

  return (
    <section className="pricing-section">
      <Header />
      <div className="container" style={{ paddingTop: "60px" }}>
        <div className="section-heading">
          <h2 className="section-title">Unlock Your Full Potential</h2>
          <p className="section-description">
            Choose the perfect plan that fits your needs. Start for free and
            upgrade anytime to access advanced features and exclusive benefits.
          </p>
        </div>

        {/* Show authentication warning if not logged in */}
        {!architectId && (
          <div
            className="auth-warning"
            style={{
              backgroundColor: "#fef3cd",
              border: "1px solid #faebcc",
              color: "#8a6d3b",
              padding: "15px",
              borderRadius: "4px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Please log in to subscribe to a plan.
          </div>
        )}

        {/* Show current subscription info */}
        {currentSubscription && currentSubscription.status === "active" && (
          <div
            className="current-subscription"
            style={{
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              color: "#155724",
              padding: "15px",
              borderRadius: "4px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            You currently have an active{" "}
            <strong>{currentSubscription.plan}</strong> subscription.
            {currentSubscription.endDate && (
              <span>
                {" "}
                Valid until{" "}
                {new Date(currentSubscription.endDate).toLocaleDateString()}.
              </span>
            )}
          </div>
        )}

        <div className="pricing-tiers">
          {pricingTiers.map((tier, index) => (
            <div key={index} className={getCardClassName(tier)}>
              <div className="card-header">
                <h3
                  className={`card-title ${
                    tier.inverse ? "text-white" : "text-black"
                  }`}
                >
                  {tier.title}
                </h3>
                {tier.popular && (
                  <div className="popular-badge">
                    <motion.span
                      animate={{ backgroundPositionX: "100%" }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "loop",
                      }}
                      className="popular-text"
                    >
                      Popular
                    </motion.span>
                  </div>
                )}
                {/* Show current plan badge */}
                {currentSubscription &&
                  currentSubscription.status === "active" &&
                  currentSubscription.plan === tier.title && (
                    <div className="current-badge">
                      <span className="current-text">Current Plan</span>
                    </div>
                  )}
              </div>
              <div className="price">
                <span className="monthly-price">{tier.monthlyPrice} TND</span>
                <span className="price-label">/Year</span>
              </div>
              <button
                className={`pricing-button ${
                  tier.inverse ? "inverse-button" : ""
                } ${isButtonDisabled(tier) ? "disabled" : ""}`}
                onClick={() => handlePayment(tier.title)}
                disabled={isButtonDisabled(tier)}
                style={{
                  opacity: isButtonDisabled(tier) ? 0.6 : 1,
                  cursor: isButtonDisabled(tier) ? "not-allowed" : "pointer",
                }}
              >
                {getButtonText(tier)}
              </button>
              <ul className="feature-list">
                {tier.features.map((feature, featureIndex) => (
                  <li className="feature-item" key={featureIndex}>
                    <span className="checkmark">✔️</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Diff />
      </div>
    </section>
  );
};

export default Pricing;
