// src/redux/slices/needSheetSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Create a new need sheet
export const createNeedSheet = createAsyncThunk(
  "needSheet/create",
  async (needSheetData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };
      const response = await axios.post(
        "/api/needsheets",
        needSheetData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.error
          ? error.response.data.error
          : error.message
      );
    }
  }
);

// Get all need sheets for the logged-in user
export const getUserNeedSheets = createAsyncThunk(
  "needSheet/getUserNeedSheets",
  async (_, { rejectWithValue }) => {
    try {
      const config = {
        withCredentials: true,
      };
      const response = await axios.get("/api/needsheets", config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.error
          ? error.response.data.error
          : error.message
      );
    }
  }
);

// Get a single need sheet by ID
export const getNeedSheet = createAsyncThunk(
  "needSheet/getNeedSheet",
  async (id, { rejectWithValue }) => {
    try {
      const config = {
        withCredentials: true,
      };
      const response = await axios.get(`/api/needsheets/${id}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.error
          ? error.response.data.error
          : error.message
      );
    }
  }
);

// Update a need sheet
export const updateNeedSheet = createAsyncThunk(
  "needSheet/updateNeedSheet",
  async ({ id, needSheetData }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };
      const response = await axios.put(
        `/api/needsheets/${id}`,
        needSheetData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.error
          ? error.response.data.error
          : error.message
      );
    }
  }
);

// Delete a need sheet
export const deleteNeedSheet = createAsyncThunk(
  "needSheet/deleteNeedSheet",
  async (id, { rejectWithValue }) => {
    try {
      const config = {
        withCredentials: true,
      };
      const response = await axios.delete(`/api/needsheets/${id}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.error
          ? error.response.data.error
          : error.message
      );
    }
  }
);

const initialState = {
  needSheets: [],
  currentNeedSheet: null,
  formData: {}, // For storing multi-step form data
  loading: false,
  success: false,
  error: null,
};

const needSheetSlice = createSlice({
  name: "needSheet",
  initialState,
  reducers: {
    resetNeedSheetStatus: (state) => {
      state.success = false;
      state.error = null;
    },
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Create need sheet
      .addCase(createNeedSheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNeedSheet.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.needSheets.push(action.payload.data);
        state.currentNeedSheet = action.payload.data;
        state.formData = {}; // Reset form data after successful submission
      })
      .addCase(createNeedSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get user need sheets
      .addCase(getUserNeedSheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserNeedSheets.fulfilled, (state, action) => {
        state.loading = false;
        state.needSheets = action.payload.data;
      })
      .addCase(getUserNeedSheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get single need sheet
      .addCase(getNeedSheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNeedSheet.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNeedSheet = action.payload.data;
      })
      .addCase(getNeedSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update need sheet
      .addCase(updateNeedSheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNeedSheet.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentNeedSheet = action.payload.data;
        state.needSheets = state.needSheets.map((sheet) =>
          sheet._id === action.payload.data._id ? action.payload.data : sheet
        );
      })
      .addCase(updateNeedSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete need sheet
      .addCase(deleteNeedSheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNeedSheet.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.needSheets = state.needSheets.filter(
          (sheet) => sheet._id !== action.meta.arg
        );
      })
      .addCase(deleteNeedSheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetNeedSheetStatus, updateFormData, resetFormData } =
  needSheetSlice.actions;

// Selectors with safe fallbacks
export const selectNeedSheets = (state) => state.needSheet?.needSheets || [];
export const selectCurrentNeedSheet = (state) =>
  state.needSheet?.currentNeedSheet || null;
export const selectNeedSheetFormData = (state) =>
  state.needSheet?.formData || {};
export const selectNeedSheetLoading = (state) =>
  state.needSheet?.loading || false;
export const selectNeedSheetSuccess = (state) =>
  state.needSheet?.success || false;
export const selectNeedSheetError = (state) => state.needSheet?.error || null;

export default needSheetSlice.reducer;
