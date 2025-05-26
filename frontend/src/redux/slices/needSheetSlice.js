// store/slices/needsheetSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL - adjust according to your environment
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Configure axios defaults
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =============================================================================
// ASYNC THUNKS FOR NEEDSHEET OPERATIONS
// =============================================================================

/**
 * Create a new needsheet (automatically triggers matching)
 */
export const createNeedsheet = createAsyncThunk(
  "needsheet/create",
  async (needsheetData, { rejectWithValue }) => {
    try {
      const response = await api.post("/needsheets", needsheetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create needsheet"
      );
    }
  }
);

/**
 * Get all user's needsheets
 */
export const getUserNeedsheets = createAsyncThunk(
  "needsheet/getUserNeedsheets",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/needsheets");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch needsheets"
      );
    }
  }
);

/**
 * Get a specific needsheet by ID
 */
export const getNeedsheet = createAsyncThunk(
  "needsheet/getNeedsheet",
  async (needsheetId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/needsheets/${needsheetId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch needsheet"
      );
    }
  }
);

/**
 * Update a needsheet
 */
export const updateNeedsheet = createAsyncThunk(
  "needsheet/update",
  async ({ needsheetId, updateData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/needsheets/${needsheetId}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update needsheet"
      );
    }
  }
);

/**
 * Delete a needsheet
 */
export const deleteNeedsheet = createAsyncThunk(
  "needsheet/delete",
  async (needsheetId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/needsheets/${needsheetId}`);
      return { needsheetId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete needsheet"
      );
    }
  }
);

// =============================================================================
// ASYNC THUNKS FOR MATCHING OPERATIONS
// =============================================================================

/**
 * Trigger AI matching for a needsheet
 */
export const matchArchitects = createAsyncThunk(
  "needsheet/matchArchitects",
  async (needsheetId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/needsheets/${needsheetId}/match`);
      return { needsheetId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to match architects"
      );
    }
  }
);

/**
 * Get matches for a needsheet
 */
export const getMatches = createAsyncThunk(
  "needsheet/getMatches",
  async (needsheetId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/matching/${needsheetId}`);
      return { needsheetId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch matches"
      );
    }
  }
);

/**
 * Update client match status (approve/reject architect)
 */
export const updateClientMatchStatus = createAsyncThunk(
  "needsheet/updateClientMatchStatus",
  async ({ needsheetId, architectId, approve }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/matching/${needsheetId}/client-status`, {
        architectId,
        approve,
      });
      return { needsheetId, architectId, approve, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update match status"
      );
    }
  }
);

/**
 * Update architect match status (for architect dashboard)
 */
export const updateArchitectMatchStatus = createAsyncThunk(
  "needsheet/updateArchitectMatchStatus",
  async ({ needsheetId, approve }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/matching/${needsheetId}/architect-status`,
        {
          approve,
        }
      );
      return { needsheetId, approve, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update match status"
      );
    }
  }
);

/**
 * Refresh matches for a needsheet
 */
export const refreshMatches = createAsyncThunk(
  "needsheet/refreshMatches",
  async (needsheetId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/matching/${needsheetId}/refresh`);
      return { needsheetId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to refresh matches"
      );
    }
  }
);

/**
 * Direct matching call (alternative to the needsheet route)
 */
export const directMatch = createAsyncThunk(
  "needsheet/directMatch",
  async (needsheetId, { rejectWithValue }) => {
    try {
      const response = await api.post("/matching", { needsheetId });
      return { needsheetId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to match architects"
      );
    }
  }
);

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState = {
  // Needsheet data
  needsheets: [],
  currentNeedsheet: null,

  // Matching data
  matches: {}, // Keyed by needsheetId
  currentMatches: null,

  // Loading states
  loading: {
    create: false,
    fetch: false,
    update: false,
    delete: false,
    match: false,
    getMatches: false,
    updateStatus: false,
    refresh: false,
  },

  // Error states
  error: {
    create: null,
    fetch: null,
    update: null,
    delete: null,
    match: null,
    getMatches: null,
    updateStatus: null,
    refresh: null,
  },

  // Success states
  success: {
    create: false,
    update: false,
    delete: false,
    match: false,
    updateStatus: false,
    refresh: false,
  },

  // UI states
  ui: {
    showMatchModal: false,
    selectedArchitect: null,
    matchingInProgress: false,
  },
};

