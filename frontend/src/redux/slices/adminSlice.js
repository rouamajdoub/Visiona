import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

// ----------------- SUBSCRIPTIONS -----------------
export const fetchSubscriptions = createAsyncThunk(
  "admin/fetchSubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/subscriptions`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteSubscription = createAsyncThunk(
  "admin/deleteSubscription",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`${BASE_URL}/subscriptions/${id}`);
      dispatch(fetchSubscriptions());
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateSubscription = createAsyncThunk(
  "admin/updateSubscription",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.put(`${BASE_URL}/subscriptions/${id}`, data);
      dispatch(fetchSubscriptions());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// ----------------- REVIEWS -----------------
export const fetchAllReviews = createAsyncThunk(
  "admin/fetchAllReviews",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/reviews/admin/all-reviews`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchProjectReviews = createAsyncThunk(
  "admin/fetchProjectReviews",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/reviews/admin/project-reviews`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  "admin/fetchProductReviews",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/reviews/admin/product-reviews`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchAppReviews = createAsyncThunk(
  "admin/fetchAppReviews",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/reviews/admin/app-reviews`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchSuspiciousReviews = createAsyncThunk(
  "admin/fetchSuspiciousReviews",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/reviews/reviews/suspicious`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateReviewStatus = createAsyncThunk(
  "admin/updateReviewStatus",
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/reviews/reviews/${id}/status`,
        { status }
      );
      // Refresh the reviews after status update
      dispatch(fetchAllReviews());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteReview = createAsyncThunk(
  "admin/deleteReview",
  async ({ id }, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`${BASE_URL}/reviews/reviews/${id}`);
      dispatch(fetchAllReviews());
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchReviewById = createAsyncThunk(
  "admin/fetchReviewById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/reviews/reviews/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// ----------------- USERS -----------------
export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/users`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await axios.delete(`${BASE_URL}/users/${id}`);
      dispatch(fetchUsers());
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  "admin/fetchUserStats",
  async () => {
    const response = await axios.get(`${BASE_URL}/users/stats`);
    return response.data;
  }
);

// ----------------- ARCHITECTS -----------------
export const fetchArchitectRequests = createAsyncThunk(
  "admin/fetchArchitectRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/arch-req/requests`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const approveArchitect = createAsyncThunk(
  "admin/approveArchitect",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/arch-req/requests/${id}`,
        {
          status: "approved",
        }
      );
      dispatch(fetchArchitectRequests()); // Refresh the list
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const rejectArchitect = createAsyncThunk(
  "admin/rejectArchitect",
  async (
    { id, rejectionReason, customReason },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/arch-req/requests/${id}`,
        {
          status: "rejected",
          rejectionReason,
          customReason,
        }
      );
      dispatch(fetchArchitectRequests()); // Refresh the list after rejection
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// New thunk to fetch architect statistics
export const fetchArchitectStats = createAsyncThunk(
  "admin/fetchArchitectStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/arch-req/stats`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    subscriptions: [],
    reviews: {
      productReviews: [],
      projectReviews: [],
      appReviews: [],
      suspiciousReviews: [],
      selectedReview: null,
    },
    architects: [],
    architectStats: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      rejectionReasons: [],
    },
    userStats: [], // Initialize userStats
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedReview: (state) => {
      state.reviews.selectedReview = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Subscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = state.subscriptions.map((sub) =>
          sub._id === action.payload._id ? action.payload : sub
        );
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // All Reviews
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.productReviews = action.payload.productReviews || [];
        state.reviews.projectReviews = action.payload.projectReviews || [];
        state.reviews.appReviews = action.payload.appReviews || [];
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Project Reviews
      .addCase(fetchProjectReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjectReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.projectReviews = action.payload;
      })
      .addCase(fetchProjectReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Product Reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.productReviews = action.payload;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // App Reviews
      .addCase(fetchAppReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.appReviews = action.payload;
      })
      .addCase(fetchAppReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Suspicious Reviews
      .addCase(fetchSuspiciousReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSuspiciousReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.suspiciousReviews = action.payload;
      })
      .addCase(fetchSuspiciousReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Review Status
      .addCase(updateReviewStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateReviewStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update the review in all relevant arrays
        const updatedReview = action.payload;
        state.reviews.productReviews = state.reviews.productReviews.map(
          (review) =>
            review._id === updatedReview._id ? updatedReview : review
        );
        state.reviews.projectReviews = state.reviews.projectReviews.map(
          (review) =>
            review._id === updatedReview._id ? updatedReview : review
        );
        state.reviews.appReviews = state.reviews.appReviews.map((review) =>
          review._id === updatedReview._id ? updatedReview : review
        );
        state.reviews.suspiciousReviews = state.reviews.suspiciousReviews.map(
          (review) =>
            review._id === updatedReview._id ? updatedReview : review
        );
      })
      .addCase(updateReviewStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.reviews.productReviews = state.reviews.productReviews.filter(
          (review) => review._id !== deletedId
        );
        state.reviews.projectReviews = state.reviews.projectReviews.filter(
          (review) => review._id !== deletedId
        );
        state.reviews.appReviews = state.reviews.appReviews.filter(
          (review) => review._id !== deletedId
        );
        state.reviews.suspiciousReviews =
          state.reviews.suspiciousReviews.filter(
            (review) => review._id !== deletedId
          );
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Review by ID
      .addCase(fetchReviewById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.selectedReview = action.payload;
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.userStats = action.payload; // Store user stats
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Correct error handling
      })
      // Architect Requests
      .addCase(fetchArchitectRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchArchitectRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.architects = action.payload;
      })
      .addCase(fetchArchitectRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveArchitect.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveArchitect.fulfilled, (state, action) => {
        state.loading = false;
        state.architects = state.architects.map((arch) =>
          arch._id === action.payload.user._id ? action.payload.user : arch
        );
      })
      .addCase(approveArchitect.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(rejectArchitect.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectArchitect.fulfilled, (state, action) => {
        state.loading = false;
        // Update the architect in the list instead of removing it
        state.architects = state.architects.map((arch) =>
          arch._id === action.payload.user._id ? action.payload.user : arch
        );
      })
      .addCase(rejectArchitect.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Architect Stats
      .addCase(fetchArchitectStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchArchitectStats.fulfilled, (state, action) => {
        state.loading = false;
        state.architectStats = action.payload;
      })
      .addCase(fetchArchitectStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedReview, clearError } = adminSlice.actions;
export default adminSlice.reducer;
