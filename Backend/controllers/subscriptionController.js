const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Subscription = require("../models/Subscriptions");
const User = require("../models/User");

// Pricing configuration
const PRICING = {
  Premium: { price: 20000, name: "Premium Plan" },
  VIP: { price: 12000, name: "VIP Plan" },
};

// Create Stripe checkout session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { architectId, plan, successUrl, cancelUrl } = req.body;

    if (!architectId || !plan) {
      return res.status(400).json({
        message: "Architect ID and plan are required",
      });
    }

    if (!PRICING[plan]) {
      return res.status(400).json({
        message: "Invalid plan selected",
      });
    }

    const architect = await User.findById(architectId);
    if (!architect) {
      return res.status(404).json({ message: "Architect not found" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      client_reference_id: architectId,
      customer_email: architect.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: PRICING[plan].name,
              description: `${plan} subscription for architecture services`,
            },
            unit_amount: PRICING[plan].price,
            recurring: {
              interval: "year",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        architectId: architectId,
        plan: plan,
      },
      success_url:
        successUrl ||
        `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl || `${process.env.FRONTEND_URL}/subscription/cancel`,
    });

    res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      message: "Failed to create checkout session",
      error: error.message,
    });
  }
};

// NEW: Stripe Webhook Handler - This is what was missing!
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionCancelled(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

// Handle successful checkout session
async function handleCheckoutSessionCompleted(session) {
  try {
    const architectId = session.client_reference_id;
    const plan = session.metadata.plan;

    if (!architectId || !plan) {
      throw new Error("Missing architect ID or plan in session metadata");
    }

    // Retrieve the subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      session.subscription
    );

    // Calculate end date (1 year from now for annual subscription)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Create subscription record
    const subscriptionData = {
      architectId: architectId,
      plan: plan,
      status: "active",
      price: PRICING[plan].price / 100, // Convert from cents to dollars
      startDate: startDate,
      endDate: endDate,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      paymentStatus: "completed",
    };

    const subscription = new Subscription(subscriptionData);
    await subscription.save();

    // THIS IS THE KEY FIX: Update architect's subscription fields
    await User.findByIdAndUpdate(architectId, {
      subscription: subscription._id,
      subscriptionType: plan.toLowerCase(),
      hasAccess: true,
      paymentStatus: "completed",
      customerId: session.customer,
    });

    console.log(
      `Subscription created successfully for architect ${architectId} with plan ${plan}`
    );
  } catch (error) {
    console.error("Error handling checkout session completed:", error);
    throw error;
  }
}

// Handle successful payment (for recurring payments)
async function handlePaymentSucceeded(invoice) {
  try {
    if (invoice.subscription) {
      const subscription = await Subscription.findOne({
        stripeSubscriptionId: invoice.subscription,
      });

      if (subscription) {
        // Update payment status
        subscription.paymentStatus = "completed";
        subscription.status = "active";
        await subscription.save();

        // Ensure architect still has access
        await User.findByIdAndUpdate(subscription.architectId, {
          hasAccess: true,
          paymentStatus: "completed",
        });
      }
    }
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
    throw error;
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(stripeSubscription) {
  try {
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id,
    });

    if (subscription) {
      // Update subscription status based on Stripe status
      let newStatus = "active";
      if (stripeSubscription.status === "canceled") {
        newStatus = "cancelled";
      } else if (stripeSubscription.status === "past_due") {
        newStatus = "past_due";
      }

      subscription.status = newStatus;
      await subscription.save();

      // Update architect access based on status
      const hasAccess = newStatus === "active";
      const subscriptionType = hasAccess
        ? subscription.plan.toLowerCase()
        : "none";

      await User.findByIdAndUpdate(subscription.architectId, {
        subscriptionType: subscriptionType,
        hasAccess: hasAccess,
      });
    }
  } catch (error) {
    console.error("Error handling subscription update:", error);
    throw error;
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(stripeSubscription) {
  try {
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id,
    });

    if (subscription) {
      subscription.status = "cancelled";
      await subscription.save();

      // Remove architect's access
      await User.findByIdAndUpdate(subscription.architectId, {
        subscriptionType: "none",
        hasAccess: false,
      });
    }
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
    throw error;
  }
}

// Enhanced create subscription with proper architect update
exports.createSubscription = async (req, res) => {
  try {
    const subscription = new Subscription(req.body);
    await subscription.save();

    // FIXED: Properly update architect's subscription fields
    if (req.body.architectId && req.body.plan) {
      await User.findByIdAndUpdate(req.body.architectId, {
        subscription: subscription._id,
        subscriptionType: req.body.plan.toLowerCase(),
        hasAccess: true,
        paymentStatus: req.body.paymentStatus || "completed",
      });
    }

    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate("architectId");
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a subscription by ID
exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate(
      "architectId"
    );
    if (!subscription)
      return res.status(404).json({ message: "Subscription not found" });
    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get subscription by architect ID
exports.getSubscriptionByArchitect = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      architectId: req.params.architectId,
      status: { $ne: "expired" },
    }).sort({ createdAt: -1 });

    if (!subscription)
      return res
        .status(404)
        .json({ message: "No active subscription found for this architect" });

    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify checkout session (enhanced)
exports.verifyCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Find the subscription created for this session
    const subscription = await Subscription.findOne({
      architectId: session.client_reference_id,
      status: "active",
    }).sort({ createdAt: -1 });

    // Also get updated architect data to confirm subscription type was set
    const architect = await User.findById(session.client_reference_id);

    res.status(200).json({
      session: {
        id: session.id,
        status: session.payment_status,
        customer_email: session.customer_details?.email,
      },
      subscription: subscription,
      architect: {
        subscriptionType: architect?.subscriptionType,
        hasAccess: architect?.hasAccess,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Enhanced update subscription
exports.updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!subscription)
      return res.status(404).json({ message: "Subscription not found" });

    // FIXED: Properly update architect's subscription type and access
    if (subscription.architectId) {
      const updateData = {};

      if (req.body.plan) {
        updateData.subscriptionType = req.body.plan.toLowerCase();
      }

      if (req.body.status) {
        if (req.body.status === "expired" || req.body.status === "cancelled") {
          updateData.subscriptionType = "none";
          updateData.hasAccess = false;
        } else if (req.body.status === "active") {
          updateData.hasAccess = true;
          if (!updateData.subscriptionType && subscription.plan) {
            updateData.subscriptionType = subscription.plan.toLowerCase();
          }
        }
      }

      if (Object.keys(updateData).length > 0) {
        await User.findByIdAndUpdate(subscription.architectId, updateData);
      }
    }

    res.status(200).json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription)
      return res.status(404).json({ message: "Subscription not found" });

    // Update architect's subscription reference and type
    if (subscription.architectId) {
      await User.findByIdAndUpdate(subscription.architectId, {
        $unset: { subscription: "" },
        subscriptionType: "none",
        hasAccess: false,
      });
    }

    await Subscription.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    // Cancel in Stripe if we have a subscription ID
    if (subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      } catch (stripeError) {
        console.error("Error canceling Stripe subscription:", stripeError);
      }
    }

    // Update subscription status
    subscription.status = "cancelled";
    await subscription.save();

    // Update architect's subscription type
    if (subscription.architectId) {
      await User.findByIdAndUpdate(subscription.architectId, {
        subscriptionType: "none",
        hasAccess: false,
      });
    }

    res.status(200).json({
      message: "Subscription cancelled successfully",
      subscription,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rest of the functions remain the same...
exports.checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();

    const expiredSubscriptions = await Subscription.find({
      status: "active",
      endDate: { $lt: now },
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = "expired";
      await subscription.save();

      await User.findByIdAndUpdate(subscription.architectId, {
        subscriptionType: "none",
        hasAccess: false,
      });
    }

    return {
      success: true,
      count: expiredSubscriptions.length,
      message: `${expiredSubscriptions.length} subscriptions marked as expired`,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

exports.getSubscriptionStats = async (req, res) => {
  try {
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: "$plan",
          count: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, 1, 0],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "active"] }, "$price", 0],
            },
          },
        },
      },
    ]);

    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({
      status: "active",
    });
    const expiredSubscriptions = await Subscription.countDocuments({
      status: "expired",
    });

    res.status(200).json({
      planStats: stats,
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      conversionRate:
        totalSubscriptions > 0
          ? ((activeSubscriptions / totalSubscriptions) * 100).toFixed(2)
          : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkFeatureAccess = async (req, res) => {
  try {
    const { architectId, feature } = req.params;

    const subscription = await Subscription.findOne({
      architectId,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (!subscription) {
      return res.status(200).json({
        hasAccess: false,
        reason: "No active subscription",
      });
    }

    const featureAccess = {
      basic: ["free", "premium", "vip"],
      advanced: ["premium", "vip"],
      premium: ["vip"],
    };

    const hasAccess =
      featureAccess[feature]?.includes(subscription.plan.toLowerCase()) ||
      false;

    res.status(200).json({
      hasAccess,
      plan: subscription.plan,
      feature,
      subscription: subscription._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
