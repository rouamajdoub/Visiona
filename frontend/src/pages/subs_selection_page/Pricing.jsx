import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import "./Pricing.css";
import Header from "./header/Header";
import Diff from "./Diff/Diff";
import {
  createSubscription,
  selectCreateStatus,
  selectSubscriptionError,
  clearErrors,
  resetOperationStatus,
} from "../../redux/slices/subscriptionSlice"; // Adjust path as needed

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
    buttonText: "Upgrade to Pro",
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
    monthlyPrice: 200,
    buttonText: "Get Business Plan",
    popular: false,
    inverse: false,
    features: [
      "All Pro features included",
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
  const createStatus = useSelector(selectCreateStatus);
  const subscriptionError = useSelector(selectSubscriptionError);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);

  // Get current user/architect ID - adjust this based on your auth implementation
  const currentArchitect = useSelector((state) => state.auth?.user); // Adjust path as needed
  const architectId = currentArchitect?._id || currentArchitect?.id;

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearErrors());
  }, [dispatch]);

  useEffect(() => {
    // Handle subscription creation status changes
    if (createStatus === "succeeded" && processingPlan) {
      // Subscription created successfully, redirect to Stripe
      const selectedTier = pricingTiers.find(
        (tier) => tier.title === processingPlan
      );
      if (selectedTier && selectedTier.link) {
        window.open(selectedTier.link, "_blank");
      }

      // Reset states
      setIsProcessing(false);
      setProcessingPlan(null);
      dispatch(resetOperationStatus("create"));
    } else if (createStatus === "failed") {
      // Handle error
      setIsProcessing(false);
      setProcessingPlan(null);
      console.error("Subscription creation failed:", subscriptionError);
      alert(
        `Failed to create subscription: ${subscriptionError || "Unknown error"}`
      );
      dispatch(resetOperationStatus("create"));
    }
  }, [createStatus, processingPlan, subscriptionError, dispatch]);

  const handlePayment = async (plan, link, priceId) => {
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

    // Validate required data
    if (!link) {
      alert("Payment link not available. Please try again later.");
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingPlan(plan);

      // Calculate end date (1 year from now)
      const now = new Date();
      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1);

      // Create subscription data
      const subscriptionData = {
        architectId: architectId,
        plan: plan,
        startDate: new Date(),
        endDate: endDate,
        status: "pending", // Will be updated to "active" after successful payment
        price: plan === "VIP" ? 120 : 200,
        paymentMethod: "Stripe",
        priceId: priceId,
        stripePaymentLink: link,
      };

      // Dispatch create subscription action
      dispatch(createSubscription(subscriptionData));
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
    return tier.buttonText;
  };

  const isButtonDisabled = (tier) => {
    return isProcessing || (tier.monthlyPrice > 0 && !architectId);
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

        <div className="pricing-tiers">
          {pricingTiers.map(
            (
              {
                title,
                monthlyPrice,
                buttonText,
                popular,
                inverse,
                features,
                link,
                priceId,
              },
              index
            ) => (
              <div
                key={index}
                className={`pricing-card ${inverse ? "inverse" : ""}`}
              >
                <div className="card-header">
                  <h3
                    className={`card-title ${
                      inverse ? "text-white" : "text-black"
                    }`}
                  >
                    {title}
                  </h3>
                  {popular && (
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
                  <span className="monthly-price">{monthlyPrice} TND</span>
                  <span className="price-label">/Year</span>
                </div>
                {monthlyPrice >= 0 && (
                  <button
                    className={`pricing-button ${
                      inverse ? "inverse-button" : ""
                    } ${
                      isButtonDisabled({ title, monthlyPrice })
                        ? "disabled"
                        : ""
                    }`}
                    onClick={() => handlePayment(title, link, priceId)}
                    disabled={isButtonDisabled({ title, monthlyPrice })}
                    style={{
                      opacity: isButtonDisabled({ title, monthlyPrice })
                        ? 0.6
                        : 1,
                      cursor: isButtonDisabled({ title, monthlyPrice })
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {getButtonText({ title, buttonText })}
                  </button>
                )}
                <ul className="feature-list">
                  {features.map((feature, index) => (
                    <li className="feature-item" key={index}>
                      <span className="checkmark">✔️</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
        <Diff />
      </div>
    </section>
  );
};

export default Pricing;
