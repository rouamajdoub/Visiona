import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Update API URL to match your backend routes
const API_URL = "http://localhost:5000/api/profile";
const getToken = () => localStorage.getItem("token");

// Helper function for authenticated requests
const configureHeaders = (isFormData = false) => {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };

  // Don't set Content-Type for FormData - let browser handle it
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return { headers };
};

// Enhanced validation for location data with better error handling
const validateLocationData = (locationData) => {
  if (!locationData) return locationData;

  const cleanLocation = { ...locationData };

  // Handle coordinates validation with improved error messages
  if (cleanLocation.coordinates) {
    // If coordinates is a string, try to parse it
    if (typeof cleanLocation.coordinates === "string") {
      try {
        cleanLocation.coordinates = JSON.parse(cleanLocation.coordinates);
      } catch (e) {
        console.warn(
          "Failed to parse coordinates string:",
          cleanLocation.coordinates
        );
        delete cleanLocation.coordinates;
        return cleanLocation;
      }
    }

    // Validate coordinates array with more specific checks
    if (Array.isArray(cleanLocation.coordinates)) {
      const [lng, lat] = cleanLocation.coordinates;
      if (
        cleanLocation.coordinates.length !== 2 ||
        typeof lng !== "number" ||
        typeof lat !== "number" ||
        isNaN(lng) ||
        isNaN(lat) ||
        lng < -180 ||
        lng > 180 ||
        lat < -90 ||
        lat > 90
      ) {
        console.warn(
          "Invalid coordinates format or values:",
          cleanLocation.coordinates
        );
        delete cleanLocation.coordinates;
      }
    } else {
      // If coordinates exist but are not an array, remove them
      delete cleanLocation.coordinates;
    }
  }

  return cleanLocation;
};

const prepareProfileData = (profileData) => {
  const preparedData = { ...profileData };

  // Handle location data specifically
  if (preparedData.location) {
    preparedData.location = validateLocationData(preparedData.location);
  }

  // Handle array fields that might be strings with better error handling
  const arrayFields = [
    "specialization",
    "certifications",
    "projectTypes",
    // Remove "services" from here - it should be handled separately
  ];

  arrayFields.forEach((field) => {
    if (preparedData[field]) {
      if (typeof preparedData[field] === "string") {
        try {
          const parsed = JSON.parse(preparedData[field]);
          preparedData[field] = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          console.warn(`Failed to parse ${field}:`, preparedData[field]);
          preparedData[field] = Array.isArray(preparedData[field])
            ? preparedData[field]
            : [];
        }
      } else if (!Array.isArray(preparedData[field])) {
        preparedData[field] = [preparedData[field]];
      }
    }
  });

  // Handle services separately - don't include in profile update if it's complex
  if (preparedData.services) {
    // If services is just an array of IDs, keep it
    // If it's complex objects, remove it and handle via separate action
    if (
      Array.isArray(preparedData.services) &&
      preparedData.services.every((service) => typeof service === "string")
    ) {
      // Keep simple service ID array
    } else {
      console.warn(
        "Complex services data detected, removing from profile update"
      );
      delete preparedData.services;
    }
  }

  // Handle nested object fields with validation
  const nestedFields = [
    "education",
    "socialMedia",
    "softwareProficiency",
    "languages",
    "companyHistory",
  ];

  nestedFields.forEach((field) => {
    if (preparedData[field] && typeof preparedData[field] === "string") {
      try {
        preparedData[field] = JSON.parse(preparedData[field]);
      } catch (e) {
        console.warn(`Failed to parse ${field}:`, preparedData[field]);
        if (field === "education" || field === "socialMedia") {
          preparedData[field] = {};
        } else {
          preparedData[field] = [];
        }
      }
    }
  });

  // Ensure required nested objects have default structure
  if (!preparedData.education || typeof preparedData.education !== "object") {
    preparedData.education = {
      degree: "",
      institution: "",
      graduationYear: "",
    };
  }

  if (
    !preparedData.socialMedia ||
    typeof preparedData.socialMedia !== "object"
  ) {
    preparedData.socialMedia = {
      linkedin: "",
      instagram: "",
      facebook: "",
      twitter: "",
    };
  }

  if (!preparedData.location || typeof preparedData.location !== "object") {
    preparedData.location = { country: "", region: "", city: "" };
  }

  return preparedData;
};