// =============================================================================
// NEEDSHEET SLICE
// =============================================================================

const needsheetSlice = createSlice({
  name: "needsheet",
  initialState,
  reducers: {
    // Clear all errors
    clearErrors: (state) => {
      Object.keys(state.error).forEach((key) => {
        state.error[key] = null;
      });
    },

    // Clear all success states
    clearSuccess: (state) => {
      Object.keys(state.success).forEach((key) => {
        state.success[key] = false;
      });
    },

    // Clear specific error
    clearError: (state, action) => {
      const errorType = action.payload;
      if (state.error[errorType]) {
        state.error[errorType] = null;
      }
    },

    // Clear specific success
    clearSuccessState: (state, action) => {
      const successType = action.payload;
      if (state.success[successType]) {
        state.success[successType] = false;
      }
    },

    // Set current needsheet
    setCurrentNeedsheet: (state, action) => {
      state.currentNeedsheet = action.payload;
    },

    // Clear current needsheet
    clearCurrentNeedsheet: (state) => {
      state.currentNeedsheet = null;
    },

    // Set current matches
    setCurrentMatches: (state, action) => {
      state.currentMatches = action.payload;
    },

    // Clear current matches
    clearCurrentMatches: (state) => {
      state.currentMatches = null;
    },

    // UI actions
    showMatchModal: (state, action) => {
      state.ui.showMatchModal = true;
      state.ui.selectedArchitect = action.payload;
    },

    hideMatchModal: (state) => {
      state.ui.showMatchModal = false;
      state.ui.selectedArchitect = null;
    },

    setMatchingInProgress: (state, action) => {
      state.ui.matchingInProgress = action.payload;
    },

    // Reset entire state
    resetNeedsheetState: (state) => {
      return { ...initialState };
    },
  },

  extraReducers: (builder) => {
    // =============================================================================
    // CREATE NEEDSHEET
    // =============================================================================
    builder
      .addCase(createNeedsheet.pending, (state) => {
        state.loading.create = true;
        state.error.create = null;
        state.success.create = false;
      })
      .addCase(createNeedsheet.fulfilled, (state, action) => {
        state.loading.create = false;
        state.success.create = true;
        state.needsheets.unshift(action.payload.data);
        state.currentNeedsheet = action.payload.data;

        // If matches were returned with creation, store them
        if (action.payload.matches) {
          state.matches[action.payload.data._id] = action.payload.matches;
          state.currentMatches = action.payload.matches;
        }
      })
      .addCase(createNeedsheet.rejected, (state, action) => {
        state.loading.create = false;
        state.error.create = action.payload;
        state.success.create = false;
      })

      // =============================================================================
      // GET USER NEEDSHEETS
      // =============================================================================
      .addCase(getUserNeedsheets.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
      })
      .addCase(getUserNeedsheets.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.needsheets = action.payload.data;
      })
      .addCase(getUserNeedsheets.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload;
      })

      // =============================================================================
      // GET SINGLE NEEDSHEET
      // =============================================================================
      .addCase(getNeedsheet.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
      })
      .addCase(getNeedsheet.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.currentNeedsheet = action.payload.data;
      })
      .addCase(getNeedsheet.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload;
      })

      // =============================================================================
      // UPDATE NEEDSHEET
      // =============================================================================
      .addCase(updateNeedsheet.pending, (state) => {
        state.loading.update = true;
        state.error.update = null;
        state.success.update = false;
      })
      .addCase(updateNeedsheet.fulfilled, (state, action) => {
        state.loading.update = false;
        state.success.update = true;

        // Update in needsheets array
        const index = state.needsheets.findIndex(
          (ns) => ns._id === action.payload.data._id
        );
        if (index !== -1) {
          state.needsheets[index] = action.payload.data;
        }

        // Update current needsheet if it matches
        if (state.currentNeedsheet?._id === action.payload.data._id) {
          state.currentNeedsheet = action.payload.data;
        }
      })
      .addCase(updateNeedsheet.rejected, (state, action) => {
        state.loading.update = false;
        state.error.update = action.payload;
        state.success.update = false;
      })

      // =============================================================================
      // DELETE NEEDSHEET
      // =============================================================================
      .addCase(deleteNeedsheet.pending, (state) => {
        state.loading.delete = true;
        state.error.delete = null;
        state.success.delete = false;
      })
      .addCase(deleteNeedsheet.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.success.delete = true;

        // Remove from needsheets array
        state.needsheets = state.needsheets.filter(
          (ns) => ns._id !== action.payload.needsheetId
        );

        // Clear current needsheet if it was deleted
        if (state.currentNeedsheet?._id === action.payload.needsheetId) {
          state.currentNeedsheet = null;
        }

        // Remove matches for deleted needsheet
        delete state.matches[action.payload.needsheetId];

        // Clear current matches if they belong to deleted needsheet
        if (state.currentMatches?.needsheetId === action.payload.needsheetId) {
          state.currentMatches = null;
        }
      })
      .addCase(deleteNeedsheet.rejected, (state, action) => {
        state.loading.delete = false;
        state.error.delete = action.payload;
        state.success.delete = false;
      })

      // =============================================================================
      // MATCH ARCHITECTS
      // =============================================================================
      .addCase(matchArchitects.pending, (state) => {
        state.loading.match = true;
        state.error.match = null;
        state.success.match = false;
        state.ui.matchingInProgress = true;
      })
      .addCase(matchArchitects.fulfilled, (state, action) => {
        state.loading.match = false;
        state.success.match = true;
        state.ui.matchingInProgress = false;

        // Store matches
        state.matches[action.payload.needsheetId] = action.payload.data;
        state.currentMatches = action.payload.data;
      })
      .addCase(matchArchitects.rejected, (state, action) => {
        state.loading.match = false;
        state.error.match = action.payload;
        state.success.match = false;
        state.ui.matchingInProgress = false;
      })

      // =============================================================================
      // DIRECT MATCH
      // =============================================================================
      .addCase(directMatch.pending, (state) => {
        state.loading.match = true;
        state.error.match = null;
        state.success.match = false;
        state.ui.matchingInProgress = true;
      })
      .addCase(directMatch.fulfilled, (state, action) => {
        state.loading.match = false;
        state.success.match = true;
        state.ui.matchingInProgress = false;

        // Store matches
        state.matches[action.payload.needsheetId] = action.payload.data;
        state.currentMatches = action.payload.data;
      })
      .addCase(directMatch.rejected, (state, action) => {
        state.loading.match = false;
        state.error.match = action.payload;
        state.success.match = false;
        state.ui.matchingInProgress = false;
      })

      // =============================================================================
      // GET MATCHES
      // =============================================================================
      .addCase(getMatches.pending, (state) => {
        state.loading.getMatches = true;
        state.error.getMatches = null;
      })
      .addCase(getMatches.fulfilled, (state, action) => {
        state.loading.getMatches = false;

        // Store matches
        state.matches[action.payload.needsheetId] = action.payload.data;
        state.currentMatches = action.payload.data;
      })
      .addCase(getMatches.rejected, (state, action) => {
        state.loading.getMatches = false;
        state.error.getMatches = action.payload;
      })

      // =============================================================================
      // UPDATE CLIENT MATCH STATUS
      // =============================================================================
      .addCase(updateClientMatchStatus.pending, (state) => {
        state.loading.updateStatus = true;
        state.error.updateStatus = null;
        state.success.updateStatus = false;
      })
      .addCase(updateClientMatchStatus.fulfilled, (state, action) => {
        state.loading.updateStatus = false;
        state.success.updateStatus = true;

        // Update the specific match status in stored matches
        const { needsheetId, architectId, approve } = action.payload;
        if (state.matches[needsheetId]) {
          const matchIndex = state.matches[needsheetId].matches.findIndex(
            (match) =>
              match.architectId === architectId ||
              match.architectId._id === architectId
          );

          if (matchIndex !== -1) {
            state.matches[needsheetId].matches[matchIndex].approval.client =
              approve;
            state.matches[needsheetId].matches[matchIndex].youApproved =
              approve;

            // Update status based on backend logic
            const architectApproval =
              state.matches[needsheetId].matches[matchIndex].approval.architect;
            if (approve) {
              if (architectApproval) {
                state.matches[needsheetId].matches[matchIndex].status =
                  "fully_accepted";
              } else {
                state.matches[needsheetId].matches[matchIndex].status =
                  "accepted_by_client";
              }
            } else {
              state.matches[needsheetId].matches[matchIndex].status =
                "rejected";
            }
          }
        }

        // Update current matches if they match
        if (state.currentMatches?.needsheetId === needsheetId) {
          state.currentMatches = state.matches[needsheetId];
        }
      })
      .addCase(updateClientMatchStatus.rejected, (state, action) => {
        state.loading.updateStatus = false;
        state.error.updateStatus = action.payload;
        state.success.updateStatus = false;
      })

      // =============================================================================
      // UPDATE ARCHITECT MATCH STATUS
      // =============================================================================
      .addCase(updateArchitectMatchStatus.pending, (state) => {
        state.loading.updateStatus = true;
        state.error.updateStatus = null;
        state.success.updateStatus = false;
      })
      .addCase(updateArchitectMatchStatus.fulfilled, (state, action) => {
        state.loading.updateStatus = false;
        state.success.updateStatus = true;

        // Update the specific match status in stored matches
        const { needsheetId, approve } = action.payload;
        if (state.matches[needsheetId]) {
          // For architect, we need to find their match (assuming single match for architect view)
          const matchIndex = state.matches[needsheetId].matches.findIndex(
            (match) => match.status !== "rejected"
          );

          if (matchIndex !== -1) {
            state.matches[needsheetId].matches[matchIndex].approval.architect =
              approve;

            // Update status based on backend logic
            const clientApproval =
              state.matches[needsheetId].matches[matchIndex].approval.client;
            if (approve) {
              if (clientApproval) {
                state.matches[needsheetId].matches[matchIndex].status =
                  "fully_accepted";
              } else {
                state.matches[needsheetId].matches[matchIndex].status =
                  "accepted_by_architect";
              }
            } else {
              state.matches[needsheetId].matches[matchIndex].status =
                "rejected";
            }
          }
        }

        // Update current matches if they match
        if (state.currentMatches?.needsheetId === needsheetId) {
          state.currentMatches = state.matches[needsheetId];
        }
      })
      .addCase(updateArchitectMatchStatus.rejected, (state, action) => {
        state.loading.updateStatus = false;
        state.error.updateStatus = action.payload;
        state.success.updateStatus = false;
      })

      // =============================================================================
      // REFRESH MATCHES
      // =============================================================================
      .addCase(refreshMatches.pending, (state) => {
        state.loading.refresh = true;
        state.error.refresh = null;
        state.success.refresh = false;
        state.ui.matchingInProgress = true;
      })
      .addCase(refreshMatches.fulfilled, (state, action) => {
        state.loading.refresh = false;
        state.success.refresh = true;
        state.ui.matchingInProgress = false;

        // Store refreshed matches
        state.matches[action.payload.needsheetId] = action.payload.data;
        state.currentMatches = action.payload.data;
      })
      .addCase(refreshMatches.rejected, (state, action) => {
        state.loading.refresh = false;
        state.error.refresh = action.payload;
        state.success.refresh = false;
        state.ui.matchingInProgress = false;
      });
  },
});

