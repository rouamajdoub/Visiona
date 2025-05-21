import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL - replace with your actual API base URL
const API_BASE_URL = "/api/arch-req";

// Async thunks
export const fetchArchitectRequests = createAsyncThunk(
  "architectApproval/fetchRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/requests`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch architect requests"
      );
    }
  }
);

export const fetchArchitectDetails = createAsyncThunk(
  "architectApproval/fetchDetails",
  async (architectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requests/${architectId}`
      );
      return response.data.architect;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch architect details"
      );
    }
  }
);

export const updateArchitectStatus = createAsyncThunk(
  "architectApproval/updateStatus",
  async (
    { architectId, status, rejectionReason, customReason },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/requests/${architectId}`,
        { status, rejectionReason, customReason }
      );
      return {
        updatedArchitect: response.data.user,
        status,
        architectId,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update architect status"
      );
    }
  }
);

export const fetchArchitectStats = createAsyncThunk(
  "architectApproval/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch architect statistics"
      );
    }
  }
);

// Get document URL - this is not an async thunk as it just returns a URL string
export const getDocumentUrl = (architectId, docType) => {
  return `${API_BASE_URL}/requests/${architectId}/documents/${docType}`;
};

// Initial state
const initialState = {
  requests: [],
  selectedArchitect: null,
  loading: false,
  detailsLoading: false,
  updateLoading: false,
  statsLoading: false,
  error: null,
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    rejectionReasons: [],
  },
  currentDocument: null,
};

// Slice
const architectApprovalSlice = createSlice({
  name: "architectApproval",
  initialState,
  reducers: {
    clearSelectedArchitect: (state) => {
      state.selectedArchitect = null;
    },
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch architect requests
      .addCase(fetchArchitectRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArchitectRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchArchitectRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch requests";
      })

      // Fetch architect details
      .addCase(fetchArchitectDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchArchitectDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedArchitect = action.payload;
      })
      .addCase(fetchArchitectDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || "Failed to fetch architect details";
      })

      // Update architect status
      .addCase(updateArchitectStatus.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateArchitectStatus.fulfilled, (state, action) => {
        state.updateLoading = false;

        // Update in the requests list
        const { architectId, status } = action.payload;

        // Find and update the architect in the requests array
        state.requests = state.requests.filter(
          (architect) => architect._id !== architectId
        );

        // If this was the selected architect, update that too
        if (
          state.selectedArchitect &&
          state.selectedArchitect._id === architectId
        ) {
          state.selectedArchitect = action.payload.updatedArchitect;
        }
      })
      .addCase(updateArchitectStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload || "Failed to update architect status";
      })

      // Fetch architect stats
      .addCase(fetchArchitectStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchArchitectStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchArchitectStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload || "Failed to fetch architect statistics";
      });
  },
});

// Export actions and reducer
export const { clearSelectedArchitect, setCurrentDocument, clearErrors } =
  architectApprovalSlice.actions;

export default architectApprovalSlice.reducer;
