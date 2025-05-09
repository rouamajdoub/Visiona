import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL
const API_URL = "/api/subscriptions";

// Async thunks
export const fetchAllSubscriptions = createAsyncThunk(
  "subscriptions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      console.log("Fetched subscriptions:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      return rejectWithValue(
        error.response?.data || "Failed to fetch subscriptions"
      );
    }
  }
);

export const fetchSubscriptionById = createAsyncThunk(
  "subscriptions/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      console.log(`Fetched subscription ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subscription ${id}:`, error);
      return rejectWithValue(
        error.response?.data || "Failed to fetch subscription"
      );
    }
  }
);

export const fetchArchitectSubscription = createAsyncThunk(
  "subscriptions/fetchByArchitect",
  async (architectId, { rejectWithValue }) => {
    try {
      console.log(`Fetching subscription for architect ${architectId}`);
      const response = await axios.get(`${API_URL}/architect/${architectId}`);
      console.log(`Architect ${architectId} subscription:`, response.data);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching architect ${architectId} subscription:`,
        error
      );
      return rejectWithValue(
        error.response?.data || "Failed to fetch architect subscription"
      );
    }
  }
);

export const createSubscription = createAsyncThunk(
  "subscriptions/create",
  async (subscriptionData, { rejectWithValue }) => {
    try {
      console.log("Creating subscription with data:", subscriptionData);
      const response = await axios.post(API_URL, subscriptionData);
      console.log("Subscription created:", response.data);

      // Optionally update architect's subscription reference
      if (response.data._id) {
        await axios.patch(`/api/architects/${subscriptionData.architectId}`, {
          subscription: response.data._id,
          subscriptionType: response.data.plan.toLowerCase(),
        });
      }

      return response.data;
    } catch (error) {
      console.error("Error creating subscription:", error);
      return rejectWithValue(
        error.response?.data || "Failed to create subscription"
      );
    }
  }
);

export const updateSubscription = createAsyncThunk(
  "subscriptions/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log(`Updating subscription ${id} with:`, data);
      const response = await axios.put(`${API_URL}/${id}`, data);
      console.log(`Subscription ${id} updated:`, response.data);

      // Update architect's subscription type if plan is changed
      if (data.plan && response.data.architectId) {
        await axios.patch(`/api/architects/${response.data.architectId}`, {
          subscriptionType: data.plan.toLowerCase(),
        });
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating subscription ${id}:`, error);
      return rejectWithValue(
        error.response?.data || "Failed to update subscription"
      );
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  "subscriptions/cancel",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`Cancelling subscription ${id}`);
      const response = await axios.put(`${API_URL}/${id}`, {
        status: "cancelled",
      });
      console.log(`Subscription ${id} cancelled:`, response.data);

      // Update architect's subscription status
      if (response.data.architectId) {
        await axios.patch(`/api/architects/${response.data.architectId}`, {
          subscriptionType: "none",
        });
      }

      return response.data;
    } catch (error) {
      console.error(`Error cancelling subscription ${id}:`, error);
      return rejectWithValue(
        error.response?.data || "Failed to cancel subscription"
      );
    }
  }
);

export const deleteSubscription = createAsyncThunk(
  "subscriptions/delete",
  async (id, { rejectWithValue }) => {
    try {
      console.log(`Deleting subscription ${id}`);
      await axios.delete(`${API_URL}/${id}`);
      console.log(`Subscription ${id} deleted successfully`);
      return id;
    } catch (error) {
      console.error(`Error deleting subscription ${id}:`, error);
      return rejectWithValue(
        error.response?.data || "Failed to delete subscription"
      );
    }
  }
);