// =============================================================================
// EXPORT ACTIONS AND SELECTORS
// =============================================================================

export const {
  clearErrors,
  clearSuccess,
  clearError,
  clearSuccessState,
  setCurrentNeedsheet,
  clearCurrentNeedsheet,
  setCurrentMatches,
  clearCurrentMatches,
  showMatchModal,
  hideMatchModal,
  setMatchingInProgress,
  resetNeedsheetState,
} = needsheetSlice.actions;

// Selectors
export const selectNeedsheets = (state) => state.needsheet.needsheets;
export const selectCurrentNeedsheet = (state) =>
  state.needsheet.currentNeedsheet;
export const selectMatches = (state) => state.needsheet.matches;
export const selectCurrentMatches = (state) => state.needsheet.currentMatches;
export const selectNeedsheetLoading = (state) => state.needsheet.loading;
export const selectNeedsheetErrors = (state) => state.needsheet.error;
export const selectNeedsheetSuccess = (state) => state.needsheet.success;
export const selectNeedsheetUI = (state) => state.needsheet.ui;

// Complex selectors
export const selectMatchesForNeedsheet = (needsheetId) => (state) =>
  state.needsheet.matches[needsheetId] || null;

export const selectIsMatchingInProgress = (state) =>
  state.needsheet.ui.matchingInProgress ||
  state.needsheet.loading.match ||
  state.needsheet.loading.refresh;

export const selectHasAnyError = (state) =>
  Object.values(state.needsheet.error).some((error) => error !== null);

export const selectHasAnySuccess = (state) =>
  Object.values(state.needsheet.success).some((success) => success === true);

export default needsheetSlice.reducer;
