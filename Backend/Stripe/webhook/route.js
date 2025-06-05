// webhook/route.js - Fixed version
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Make sure to use consistent model names
const User = mongoose.model("User"); // Changed from "architect" to match your controller
const Subscription = mongoose.model("Subscription");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    let event = request.body;

    // Verify webhook signature
    if (endpointSecret) {
      const signature = request.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    console.log(`🔔 Received event: ${event.type}`);

    try {
      // Handle successful checkout session
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        console.log("📝 Processing checkout session:", session.id);

        // Check if this is a subscription checkout
        if (session.mode === "subscription") {
          const architectId = session.client_reference_id;
          const customerId = session.customer;
          const subscriptionId = session.subscription;

          if (!architectId) {
            console.log("❌ No architect ID found in session");
            return response.status(400).send("No architect ID provided");
          }

          try {
            // Find architect
            const architect = await User.findById(architectId);
            if (!architect) {
              console.log(`❌ Architect not found: ${architectId}`);
              return response.status(404).send("Architect not found");
            }

            // Get subscription details from Stripe
            const stripeSubscription = await stripe.subscriptions.retrieve(
              subscriptionId
            );

            // Calculate subscription dates
            const startDate = new Date(
              stripeSubscription.current_period_start * 1000
            );
            const endDate = new Date(
              stripeSubscription.current_period_end * 1000
            );

            // Get plan from metadata or default to Premium
            const plan = session.metadata?.plan || "Premium";

            // Check if architect already has an active subscription
            const existingSubscription = await Subscription.findOne({
              architectId: architectId,
              status: "active",
            });

            if (existingSubscription) {
              // Cancel existing subscription
              existingSubscription.status = "cancelled";
              await existingSubscription.save();
              console.log(
                `🔄 Cancelled existing subscription for architect ${architectId}`
              );
            }

            // Create new subscription record
            const subscriptionData = {
              architectId: architectId,
              plan: plan,
              startDate: startDate,
              endDate: endDate,
              status: "active",
              price: stripeSubscription.items.data[0].price.unit_amount / 100, // Convert from cents
              paymentMethod: "Card",
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId,
              transactions: [
                {
                  amount:
                    stripeSubscription.items.data[0].price.unit_amount / 100,
                  date: new Date(),
                  transactionId: session.payment_intent || subscriptionId,
                  status: "success",
                },
              ],
            };

            const subscription = new Subscription(subscriptionData);
            const savedSubscription = await subscription.save();

            // Update architect record
            architect.customerId = customerId;
            architect.hasAccess = true;
            architect.paymentStatus = "completed";
            architect.subscription = savedSubscription._id;
            architect.subscriptionType = plan.toLowerCase();
            await architect.save();

            console.log(
              `✅ Subscription created successfully for architect ${
                architect.email || architectId
              }`
            );
          } catch (error) {
            console.error("❌ Error processing subscription:", error);
            return response.status(500).send("Error processing subscription");
          }
        }
      }

      // Handle subscription updates
      else if (event.type === "customer.subscription.updated") {
        const stripeSubscription = event.data.object;
        await handleSubscriptionUpdate(stripeSubscription);
      }

      // Handle subscription cancellations
      else if (event.type === "customer.subscription.deleted") {
        const stripeSubscription = event.data.object;
        await handleSubscriptionCancellation(stripeSubscription);
      }

      // Handle failed payments
      else if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object;
        await handlePaymentFailure(invoice);
      }

      // Handle successful payments
      else if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object;
        await handlePaymentSuccess(invoice);
      }

      // Log unhandled events
      else {
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error("❌ Webhook processing error:", error);
      return response.status(500).send("Webhook processing failed");
    }

    // Always respond with 200
    response.status(200).send("Webhook processed successfully");
  }
);

// Handle subscription updates
async function handleSubscriptionUpdate(stripeSubscription) {
  try {
    console.log(`🔄 Processing subscription update: ${stripeSubscription.id}`);

    // Find architect by Stripe customer ID
    const architect = await User.findOne({
      customerId: stripeSubscription.customer,
    });

    if (!architect) {
      console.log(
        `❌ Architect not found for customer: ${stripeSubscription.customer}`
      );
      return;
    }

    // Find subscription
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id,
    });

    if (subscription) {
      // Update subscription status
      const oldStatus = subscription.status;

      if (stripeSubscription.status === "active") {
        subscription.status = "active";
        architect.hasAccess = true;
        architect.subscriptionType = subscription.plan.toLowerCase();
      } else if (stripeSubscription.status === "canceled") {
        subscription.status = "cancelled";
        architect.hasAccess = false;
        architect.subscriptionType = "none";
      } else if (stripeSubscription.status === "past_due") {
        subscription.status = "past_due";
        architect.hasAccess = false;
      }

      // Update end date
      if (stripeSubscription.current_period_end) {
        subscription.endDate = new Date(
          stripeSubscription.current_period_end * 1000
        );
      }

      await subscription.save();
      await architect.save();

      console.log(
        `✅ Subscription updated: ${oldStatus} → ${subscription.status} for architect ${architect._id}`
      );
    }
  } catch (error) {
    console.error("❌ Error updating subscription:", error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancellation(stripeSubscription) {
  try {
    console.log(
      `❌ Processing subscription cancellation: ${stripeSubscription.id}`
    );

    const architect = await User.findOne({
      customerId: stripeSubscription.customer,
    });

    if (!architect) {
      console.log(
        `❌ Architect not found for customer: ${stripeSubscription.customer}`
      );
      return;
    }

    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id,
    });

    if (subscription) {
      subscription.status = "cancelled";
      await subscription.save();

      architect.hasAccess = false;
      architect.subscriptionType = "none";
      await architect.save();

      console.log(`✅ Subscription cancelled for architect ${architect._id}`);
    }
  } catch (error) {
    console.error("❌ Error cancelling subscription:", error);
  }
}

// Handle payment failures
async function handlePaymentFailure(invoice) {
  try {
    console.log(`💳 Processing payment failure for invoice: ${invoice.id}`);

    const architect = await User.findOne({
      customerId: invoice.customer,
    });

    if (architect) {
      // Temporarily disable access on payment failure
      architect.hasAccess = false;
      architect.paymentStatus = "failed";
      await architect.save();

      console.log(
        `⚠️ Access disabled for architect ${architect._id} due to payment failure`
      );
    }
  } catch (error) {
    console.error("❌ Error handling payment failure:", error);
  }
}

// Handle successful payments
async function handlePaymentSuccess(invoice) {
  try {
    console.log(`💰 Processing successful payment for invoice: ${invoice.id}`);

    const architect = await User.findOne({
      customerId: invoice.customer,
    });

    if (architect) {
      architect.hasAccess = true;
      architect.paymentStatus = "completed";
      await architect.save();

      // Add transaction record if subscription exists
      const subscription = await Subscription.findById(architect.subscription);
      if (subscription) {
        subscription.transactions.push({
          amount: invoice.amount_paid / 100, // Convert from cents
          date: new Date(invoice.created * 1000),
          transactionId: invoice.payment_intent,
          status: "success",
        });
        await subscription.save();
      }

      console.log(
        `✅ Payment processed successfully for architect ${architect._id}`
      );
    }
  } catch (error) {
    console.error("❌ Error handling payment success:", error);
  }
}

module.exports = router;
