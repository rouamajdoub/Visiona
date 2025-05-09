const Subscription = require("../models/Subscriptions");
const User = require("../models/User"); // Assuming this is your User model that includes architects

// Create a new subscription
exports.createSubscription = async (req, res) => {
  try {
    const subscription = new Subscription(req.body);
    await subscription.save();

    // Update architect's subscription reference and type
    if (req.body.architectId && req.body.plan) {
      await User.findByIdAndUpdate(req.body.architectId, {
        subscription: subscription._id,
        subscriptionType: req.body.plan.toLowerCase(),
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
      status: { $ne: "expired" }, // Only get active or cancelled subscriptions
    }).sort({ createdAt: -1 }); // Get the most recent subscription

    if (!subscription)
      return res
        .status(404)
        .json({ message: "No active subscription found for this architect" });

    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a subscription
exports.updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!subscription)
      return res.status(404).json({ message: "Subscription not found" });

    // Update architect's subscription type if plan is changed
    if (req.body.plan && subscription.architectId) {
      await User.findByIdAndUpdate(subscription.architectId, {
        subscriptionType: req.body.plan.toLowerCase(),
      });
    }

    // Handle expiration/cancellation
    if (req.body.status === "expired" || req.body.status === "cancelled") {
      await User.findByIdAndUpdate(subscription.architectId, {
        subscriptionType: "none",
      });
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
      });
    }

    await Subscription.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Process subscription payment
exports.processPayment = async (req, res) => {
  try {
    const { architectId, plan, paymentDetails } = req.body;

    // Validate architect exists
    const architect = await User.findById(architectId);
    if (!architect) {
      return res.status(404).json({ message: "Architect not found" });
    }

    // Get pricing info based on the plan
    let price;
    switch (plan) {
      case "Premium":
        price = 200;
        break;
      case "VIP":
        price = 120;
        break;
      default:
        price = 0;
    }

    // Calculate end date (1 year from now)
    const now = new Date();
    const endDate = new Date(now.setFullYear(now.getFullYear() + 1));

    // Create subscription object
    const subscriptionData = {
      architectId,
      plan,
      startDate: new Date(),
      endDate,
      status: "active",
      price,
      paymentMethod: paymentDetails.method || "Card",
      transactions: [
        {
          amount: price,
          date: new Date(),
          transactionId: paymentDetails.transactionId || `trx_${Date.now()}`,
          status: "success",
        },
      ],
    };

    // Check if architect already has an active subscription
    const existingSubscription = await Subscription.findOne({
      architectId,
      status: "active",
    });

    if (existingSubscription) {
      // Mark old subscription as cancelled
      existingSubscription.status = "cancelled";
      await existingSubscription.save();
    }

    // Create new subscription
    const newSubscription = new Subscription(subscriptionData);
    await newSubscription.save();

    // Update architect document
    await User.findByIdAndUpdate(architectId, {
      subscription: newSubscription._id,
      subscriptionType: plan.toLowerCase(),
      hasAccess: true,
    });

    res.status(201).json(newSubscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Check for expired subscriptions (to be run as a cron job)
exports.checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();

    // Find all active subscriptions that have passed their end date
    const expiredSubscriptions = await Subscription.find({
      status: "active",
      endDate: { $lt: now },
    });

    // Update each expired subscription
    for (const subscription of expiredSubscriptions) {
      subscription.status = "expired";
      await subscription.save();

      // Update architect's subscription type
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