export const purchaseSubscription = createAsyncThunk(
  "subscriptions/purchase",
  async ({ architectId, plan, paymentDetails }, { rejectWithValue }) => {
    try {
      console.log(
        `Processing subscription purchase: ${plan} for architect ${architectId}`
      );

      // Get pricing info based on the plan
      let price, endDate;

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
      endDate = new Date(now.setFullYear(now.getFullYear() + 1));

      // Create subscription object
      const subscriptionData = {
        architectId,
        plan,
        startDate: new Date(),
        endDate: endDate,
        status: "active",
        price,
        paymentMethod: paymentDetails.method,
        transactions: [
          {
            amount: price,
            date: new Date(),
            transactionId: paymentDetails.transactionId,
            status: "success",
          },
        ],
      };

      console.log("Sending subscription data:", subscriptionData);

      // Create subscription
      const response = await axios.post(API_URL, subscriptionData);
      console.log("Subscription purchase response:", response.data);

      // Update architect document
      await axios.patch(`/api/architects/${architectId}`, {
        subscription: response.data._id,
        subscriptionType: plan.toLowerCase(),
        hasAccess: true,
      });

      return response.data;
    } catch (error) {
      console.error("Error purchasing subscription:", error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to process subscription purchase"
      );
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscriptions", // Make sure this matches your reducer name in store.js
  initialState: {
    items: [],
    currentSubscription: null,
    loading: false,
    error: null,
    purchaseStatus: "idle", // idle, loading, succeeded, failed
    purchaseError: null,
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.purchaseError = null;
    },
    resetPurchaseStatus: (state) => {
      state.purchaseStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all subscriptions
      .addCase(fetchAllSubscriptions.pending, (state) => {
        state.loading = true;
        console.log("Fetch all subscriptions: pending");
      })
      .addCase(fetchAllSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        console.log("Fetch all subscriptions: fulfilled");
      })
      .addCase(fetchAllSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Fetch all subscriptions: rejected", action.payload);
      })

      // Fetch subscription by ID
      .addCase(fetchSubscriptionById.pending, (state) => {
        state.loading = true;
        console.log("Fetch subscription by ID: pending");
      })
      .addCase(fetchSubscriptionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
        console.log("Fetch subscription by ID: fulfilled");
      })
      .addCase(fetchSubscriptionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Fetch subscription by ID: rejected", action.payload);
      })

      // Fetch architect subscription
      .addCase(fetchArchitectSubscription.pending, (state) => {
        state.loading = true;
        console.log("Fetch architect subscription: pending");
      })
      .addCase(fetchArchitectSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
        console.log("Fetch architect subscription: fulfilled");
      })
      .addCase(fetchArchitectSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Fetch architect subscription: rejected", action.payload);
      })

      // Create subscription
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        console.log("Create subscription: pending");
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.currentSubscription = action.payload;
        console.log("Create subscription: fulfilled");
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Create subscription: rejected", action.payload);
      })

      // Update subscription
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
        console.log("Update subscription: pending");
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (
          state.currentSubscription &&
          state.currentSubscription._id === action.payload._id
        ) {
          state.currentSubscription = action.payload;
        }
        console.log("Update subscription: fulfilled");
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Update subscription: rejected", action.payload);
      })

      // Cancel subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        console.log("Cancel subscription: pending");
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (
          state.currentSubscription &&
          state.currentSubscription._id === action.payload._id
        ) {
          state.currentSubscription = action.payload;
        }
        console.log("Cancel subscription: fulfilled");
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Cancel subscription: rejected", action.payload);
      })

      // Delete subscription
      .addCase(deleteSubscription.pending, (state) => {
        state.loading = true;
        console.log("Delete subscription: pending");
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item._id !== action.payload);
        if (
          state.currentSubscription &&
          state.currentSubscription._id === action.payload
        ) {
          state.currentSubscription = null;
        }
        console.log("Delete subscription: fulfilled");
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Delete subscription: rejected", action.payload);
      })

      // Purchase subscription
      .addCase(purchaseSubscription.pending, (state) => {
        state.purchaseStatus = "loading";
        console.log("Purchase subscription: pending");
      })
      .addCase(purchaseSubscription.fulfilled, (state, action) => {
        state.purchaseStatus = "succeeded";
        state.currentSubscription = action.payload;
        state.items.push(action.payload);
        console.log("Purchase subscription: fulfilled");
      })
      .addCase(purchaseSubscription.rejected, (state, action) => {
        state.purchaseStatus = "failed";
        state.purchaseError = action.payload;
        console.error("Purchase subscription: rejected", action.payload);
      });
  },
});

export const { clearErrors, resetPurchaseStatus } = subscriptionSlice.actions;

// Selectors
export const selectAllSubscriptions = (state) => state.subscriptions?.items;
export const selectCurrentSubscription = (state) =>
  state.subscriptions?.currentSubscription;
export const selectSubscriptionLoading = (state) =>
  state.subscriptions?.loading;
export const selectSubscriptionError = (state) => state.subscriptions?.error;
export const selectPurchaseStatus = (state) =>
  state.subscriptions?.purchaseStatus;
export const selectPurchaseError = (state) =>
  state.subscriptions?.purchaseError;

export default subscriptionSlice.reducer;