// Add new action for updating architect services separately
export const updateArchitectServices = createAsyncThunk(
  "architect/updateServices",
  async (serviceIds, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/me/services`,
        { services: serviceIds },
        configureHeaders()
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update services";
      return rejectWithValue({
        error: errorMessage,
        status: error.response?.status,
      });
    }
  }
);

// Fetch architect profile
export const fetchArchitectProfile = createAsyncThunk(
  "architect/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/me`, configureHeaders());
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch profile";
      return rejectWithValue({
        error: errorMessage,
        status: error.response?.status,
        details: error.response?.data,
      });
    }
  }
);

export const updateArchitectProfile = createAsyncThunk(
  "architect/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      let preparedData;
      let isFormData = false;

      // Check if it's FormData (for file uploads)
      if (profileData instanceof FormData) {
        isFormData = true;

        // Handle services in FormData - remove complex service data
        const servicesData = profileData.get("services");
        if (servicesData && servicesData !== "undefined") {
          try {
            const parsedServices = JSON.parse(servicesData);
            // Only keep if it's simple array of IDs
            if (
              Array.isArray(parsedServices) &&
              parsedServices.every((s) => typeof s === "string")
            ) {
              profileData.set("services", JSON.stringify(parsedServices));
            } else {
              console.warn("Removing complex services data from FormData");
              profileData.delete("services");
            }
          } catch (e) {
            console.warn("Failed to parse services from FormData:", e);
            profileData.delete("services");
          }
        }

        // For FormData, validate location data if present
        const locationData = profileData.get("location");
        if (locationData && locationData !== "undefined") {
          try {
            const parsedLocation = JSON.parse(locationData);
            const validatedLocation = validateLocationData(parsedLocation);
            profileData.set("location", JSON.stringify(validatedLocation));
          } catch (e) {
            console.warn("Failed to parse location from FormData:", e);
            profileData.delete("location");
          }
        }

        // Validate other FormData fields
        const fieldsToValidate = [
          "education",
          "socialMedia",
          "softwareProficiency",
          "languages",
        ];
        fieldsToValidate.forEach((field) => {
          const fieldData = profileData.get(field);
          if (fieldData && fieldData !== "undefined") {
            try {
              JSON.parse(fieldData);
            } catch (e) {
              console.warn(`Invalid JSON for ${field}, removing:`, fieldData);
              profileData.delete(field);
            }
          }
        });

        preparedData = profileData;
      } else {
        // For regular JSON data
        preparedData = prepareProfileData(profileData);
      }

      const response = await axios.put(
        `${API_URL}/me`,
        preparedData,
        configureHeaders(isFormData)
      );

      return response.data;
    } catch (error) {
      console.error("Update profile error:", error);

      // Your existing error handling code remains the same...
      let errorMessage = "Failed to update profile";
      let errorDetails = null;

      if (error.response?.data) {
        const {
          error: serverError,
          message,
          details,
          errors,
        } = error.response.data;

        if (errors && Array.isArray(errors)) {
          errorMessage = errors.map((err) => err.message || err.msg).join(", ");
          errorDetails = errors;
        } else if (details && Array.isArray(details)) {
          errorMessage = details.map((detail) => detail.message).join(", ");
          errorDetails = details;
        } else if (error.response.data.name === "ValidationError") {
          const validationErrors = Object.values(
            error.response.data.errors || {}
          );
          errorMessage = validationErrors.map((err) => err.message).join(", ");
          errorDetails = validationErrors;
        } else if (
          message &&
          message.includes("Only image files are allowed")
        ) {
          errorMessage =
            "Please upload only image files for profile picture, company logo, and portfolio.";
        } else if (
          message &&
          message.includes("Only PDF and image files are allowed")
        ) {
          errorMessage =
            "Please upload only PDF and image files for documents.";
        } else if (message && message.includes("File too large")) {
          errorMessage = "One or more files exceed the 5MB size limit.";
        } else if (
          message &&
          message.includes("is required and cannot be empty")
        ) {
          errorMessage = message;
        } else if (
          error.response.status === 400 &&
          message &&
          message.includes("already exists")
        ) {
          errorMessage = message;
        } else if (error.response.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (error.response.status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (error.response.status >= 500) {
          errorMessage = "Server error occurred. Please try again later.";
        } else if (serverError) {
          errorMessage = serverError;
        } else if (message) {
          errorMessage = message;
        }
      } else if (error.code === "NETWORK_ERROR" || !error.response) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      return rejectWithValue({
        error: errorMessage,
        details: errorDetails,
        status: error.response?.status,
        originalError: error.response?.data,
      });
    }
  }
);

