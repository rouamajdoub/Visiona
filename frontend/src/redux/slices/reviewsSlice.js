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
  allReviews: [], // For admin overview
  currentReview: null,

  // UI states
  isLoading: false,
  error: null,
  success: false,
  message: "",

  // Additional loading states for specific actions
  markingHelpful: false,
  updatingReview: false,
  deletingReview: false,
};

// Enhanced async thunks with better validation
export const getProjectReviews = createAsyncThunk(
  "reviews/getProjectReviews",
  async (projectId, thunkAPI) => {
    // Add validation to catch undefined projectId
    if (!projectId) {
      return thunkAPI.rejectWithValue("Project ID is required");
    }

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

export const getProductReviews = createAsyncThunk(
  "reviews/getProductReviews",
  async (productId, thunkAPI) => {
    // Add validation to catch undefined productId
    if (!productId) {
      return thunkAPI.rejectWithValue("Product ID is required");
    }

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

// App reviews don't need ID validation
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
    if (!reviewId) {
      return thunkAPI.rejectWithValue("Review ID is required");
    }

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
    if (!projectId) {
      return thunkAPI.rejectWithValue("Project ID is required");
    }

    try {
      // Get the token from the auth state
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");

      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await axios.post(
        `${API_URL}/projects/${projectId}/reviews`,
        reviewData,
        config
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
    if (!productId) {
      return thunkAPI.rejectWithValue("Product ID is required");
    }

    try {
      // Get the token from the auth state
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");

      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await axios.post(
        `${API_URL}/products/${productId}/reviews`,
        reviewData,
        config
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
      // Get the token from the auth state
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");

      if (!token) {
        return thunkAPI.rejectWithValue("Authentication token not found");
      }

      // Configure headers with the token
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/app/reviews`,
        reviewData,
        config
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to submit review";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Mark review as helpful - THIS WAS MISSING
export const markReviewAsHelpful = createAsyncThunk(
  "reviews/markReviewAsHelpful",
  async (reviewId, thunkAPI) => {
    if (!reviewId) {
      return thunkAPI.rejectWithValue("Review ID is required");
    }

    try {
      // Get the token from the auth state
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");

      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await axios.post(
        `${API_URL}/reviews/${reviewId}/helpful`,
        {},
        config
      );
      return { reviewId, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update a review (user can update their own review)
export const updateReview = createAsyncThunk(
  "reviews/updateReview",
  async ({ reviewId, reviewData }, thunkAPI) => {
    if (!reviewId) {
      return thunkAPI.rejectWithValue("Review ID is required");
    }

    try {
      // Get the token from the auth state
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");

      const config = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      const response = await axios.put(
        `${API_URL}/reviews/${reviewId}`,
        reviewData,
        config
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete user's own review
export const deleteUserReview = createAsyncThunk(
  "reviews/deleteUserReview",
  async (reviewId, thunkAPI) => {
    if (!reviewId) {
      return thunkAPI.rejectWithValue("Review ID is required");
    }

    try {
      // Get the token from the auth state
      const state = thunkAPI.getState();
      const token = state.auth?.token || localStorage.getItem("token");

      const config = {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      };

      await axios.delete(`${API_URL}/reviews/${reviewId}`, config);
      return reviewId;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin actions

// Get all reviews (admin overview)
export const getAllReviews = createAsyncThunk(
  "reviews/getAllReviews",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/admin/all-reviews`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all project reviews (admin)
export const getAllProjectReviews = createAsyncThunk(
  "reviews/getAllProjectReviews",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/admin/project-reviews`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all product reviews (admin)
export const getAllProductReviews = createAsyncThunk(
  "reviews/getAllProductReviews",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/admin/product-reviews`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all app reviews (admin)
export const getAllAppReviews = createAsyncThunk(
  "reviews/getAllAppReviews",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/admin/app-reviews`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

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
    if (!reviewId) {
      return thunkAPI.rejectWithValue("Review ID is required");
    }

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
    if (!reviewId) {
      return thunkAPI.rejectWithValue("Review ID is required");
    }

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
      state.markingHelpful = false;
      state.updatingReview = false;
      state.deletingReview = false;
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
    clearReviewError: (state) => {
      state.error = null;
    },
    clearReviewSuccess: (state) => {
      state.success = false;
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
        state.projectReviews = action.payload.data || [];
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
        state.productReviews = action.payload.data || [];
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
        state.appReviews = action.payload.data || [];
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
        state.myReviews = action.payload.data || [];
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
        // Add to my reviews if it exists
        if (action.payload.data) {
          state.myReviews.unshift(action.payload.data);
        }
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
        // Add to my reviews if it exists
        if (action.payload.data) {
          state.myReviews.unshift(action.payload.data);
        }
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
        // Add to my reviews if it exists
        if (action.payload.data) {
          state.myReviews.unshift(action.payload.data);
        }
      })
      .addCase(createAppReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Mark review as helpful - THIS WAS MISSING
      .addCase(markReviewAsHelpful.pending, (state) => {
        state.markingHelpful = true;
        state.error = null;
      })
      .addCase(markReviewAsHelpful.fulfilled, (state, action) => {
        state.markingHelpful = false;
        state.success = true;
        state.message = "Review marked as helpful";

        const { reviewId, data } = action.payload;

        // Helper function to update helpful count in review lists
        const updateHelpfulInList = (list) => {
          const index = list.findIndex((review) => review._id === reviewId);
          if (index !== -1) {
            list[index] = {
              ...list[index],
              helpfulCount:
                data.helpfulCount || (list[index].helpfulCount || 0) + 1,
              isHelpfulByCurrentUser: true,
            };
          }
        };

        // Update in all relevant lists
        updateHelpfulInList(state.projectReviews);
        updateHelpfulInList(state.productReviews);
        updateHelpfulInList(state.appReviews);
        updateHelpfulInList(state.myReviews);
        updateHelpfulInList(state.allReviews);

        // Update current review if it matches
        if (state.currentReview && state.currentReview._id === reviewId) {
          state.currentReview = {
            ...state.currentReview,
            helpfulCount:
              data.helpfulCount || (state.currentReview.helpfulCount || 0) + 1,
            isHelpfulByCurrentUser: true,
          };
        }
      })
      .addCase(markReviewAsHelpful.rejected, (state, action) => {
        state.markingHelpful = false;
        state.error = action.payload;
      })

      // Update review
      .addCase(updateReview.pending, (state) => {
        state.updatingReview = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.updatingReview = false;
        state.success = true;
        state.message = "Review updated successfully";

        const updatedReview = action.payload.data;

        // Helper function to update review in lists
        const updateReviewInList = (list) => {
          const index = list.findIndex(
            (review) => review._id === updatedReview._id
          );
          if (index !== -1) {
            list[index] = updatedReview;
          }
        };

        // Update in all relevant lists
        updateReviewInList(state.projectReviews);
        updateReviewInList(state.productReviews);
        updateReviewInList(state.appReviews);
        updateReviewInList(state.myReviews);
        updateReviewInList(state.allReviews);

        // Update current review if it matches
        if (
          state.currentReview &&
          state.currentReview._id === updatedReview._id
        ) {
          state.currentReview = updatedReview;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.updatingReview = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete user review
      .addCase(deleteUserReview.pending, (state) => {
        state.deletingReview = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteUserReview.fulfilled, (state, action) => {
        state.deletingReview = false;
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
        state.myReviews = state.myReviews.filter(
          (review) => review._id !== reviewId
        );
        state.allReviews = state.allReviews.filter(
          (review) => review._id !== reviewId
        );

        // Clear current review if it's the one being deleted
        if (state.currentReview && state.currentReview._id === reviewId) {
          state.currentReview = null;
        }
      })
      .addCase(deleteUserReview.rejected, (state, action) => {
        state.deletingReview = false;
        state.error = action.payload;
        state.success = false;
      })

      // Get all reviews (admin)
      .addCase(getAllReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allReviews = action.payload.data || [];
      })
      .addCase(getAllReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get all project reviews (admin)
      .addCase(getAllProjectReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllProjectReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projectReviews = action.payload.data || [];
      })
      .addCase(getAllProjectReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get all product reviews (admin)
      .addCase(getAllProductReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllProductReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productReviews = action.payload.data || [];
      })
      .addCase(getAllProductReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get all app reviews (admin)
      .addCase(getAllAppReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllAppReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appReviews = action.payload.data || [];
      })
      .addCase(getAllAppReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get suspicious reviews (admin)
      .addCase(getSuspiciousReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSuspiciousReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suspiciousReviews = action.payload.data || [];
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
        state.allReviews = updateReviewInList(
          [...state.allReviews],
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
        state.allReviews = state.allReviews.filter(
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
export const {
  resetReviewState,
  clearCurrentReview,
  clearReviewError,
  clearReviewSuccess,
} = reviewsSlice.actions;

// Export selectors
export const selectProjectReviews = (state) => state.reviews.projectReviews;
export const selectProductReviews = (state) => state.reviews.productReviews;
export const selectAppReviews = (state) => state.reviews.appReviews;
export const selectMyReviews = (state) => state.reviews.myReviews;
export const selectSuspiciousReviews = (state) =>
  state.reviews.suspiciousReviews;
export const selectAllReviews = (state) => state.reviews.allReviews;
export const selectCurrentReview = (state) => state.reviews.currentReview;

// Loading state selectors
export const selectReviewsLoading = (state) => state.reviews.isLoading;
export const selectMarkingHelpful = (state) => state.reviews.markingHelpful;
export const selectUpdatingReview = (state) => state.reviews.updatingReview;
export const selectDeletingReview = (state) => state.reviews.deletingReview;

// Error and success selectors
export const selectReviewsError = (state) => state.reviews.error;
export const selectReviewsSuccess = (state) => state.reviews.success;
export const selectReviewsMessage = (state) => state.reviews.message;

// Computed selectors
export const selectReviewById = (state, reviewId) => {
  const allReviewsArrays = [
    state.reviews.projectReviews,
    state.reviews.productReviews,
    state.reviews.appReviews,
    state.reviews.myReviews,
    state.reviews.allReviews,
    state.reviews.suspiciousReviews,
  ];

  for (const reviewsArray of allReviewsArrays) {
    const review = reviewsArray.find((review) => review._id === reviewId);
    if (review) return review;
  }

  return null;
};

// Get reviews by status
export const selectReviewsByStatus = (state, status) => {
  return state.reviews.allReviews.filter((review) => review.status === status);
};

// Get reviews by rating
export const selectReviewsByRating = (state, rating) => {
  const allReviewsArrays = [
    ...state.reviews.projectReviews,
    ...state.reviews.productReviews,
    ...state.reviews.appReviews,
  ];

  return allReviewsArrays.filter((review) => review.rating === rating);
};

// Get user's reviews count
export const selectUserReviewsCount = (state) => state.reviews.myReviews.length;

// Get average rating from reviews array
export const selectAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  const totalRating = reviews.reduce(
    (sum, review) => sum + (review.rating || 0),
    0
  );
  return (totalRating / reviews.length).toFixed(1);
};

// Get reviews statistics
export const selectReviewsStats = (state) => {
  const allReviews = [
    ...state.reviews.projectReviews,
    ...state.reviews.productReviews,
    ...state.reviews.appReviews,
  ];

  if (allReviews.length === 0) {
    return {
      total: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const ratingDistribution = allReviews.reduce(
    (acc, review) => {
      const rating = review.rating || 0;
      if (rating >= 1 && rating <= 5) {
        acc[rating] = (acc[rating] || 0) + 1;
      }
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  );

  const averageRating = selectAverageRating(allReviews);

  return {
    total: allReviews.length,
    averageRating: parseFloat(averageRating),
    ratingDistribution,
  };
};

// Default export
export default reviewsSlice.reducer;
