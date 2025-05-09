import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import "./Pricing.css";
import Header from "./header/Header";
import Diff from "./Diff/Diff";
import {
  purchaseSubscription,
  selectPurchaseStatus,
  selectCurrentSubscription,
  fetchArchitectSubscription,
  resetPurchaseStatus,
} from "../../redux/slices/subscriptionSlice";
import { toast } from "react-toastify";

const pricingTiers = [
  {
    title: "Free",
    plan: "Free",
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
    plan: "VIP",
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
    link: "https://buy.stripe.com/test_bIYfZCdFj6YSbcs3cc",
    priceId: "prod_S1L9JODnAOUsla",
  },
  {
    title: "Premium",
    plan: "Premium",
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
    link: "https://buy.stripe.com/test_14k6p244J0Aua8oeUV",
    priceId: "prod_S45K8IsY2smSX0",
  },
];

export const Pricing = () => {
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);

  // Add logging to see what's in your state
  const subscriptionsState = useSelector((state) => state.subscriptions);
  console.log("Current subscriptions state:", subscriptionsState);

  // Get the auth state to verify user data
  const authState = useSelector((state) => state.auth);
  console.log("Current auth state:", authState);

  const purchaseStatus = useSelector(
    (state) => state.subscriptions?.purchaseStatus || "idle"
  );
  const currentSubscription = useSelector(
    (state) => state.subscriptions?.currentSubscription
  );
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    // Debug log when component mounts
    console.log("Pricing component mounted");

    // Fetch current subscription if user is an architect
    if (user && user._id && user.role === "architect") {
      console.log("Fetching architect subscription for:", user._id);
      dispatch(fetchArchitectSubscription(user._id));
    } else {
      console.log("User not eligible for fetching subscription:", user);
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Log purchase status changes
    console.log("Purchase status changed to:", purchaseStatus);

    // Handle purchase status changes
    if (purchaseStatus === "succeeded") {
      toast.success("Subscription purchased successfully!");
      dispatch(resetPurchaseStatus());
      setProcessingPlan(null);
    } else if (purchaseStatus === "failed") {
      toast.error("Failed to process subscription. Please try again.");
      dispatch(resetPurchaseStatus());
      setProcessingPlan(null);
    }
  }, [purchaseStatus, dispatch]);

  const handlePayment = async (tier) => {
    console.log("Payment handler called for tier:", tier);

    if (!user) {
      console.log("No user found, showing login message");
      toast.error("Please login to subscribe");
      return;
    }

    if (user.role !== "architect") {
      console.log("User is not an architect:", user.role);
      toast.error("Only architects can subscribe to plans");
      return;
    }

    console.log("Proceeding with payment for architect:", user._id);
    setProcessing(true);
    setProcessingPlan(tier.plan);

    // For demo/testing purposes, simulate a successful transaction
    const paymentDetails = {
      method: "Card",
      transactionId: `trx_${Date.now()}`,
    };

    console.log("Dispatching purchase subscription with:", {
      architectId: user._id,
      plan: tier.plan,
    });

    try {
      const result = await dispatch(
        purchaseSubscription({
          architectId: user._id,
          plan: tier.plan,
          paymentDetails,
        })
      ).unwrap();

      console.log("Purchase result:", result);
      // Note: Success handling is done in the useEffect
    } catch (error) {
      console.error("Subscription purchase error:", error);
      // Show a direct error message in case the useEffect isn't triggered
      toast.error(`Subscription failed: ${error.message || "Unknown error"}`);
    } finally {
      setProcessing(false);
    }
  };

  // Check if architect already has an active subscription
  const isCurrentPlan = (tierPlan) => {
    if (!currentSubscription) return false;
    return (
      currentSubscription.plan === tierPlan &&
      currentSubscription.status === "active"
    );
  };

  // Determine button text based on subscription status
  const getButtonText = (tier) => {
    if (isCurrentPlan(tier.plan)) {
      return "Current Plan";
    }
    if (processing && processingPlan === tier.plan) {
      return "Processing...";
    }
    return tier.buttonText;
  };

  // Debug info for rendering
  console.log("Rendering Pricing component with:", {
    processing,
    processingPlan,
    currentSubscription,
    user: user ? { id: user._id, role: user.role } : null,
  });

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

        {/* Debug info display (remove in production) */}
        {process.env.NODE_ENV !== "production" && (
          <div
            style={{
              background: "#f5f5f5",
              padding: "10px",
              marginBottom: "20px",
              fontSize: "12px",
            }}
          >
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>User: {user ? `${user._id} (${user.role})` : "Not logged in"}</p>
            <p>
              Current Subscription:{" "}
              {currentSubscription
                ? `${currentSubscription.plan} (${currentSubscription.status})`
                : "None"}
            </p>
            <p>Purchase Status: {purchaseStatus}</p>
          </div>
        )}

        <div className="pricing-tiers">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={`pricing-card ${tier.inverse ? "inverse" : ""}`}
            >
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
              </div>
              <div className="price">
                <span className="monthly-price">{tier.monthlyPrice} TND</span>
                <span className="price-label">/Year</span>
              </div>
              {tier.monthlyPrice > 0 && (
                <button
                  className={`pricing-button ${
                    tier.inverse ? "inverse-button" : ""
                  }`}
                  onClick={() => handlePayment(tier)}
                  disabled={processing || isCurrentPlan(tier.plan)}
                >
                  {getButtonText(tier)}
                </button>
              )}
              <ul className="feature-list">
                {tier.features.map((feature, index) => (
                  <li className="feature-item" key={index}>
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
