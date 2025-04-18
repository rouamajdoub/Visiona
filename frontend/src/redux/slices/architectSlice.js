import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5000/api/profile";
const getToken = () => localStorage.getItem("token");

// Helper function for authenticated requests
const configureHeaders = (formData = false) => {
  const headers = { Authorization: `Bearer ${getToken()}` };
  if (!formData) headers["Content-Type"] = "application/json";
  return { headers };
};

// Fetch architect profile
export const fetchArchitectProfile = createAsyncThunk(
  "architect/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/me`, configureHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "An error occurred" }
      );
    }
  }
);

// Update architect profile (with form data support for file uploads)
export const updateArchitectProfile = createAsyncThunk(
  "architect/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      // Check if we're sending form data (for file uploads)
      const isFormData = profileData instanceof FormData;

      const response = await axios.put(
        `${API_URL}/me`,
        profileData,
        configureHeaders(isFormData)
      );

      return response.data;
    } catch (error) {
      // Check for specific Mongoose cast errors
      if (error.response?.data?.message?.includes("Cast to embedded failed")) {
        console.error("Cast error with arrays:", error.response.data);
        // You could try to reformat and resend the data here
      }
      return rejectWithValue(
        error.response?.data || { error: "Failed to update profile" }
      );
    }
  }
);

// Delete portfolio item
export const deletePortfolioItem = createAsyncThunk(
  "architect/deletePortfolioItem",
  async (itemIndex, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/me/portfolio/${itemIndex}`,
        configureHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "Failed to delete portfolio item" }
      );
    }
  }
);

// Fetch architect stats
export const fetchArchitectStats = createAsyncThunk(
  "architect/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/me/stats`,
        configureHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "Failed to load stats" }
      );
    }
  }
);

// Delete architect account
export const deleteArchitectAccount = createAsyncThunk(
  "architect/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/me`, configureHeaders());
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { error: "Failed to delete account" }
      );
    }
  }
);

const architectSlice = createSlice({
  name: "architect",
  initialState: {
    profile: null,
    stats: null,
    loading: false,
    updateLoading: false,
    error: null,
    updateError: null,
    updateSuccess: false,
  },
  reducers: {
    resetArchitectState: (state) => {
      state.profile = null;
      state.stats = null;
      state.loading = false;
      state.error = null;
    },
    clearUpdateStatus: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile cases
      .addCase(fetchArchitectProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArchitectProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchArchitectProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update profile cases
      .addCase(updateArchitectProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateArchitectProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.profile = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateArchitectProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })

      // Delete portfolio item cases
      .addCase(deletePortfolioItem.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.portfolio = action.payload.portfolio;
        }
      })

      // Fetch stats cases
      .addCase(fetchArchitectStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Delete account cases
      .addCase(deleteArchitectAccount.fulfilled, (state) => {
        state.profile = null;
        state.stats = null;
      });
  },
});

export const { resetArchitectState, clearUpdateStatus } =
  architectSlice.actions;
export default architectSlice.reducer;
