import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API base URL
const API_URL = "/api/reviews";

// Initial state
const initialState = {
  // Reviews data
  projectReviews: [],
  productReviews: [],
  appReviews: [],
  myReviews: [],
  suspiciousReviews: [],
  currentReview: null,

  // UI states
  isLoading: false,
  error: null,
  success: false,
  message: "",
};

// Async thunks for fetching project reviews
export const getProjectReviews = createAsyncThunk(
  "reviews/getProjectReviews",
  async (projectId, thunkAPI) => {
    try {
      const response = await axios.get(
        `${API_URL}/projects/${projectId}/reviews`
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunks for fetching product reviews
export const getProductReviews = createAsyncThunk(
  "reviews/getProductReviews",
  async (productId, thunkAPI) => {
    try {
      const response = await axios.get(
        `${API_URL}/products/${productId}/reviews`
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunks for fetching app reviews
export const getAppReviews = createAsyncThunk(
  "reviews/getAppReviews",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/app/reviews`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get a specific review by ID
export const getReviewById = createAsyncThunk(
  "reviews/getReviewById",
  async (reviewId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get current user's reviews
export const getMyReviews = createAsyncThunk(
  "reviews/getMyReviews",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/my-reviews`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a project review
export const createProjectReview = createAsyncThunk(
  "reviews/createProjectReview",
  async ({ projectId, reviewData }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_URL}/projects/${projectId}/reviews`,
        reviewData
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a product review
export const createProductReview = createAsyncThunk(
  "reviews/createProductReview",
  async ({ productId, reviewData }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_URL}/products/${productId}/reviews`,
        reviewData
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create an app review
export const createAppReview = createAsyncThunk(
  "reviews/createAppReview",
  async (reviewData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/app/reviews`, reviewData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin actions

// Get suspicious reviews flagged by AI (admin only)
export const getSuspiciousReviews = createAsyncThunk(
  "reviews/getSuspiciousReviews",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/reviews/suspicious`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update review status (admin only)
export const updateReviewStatus = createAsyncThunk(
  "reviews/updateReviewStatus",
  async ({ reviewId, statusData }, thunkAPI) => {
    try {
      const response = await axios.patch(
        `${API_URL}/reviews/${reviewId}/status`,
        statusData
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a review (admin only)
export const deleteReview = createAsyncThunk(
  "reviews/deleteReview",
  async (reviewId, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/reviews/${reviewId}`);
      return reviewId;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reviews slice
const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    resetReviewState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = false;
      state.message = "";
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get project reviews
      .addCase(getProjectReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProjectReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projectReviews = action.payload.data;
      })
      .addCase(getProjectReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get product reviews
      .addCase(getProductReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productReviews = action.payload.data;
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get app reviews
      .addCase(getAppReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAppReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appReviews = action.payload.data;
      })
      .addCase(getAppReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get review by ID
      .addCase(getReviewById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReviewById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReview = action.payload.data;
      })
      .addCase(getReviewById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get my reviews
      .addCase(getMyReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myReviews = action.payload.data;
      })
      .addCase(getMyReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create project review
      .addCase(createProjectReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProjectReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.message = "Project review created successfully";
        // Add to my reviews
        state.myReviews.unshift(action.payload.data);
      })
      .addCase(createProjectReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Create product review
      .addCase(createProductReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProductReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.message = "Product review created successfully";
        // Add to my reviews
        state.myReviews.unshift(action.payload.data);
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Create app review
      .addCase(createAppReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAppReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.message = "App review created successfully";
        // Add to my reviews
        state.myReviews.unshift(action.payload.data);
      })
      .addCase(createAppReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Get suspicious reviews (admin)
      .addCase(getSuspiciousReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSuspiciousReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suspiciousReviews = action.payload.data;
      })
      .addCase(getSuspiciousReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update review status (admin)
      .addCase(updateReviewStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateReviewStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.message = "Review status updated successfully";

        // Update current review if it's the one being modified
        if (
          state.currentReview &&
          state.currentReview._id === action.payload.data._id
        ) {
          state.currentReview = action.payload.data;
        }

        // Update in various review lists
        const updatedReview = action.payload.data;

        // Update in suspicious reviews
        const suspiciousIndex = state.suspiciousReviews.findIndex(
          (review) => review._id === updatedReview._id
        );
        if (suspiciousIndex !== -1) {
          if (updatedReview.status === "published") {
            // If published, might want to remove from suspicious list
            state.suspiciousReviews.splice(suspiciousIndex, 1);
          } else {
            // Otherwise update it
            state.suspiciousReviews[suspiciousIndex] = updatedReview;
          }
        }

        // Helper function to update reviews in different lists
        const updateReviewInList = (list, review) => {
          const index = list.findIndex((item) => item._id === review._id);
          if (index !== -1) {
            list[index] = review;
          }
          return list;
        };

        // Update in other lists
        state.projectReviews = updateReviewInList(
          [...state.projectReviews],
          updatedReview
        );
        state.productReviews = updateReviewInList(
          [...state.productReviews],
          updatedReview
        );
        state.appReviews = updateReviewInList(
          [...state.appReviews],
          updatedReview
        );
        state.myReviews = updateReviewInList(
          [...state.myReviews],
          updatedReview
        );
      })
      .addCase(updateReviewStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete review (admin)
      .addCase(deleteReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.message = "Review deleted successfully";

        const reviewId = action.payload;

        // Remove from all review lists
        state.projectReviews = state.projectReviews.filter(
          (review) => review._id !== reviewId
        );
        state.productReviews = state.productReviews.filter(
          (review) => review._id !== reviewId
        );
        state.appReviews = state.appReviews.filter(
          (review) => review._id !== reviewId
        );
        state.suspiciousReviews = state.suspiciousReviews.filter(
          (review) => review._id !== reviewId
        );
        state.myReviews = state.myReviews.filter(
          (review) => review._id !== reviewId
        );

        // Clear current review if it's the one being deleted
        if (state.currentReview && state.currentReview._id === reviewId) {
          state.currentReview = null;
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

// Export actions
export const { resetReviewState, clearCurrentReview } = reviewsSlice.actions;

// Export selectors
export const selectProjectReviews = (state) => state.reviews.projectReviews;
export const selectProductReviews = (state) => state.reviews.productReviews;
export const selectAppReviews = (state) => state.reviews.appReviews;
export const selectMyReviews = (state) => state.reviews.myReviews;
export const selectSuspiciousReviews = (state) =>
  state.reviews.suspiciousReviews;
export const selectCurrentReview = (state) => state.reviews.currentReview;
export const selectReviewsLoading = (state) => state.reviews.isLoading;
export const selectReviewsError = (state) => state.reviews.error;
export const selectReviewsSuccess = (state) => state.reviews.success;
export const selectReviewsMessage = (state) => state.reviews.message;

// Export reducer
export default reviewsSlice.reducer;
