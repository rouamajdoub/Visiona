// src/redux/slices/needSheetSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Create a new need sheet
export const createNeedSheet = createAsyncThunk(
  "needSheet/create",
  async (needSheetData, { rejectWithValue }) => {
    try {
      // Format location data if present
      const formattedData = formatNeedSheetData(needSheetData);

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };

      const response = await axios.post(
        "/api/needsheets",
        formattedData,
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
      // Format location data if present
      const formattedData = formatNeedSheetData(needSheetData);

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };

      const response = await axios.put(
        `/api/needsheets/${id}`,
        formattedData,
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

// Helper function to format need sheet data before sending to API
const formatNeedSheetData = (data) => {
  const formattedData = { ...data };

  // Format services array if present
  if (formattedData.services) {
    // Ensure services are in the correct format { category, subcategories }
    formattedData.services = formattedData.services.map((service) => {
      // If the service is already in the correct format, return it as is
      if (service.category && typeof service.category === "string") {
        return {
          category: service.category,
          subcategories: Array.isArray(service.subcategories)
            ? service.subcategories
            : [],
        };
      }
      // Otherwise, it might be in legacy format or different structure - convert it
      return {
        category:
          typeof service.category === "object" ? service.category._id : service,
        subcategories: service.subcategories || [],
      };
    });
  }

  // Ensure location structure is correct
  if (formattedData.location) {
    // Make sure location has the proper structure
    formattedData.location = {
      country: formattedData.location.country || "Tunisia",
      region: formattedData.location.region || "",
      city: formattedData.location.city || "",
      // Coordinates will be handled by the backend, no need to provide them here
    };
  }

  return formattedData;
};

const initialState = {
  needSheets: [],
  currentNeedSheet: null,
  formData: {
    // Initialize with structured format matching updated model
    location: {
      country: "Tunisia",
      region: "",
      city: "",
    },
    services: [],
    projectTypes: [],
  },
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
    // Add service to form data
    addService: (state, action) => {
      const { category, subcategories } = action.payload;
      // Ensure we don't add duplicate categories
      const existingIndex = state.formData.services.findIndex(
        (service) => service.category === category
      );

      if (existingIndex !== -1) {
        // Update existing service
        state.formData.services[existingIndex] = {
          category,
          subcategories:
            subcategories ||
            state.formData.services[existingIndex].subcategories,
        };
      } else {
        // Add new service
        state.formData.services.push({
          category,
          subcategories: subcategories || [],
        });
      }
    },
    // Remove service from form data
    removeService: (state, action) => {
      const categoryId = action.payload;
      state.formData.services = state.formData.services.filter(
        (service) => service.category !== categoryId
      );
    },
    // Update location in form data
    updateLocation: (state, action) => {
      state.formData.location = {
        ...state.formData.location,
        ...action.payload,
      };
    },
    resetFormData: (state) => {
      state.formData = initialState.formData;
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
        state.formData = initialState.formData; // Reset form data after successful submission
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

export const {
  resetNeedSheetStatus,
  updateFormData,
  resetFormData,
  addService,
  removeService,
  updateLocation,
} = needSheetSlice.actions;

// Selectors with safe fallbacks
export const selectNeedSheets = (state) => state.needSheet?.needSheets || [];
export const selectCurrentNeedSheet = (state) =>
  state.needSheet?.currentNeedSheet || null;
export const selectNeedSheetFormData = (state) =>
  state.needSheet?.formData || initialState.formData;
export const selectNeedSheetLoading = (state) =>
  state.needSheet?.loading || false;
export const selectNeedSheetSuccess = (state) =>
  state.needSheet?.success || false;
export const selectNeedSheetError = (state) => state.needSheet?.error || null;

// Additional selectors for specific parts of form data
export const selectNeedSheetServices = (state) =>
  state.needSheet?.formData?.services || [];
export const selectNeedSheetLocation = (state) =>
  state.needSheet?.formData?.location || initialState.formData.location;

export default needSheetSlice.reducer;