// Enhanced delete portfolio item with better error handling
export const deletePortfolioItem = createAsyncThunk(
  "architect/deletePortfolioItem",
  async (itemIndex, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/me/portfolio/${itemIndex}`,
        configureHeaders()
      );
      return { ...response.data, deletedIndex: itemIndex };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete portfolio item";
      return rejectWithValue({
        error: errorMessage,
        status: error.response?.status,
        itemIndex,
      });
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
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to load stats";
      return rejectWithValue({
        error: errorMessage,
        status: error.response?.status,
      });
    }
  }
);

// Delete architect account
export const deleteArchitectAccount = createAsyncThunk(
  "architect/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/me`, configureHeaders());
      // Clear token after successful deletion
      localStorage.removeItem("token");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete account";
      return rejectWithValue({
        error: errorMessage,
        status: error.response?.status,
      });
    }
  }
);

// Update payment status
export const updatePaymentStatus = createAsyncThunk(
  "architect/updatePaymentStatus",
  async (paymentStatus, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/me/payment`,
        { paymentStatus },
        configureHeaders()
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update payment status";
      return rejectWithValue({
        error: errorMessage,
        status: error.response?.status,
      });
    }
  }
);

// Update location specifically (useful for map interactions)
export const updateArchitectLocation = createAsyncThunk(
  "architect/updateLocation",
  async (locationData, { rejectWithValue }) => {
    try {
      const validatedLocation = validateLocationData(locationData);
      const response = await axios.put(
        `${API_URL}/me`,
        { location: validatedLocation },
        configureHeaders()
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update location";
      return rejectWithValue({
        error: errorMessage,
        status: error.response?.status,
        originalLocation: locationData,
      });
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
    locationUpdateLoading: false,
    paymentUpdateLoading: false,
    lastUpdated: null,
    // Add flags for different operations
    deletePortfolioLoading: false,
    deleteAccountLoading: false,
  },
  reducers: {
    resetArchitectState: (state) => {
      state.profile = null;
      state.stats = null;
      state.loading = false;
      state.error = null;
      state.updateError = null;
      state.updateSuccess = false;
      state.lastUpdated = null;
      state.locationUpdateLoading = false;
      state.paymentUpdateLoading = false;
      state.deletePortfolioLoading = false;
      state.deleteAccountLoading = false;
    },

    clearUpdateStatus: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
      state.locationUpdateLoading = false;
      state.paymentUpdateLoading = false;
    },

    // Enhanced local profile update with validation
    updateProfileLocally: (state, action) => {
      if (state.profile) {
        const updatedData = prepareProfileData(action.payload);
        state.profile = { ...state.profile, ...updatedData };
        state.lastUpdated = new Date().toISOString();
      }
    },

    // Clear specific errors
    clearUpdateError: (state) => {
      state.updateError = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Set update success manually (useful for UI feedback)
    setUpdateSuccess: (state, action) => {
      state.updateSuccess = action.payload;
    },

    // Update specific profile fields locally
    updateProfileField: (state, action) => {
      const { field, value } = action.payload;
      if (state.profile) {
        // Handle nested field updates (e.g., "location.city")
        if (field.includes(".")) {
          const [parent, child] = field.split(".");
          if (!state.profile[parent]) {
            state.profile[parent] = {};
          }
          state.profile[parent][child] = value;
        } else {
          state.profile[field] = value;
        }
        state.lastUpdated = new Date().toISOString();
      }
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
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchArchitectProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.profile = null;
      })
      .addCase(updateArchitectServices.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateArchitectServices.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (state.profile) {
          state.profile.services = action.payload.services;
        }
        state.updateError = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateArchitectServices.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
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
        state.updateError = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateArchitectProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })

      // Update location cases
      .addCase(updateArchitectLocation.pending, (state) => {
        state.locationUpdateLoading = true;
        state.updateError = null;
      })
      .addCase(updateArchitectLocation.fulfilled, (state, action) => {
        state.locationUpdateLoading = false;
        state.profile = action.payload;
        state.updateError = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateArchitectLocation.rejected, (state, action) => {
        state.locationUpdateLoading = false;
        state.updateError = action.payload;
      })

      // Update payment status cases
      .addCase(updatePaymentStatus.pending, (state) => {
        state.paymentUpdateLoading = true;
        state.updateError = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.paymentUpdateLoading = false;
        if (state.profile && action.payload.architect) {
          state.profile = { ...state.profile, ...action.payload.architect };
        }
        state.updateError = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.paymentUpdateLoading = false;
        state.updateError = action.payload;
      })

      // Delete portfolio item cases
      .addCase(deletePortfolioItem.pending, (state) => {
        state.deletePortfolioLoading = true;
        state.updateError = null;
      })
      .addCase(deletePortfolioItem.fulfilled, (state, action) => {
        state.deletePortfolioLoading = false;
        if (state.profile && action.payload.portfolio) {
          state.profile.portfolio = action.payload.portfolio;
          state.lastUpdated = new Date().toISOString();
        }
      })
      .addCase(deletePortfolioItem.rejected, (state, action) => {
        state.deletePortfolioLoading = false;
        state.updateError = action.payload;
      })

      // Fetch stats cases
      .addCase(fetchArchitectStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchArchitectStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchArchitectStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete account cases
      .addCase(deleteArchitectAccount.pending, (state) => {
        state.deleteAccountLoading = true;
        state.updateError = null;
      })
      .addCase(deleteArchitectAccount.fulfilled, (state) => {
        state.deleteAccountLoading = false;
        state.profile = null;
        state.stats = null;
        state.updateSuccess = true;
      })
      .addCase(deleteArchitectAccount.rejected, (state, action) => {
        state.deleteAccountLoading = false;
        state.updateError = action.payload;
      });
  },
});

export const {
  resetArchitectState,
  clearUpdateStatus,
  updateProfileLocally,
  clearUpdateError,
  clearError,
  setUpdateSuccess,
  updateProfileField,
} = architectSlice.actions;

export default architectSlice.reducer;

// Enhanced selectors for easier state access
export const selectArchitectProfile = (state) => state.architect.profile;
export const selectArchitectStats = (state) => state.architect.stats;
export const selectArchitectLoading = (state) => state.architect.loading;
export const selectArchitectUpdateLoading = (state) =>
  state.architect.updateLoading;
export const selectArchitectError = (state) => state.architect.error;
export const selectArchitectUpdateError = (state) =>
  state.architect.updateError;
export const selectArchitectUpdateSuccess = (state) =>
  state.architect.updateSuccess;
export const selectArchitectLocationUpdateLoading = (state) =>
  state.architect.locationUpdateLoading;
export const selectArchitectPaymentUpdateLoading = (state) =>
  state.architect.paymentUpdateLoading;
export const selectArchitectLastUpdated = (state) =>
  state.architect.lastUpdated;

// New selectors for enhanced functionality
export const selectArchitectDeletePortfolioLoading = (state) =>
  state.architect.deletePortfolioLoading;
export const selectArchitectDeleteAccountLoading = (state) =>
  state.architect.deleteAccountLoading;

// Computed selectors
export const selectIsArchitectDataStale = (state) => {
  const lastUpdated = state.architect.lastUpdated;
  if (!lastUpdated) return false;

  const now = new Date();
  const updated = new Date(lastUpdated);
  const diffInMinutes = (now - updated) / (1000 * 60);

  return diffInMinutes > 30; // Consider data stale after 30 minutes
};

export const selectArchitectProfileCompleteness = (state) => {
  const profile = state.architect.profile;
  if (!profile) return 0;

  const requiredFields = [
    "prenom",
    "nomDeFamille",
    "email",
    "bio",
    "experienceYears",
    "specialty",
    "patenteNumber",
    "location.city",
    "location.country",
  ];

  const optionalFields = [
    "phoneNumber",
    "companyName",
    "website",
    "profilePicture",
    "education.degree",
    "socialMedia.linkedin",
    "portfolio",
    "certifications",
  ];

  let completed = 0;
  let total = requiredFields.length + optionalFields.length;

  requiredFields.forEach((field) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      if (profile[parent] && profile[parent][child]) completed++;
    } else if (profile[field]) {
      completed++;
    }
  });

  optionalFields.forEach((field) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      if (profile[parent] && profile[parent][child]) completed++;
    } else if (profile[field]) {
      completed++;
    }
  });

  return Math.round((completed / total) * 100);
};
