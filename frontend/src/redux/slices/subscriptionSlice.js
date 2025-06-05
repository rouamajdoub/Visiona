import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL
const API_URL = "/api/subscriptions";

// Helper function to extract error message
const getErrorMessage = (error) => {
  return (
    error.response?.data?.message ||
    error.response?.data ||
    error.message ||
    "An unexpected error occurred"
  );
};

// Async thunks
export const fetchAllSubscriptions = createAsyncThunk(
  "subscriptions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSubscriptionById = createAsyncThunk(
  "subscriptions/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Subscription ID is required");
      }
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchArchitectSubscription = createAsyncThunk(
  "subscriptions/fetchByArchitect",
  async (architectId, { rejectWithValue }) => {
    try {
      if (!architectId) {
        return rejectWithValue("Architect ID is required");
      }
      const response = await axios.get(`${API_URL}/architect/${architectId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// NEW: Create Stripe checkout session
export const createCheckoutSession = createAsyncThunk(
  "subscriptions/createCheckoutSession",
  async ({ architectId, plan, successUrl, cancelUrl }, { rejectWithValue }) => {
    try {
      if (!architectId || !plan) {
        return rejectWithValue("Architect ID and plan are required");
      }

      const response = await axios.post(`${API_URL}/create-checkout-session`, {
        architectId,
        plan,
        successUrl,
        cancelUrl,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// NEW: Verify checkout session
export const verifyCheckoutSession = createAsyncThunk(
  "subscriptions/verifyCheckoutSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      if (!sessionId) {
        return rejectWithValue("Session ID is required");
      }
      const response = await axios.get(
        `${API_URL}/verify-session/${sessionId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createSubscription = createAsyncThunk(
  "subscriptions/create",
  async (subscriptionData, { rejectWithValue }) => {
    try {
      // Validate required fields
      if (!subscriptionData.architectId || !subscriptionData.plan) {
        return rejectWithValue("Architect ID and plan are required");
      }

      const response = await axios.post(API_URL, subscriptionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateSubscription = createAsyncThunk(
  "subscriptions/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Subscription ID is required");
      }
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  "subscriptions/cancel",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Subscription ID is required");
      }
      const response = await axios.put(`${API_URL}/${id}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const renewSubscription = createAsyncThunk(
  "subscriptions/renew",
  async ({ id, paymentDetails }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Subscription ID is required");
      }
      const response = await axios.put(`${API_URL}/${id}/renew`, {
        paymentDetails,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteSubscription = createAsyncThunk(
  "subscriptions/delete",
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue("Subscription ID is required");
      }
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Check feature access
export const checkFeatureAccess = createAsyncThunk(
  "subscriptions/checkFeatureAccess",
  async ({ architectId, feature }, { rejectWithValue }) => {
    try {
      if (!architectId || !feature) {
        return rejectWithValue("Architect ID and feature are required");
      }
      const response = await axios.get(
        `${API_URL}/access/${architectId}/${feature}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscriptions",
  initialState: {
    items: [],
    currentSubscription: null,
    featureAccess: null,
    checkoutSession: null, // NEW: Store checkout session data
    loading: false,
    error: null,
    operationStatus: {
      create: "idle",
      update: "idle",
      delete: "idle",
      cancel: "idle",
      renew: "idle",
      checkout: "idle", // NEW: Checkout status
      verify: "idle", // NEW: Verify status
    },
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    clearCurrentSubscription: (state) => {
      state.currentSubscription = null;
    },
    clearCheckoutSession: (state) => {
      state.checkoutSession = null;
    },
    resetOperationStatus: (state, action) => {
      const operation = action.payload;
      if (operation && state.operationStatus[operation]) {
        state.operationStatus[operation] = "idle";
      } else {
        // Reset all operation statuses
        Object.keys(state.operationStatus).forEach((key) => {
          state.operationStatus[key] = "idle";
        });
      }
    },
    // Optimistic update for better UX
    optimisticUpdateSubscription: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.items.findIndex((item) => item._id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
      if (state.currentSubscription?._id === id) {
        state.currentSubscription = {
          ...state.currentSubscription,
          ...updates,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all subscriptions
      .addCase(fetchAllSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch subscription by ID
      .addCase(fetchSubscriptionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(fetchSubscriptionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch architect subscription
      .addCase(fetchArchitectSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArchitectSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(fetchArchitectSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentSubscription = null;
      })

      // NEW: Create checkout session
      .addCase(createCheckoutSession.pending, (state) => {
        state.operationStatus.checkout = "loading";
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state, action) => {
        state.operationStatus.checkout = "succeeded";
        state.checkoutSession = action.payload;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.operationStatus.checkout = "failed";
        state.error = action.payload;
      })

      // NEW: Verify checkout session
      .addCase(verifyCheckoutSession.pending, (state) => {
        state.operationStatus.verify = "loading";
        state.error = null;
      })
      .addCase(verifyCheckoutSession.fulfilled, (state, action) => {
        state.operationStatus.verify = "succeeded";
        if (action.payload.subscription) {
          state.currentSubscription = action.payload.subscription;
          // Add to items if not already present
          const exists = state.items.find(
            (item) => item._id === action.payload.subscription._id
          );
          if (!exists) {
            state.items.push(action.payload.subscription);
          }
        }
      })
      .addCase(verifyCheckoutSession.rejected, (state, action) => {
        state.operationStatus.verify = "failed";
        state.error = action.payload;
      })

      // Create subscription
      .addCase(createSubscription.pending, (state) => {
        state.operationStatus.create = "loading";
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.operationStatus.create = "succeeded";
        state.items.push(action.payload);
        state.currentSubscription = action.payload;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.operationStatus.create = "failed";
        state.error = action.payload;
      })

      // Update subscription
      .addCase(updateSubscription.pending, (state) => {
        state.operationStatus.update = "loading";
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.operationStatus.update = "succeeded";
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentSubscription?._id === action.payload._id) {
          state.currentSubscription = action.payload;
        }
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.operationStatus.update = "failed";
        state.error = action.payload;
      })

      // Cancel subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.operationStatus.cancel = "loading";
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.operationStatus.cancel = "succeeded";
        const index = state.items.findIndex(
          (item) => item._id === action.payload.subscription._id
        );
        if (index !== -1) {
          state.items[index] = action.payload.subscription;
        }
        if (
          state.currentSubscription?._id === action.payload.subscription._id
        ) {
          state.currentSubscription = action.payload.subscription;
        }
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.operationStatus.cancel = "failed";
        state.error = action.payload;
      })

      // Renew subscription
      .addCase(renewSubscription.pending, (state) => {
        state.operationStatus.renew = "loading";
        state.error = null;
      })
      .addCase(renewSubscription.fulfilled, (state, action) => {
        state.operationStatus.renew = "succeeded";
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentSubscription?._id === action.payload._id) {
          state.currentSubscription = action.payload;
        }
      })
      .addCase(renewSubscription.rejected, (state, action) => {
        state.operationStatus.renew = "failed";
        state.error = action.payload;
      })

      // Delete subscription
      .addCase(deleteSubscription.pending, (state) => {
        state.operationStatus.delete = "loading";
        state.error = null;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.operationStatus.delete = "succeeded";
        state.items = state.items.filter((item) => item._id !== action.payload);
        if (state.currentSubscription?._id === action.payload) {
          state.currentSubscription = null;
        }
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.operationStatus.delete = "failed";
        state.error = action.payload;
      })

      // Check feature access
      .addCase(checkFeatureAccess.fulfilled, (state, action) => {
        state.featureAccess = action.payload;
      })
      .addCase(checkFeatureAccess.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  clearErrors,
  clearCurrentSubscription,
  clearCheckoutSession,
  resetOperationStatus,
  optimisticUpdateSubscription,
} = subscriptionSlice.actions;

// Enhanced selectors
export const selectAllSubscriptions = (state) =>
  state.subscriptions?.items || [];
export const selectCurrentSubscription = (state) =>
  state.subscriptions?.currentSubscription;
export const selectCheckoutSession = (state) =>
  state.subscriptions?.checkoutSession;
export const selectSubscriptionLoading = (state) =>
  state.subscriptions?.loading || false;
export const selectSubscriptionError = (state) => state.subscriptions?.error;
export const selectFeatureAccess = (state) =>
  state.subscriptions?.featureAccess;

// Operation status selectors
export const selectCreateStatus = (state) =>
  state.subscriptions?.operationStatus?.create || "idle";
export const selectUpdateStatus = (state) =>
  state.subscriptions?.operationStatus?.update || "idle";
export const selectDeleteStatus = (state) =>
  state.subscriptions?.operationStatus?.delete || "idle";
export const selectCancelStatus = (state) =>
  state.subscriptions?.operationStatus?.cancel || "idle";
export const selectRenewStatus = (state) =>
  state.subscriptions?.operationStatus?.renew || "idle";
export const selectCheckoutStatus = (state) =>
  state.subscriptions?.operationStatus?.checkout || "idle";
export const selectVerifyStatus = (state) =>
  state.subscriptions?.operationStatus?.verify || "idle";

// Derived selectors
export const selectActiveSubscriptions = (state) => {
  const items = selectAllSubscriptions(state);
  return items.filter((sub) => sub.status === "active");
};

export const selectSubscriptionByArchitect = (architectId) => (state) => {
  const items = selectAllSubscriptions(state);
  return items.find((sub) => sub.architectId === architectId);
};

export const selectIsAnyOperationLoading = (state) => {
  const statuses = state.subscriptions?.operationStatus || {};
  return (
    Object.values(statuses).some((status) => status === "loading") ||
    state.subscriptions?.loading
  );
};

export default subscriptionSlice.reducer;
