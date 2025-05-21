import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk action to fetch architect stats
export const fetchArchitectStats = createAsyncThunk(
  "stats/fetchArchitectStats",
  async (architectId, { rejectWithValue }) => {
    try {
      // Get auth token from local storage or other state
      const token = localStorage.getItem("token");

      // If you're running the backend on a different port/domain, specify it here
      // For example, if backend runs on port 5000:
      const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://localhost:5000";

      const response = await axios.get(
        `${API_BASE_URL}/api/arch-stats/${architectId}/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response.data); // Add logging to debug

      return response.data.data;
    } catch (error) {
      console.error("API Error:", error.response || error); // Add detailed error logging
      return rejectWithValue(
        error.response?.data?.error || `Endpoint not found: ${error.message}`
      );
    }
  }
);

const initialState = {
  clientGrowth: {
    monthlyData: [],
    percentageChange: 0,
    currentMonthCount: 0,
    previousMonthCount: 0,
  },
  activeProjects: {
    monthlyData: [],
    percentageChange: 0,
    currentMonthCount: 0,
    previousMonthCount: 0,
  },
  profileViews: {
    monthlyData: [],
    percentageChange: 0,
    currentMonthCount: 0,
    previousMonthCount: 0,
  },
  isLoading: false,
  error: null,
  lastFetched: null,
};

const statSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    clearStats: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArchitectStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchArchitectStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clientGrowth = action.payload.clientGrowth;
        state.activeProjects = action.payload.activeProjects;
        state.profileViews = action.payload.profileViews;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchArchitectStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStats } = statSlice.actions;

// Selectors
export const selectClientGrowthStats = (state) => state.stats.clientGrowth;
export const selectActiveProjectsStats = (state) => state.stats.activeProjects;
export const selectProfileViewsStats = (state) => state.stats.profileViews;
export const selectStatsLoading = (state) => state.stats.isLoading;
export const selectStatsError = (state) => state.stats.error;

export default statSlice.reducer;
