import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.baseURL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: false,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  authMethod: null, // 'local' | 'google' | 'auth0'
  error: null,
  architectStatus: null, // 'pending' | 'approved' | 'rejected'
  isLoading: false,
  isFirstLogin: false,
  // Global options for dropdown options
  globalOptions: {
    certifications: [],
    softwareProficiency: [],
    status: "idle",
    error: null,
  },
  serviceCategories: {
    data: [],
    status: "idle",
    error: null,
  },
};

// Interceptor to add token to requests
const setupAuthInterceptor = (token) => {
  axios.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// Register new user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      // We expect userData to be a FormData object that contains all fields
      // including any files that need to be uploaded
      const response = await axios.post("/api/auth/register", userData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Registration failed"
      );
    }
  }
);

// Fetch global options
export const fetchGlobalOptions = createAsyncThunk(
  "auth/fetchGlobalOptions",
  async (type, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/global-options?type=${type}`);
      return { type, data: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || `Failed to fetch ${type}`
      );
    }
  }
);

// Fetch service categories
export const fetchServiceCategories = createAsyncThunk(
  "auth/fetchServiceCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admin/service-categories");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch service categories"
      );
    }
  }
);

// Regular login
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token, user, isFirstLogin } = response.data;

      localStorage.setItem("token", token);
      setupAuthInterceptor(token);

      // Additional verification for architects
      if (user.role === "architect" && user.status !== "approved") {
        dispatch(fetchUserProfile(user._id));
      }

      return { token, user, isFirstLogin };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Login failed");
    }
  }
);

// Google OAuth token verification
export const verifyGoogleToken = createAsyncThunk(
  "auth/verifyGoogleToken",
  async ({ token, userId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.get(
        `/api/auth/google/success?token=${token}&userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If verification successful, save token and set up interceptor
      if (response.data.success) {
        localStorage.setItem("token", token);
        setupAuthInterceptor(token);

        // Additional verification for architects
        if (
          response.data.user.role === "architect" &&
          response.data.user.status !== "approved"
        ) {
          dispatch(fetchUserProfile(response.data.user._id));
        }

        return {
          token,
          user: response.data.user,
          isFirstLogin: response.data.isFirstLogin,
        };
      } else {
        return rejectWithValue("Google authentication failed");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Google authentication failed"
      );
    }
  }
);

// Set credentials directly (used by OAuth callback)
export const setCredentials = createAsyncThunk(
  "auth/setCredentials",
  async ({ token, user, isFirstLogin }, { dispatch }) => {
    localStorage.setItem("token", token);
    setupAuthInterceptor(token);

    // Additional verification for architects
    if (user.role === "architect" && user.status !== "approved") {
      dispatch(fetchUserProfile(user._id));
    }

    return { token, user, isFirstLogin };
  }
);

// Logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post("/api/auth/logout");
      localStorage.removeItem("token");
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Logout failed");
    }
  }
);

// Check authentication status
export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { isAuthenticated: false, user: null };
      }

      const response = await axios.get("/api/auth/check", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      localStorage.removeItem("token");
      return { isAuthenticated: false, user: null };
    }
  }
);

// Fetch user profile
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/auth/profile/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch profile"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = "idle";
      state.error = null;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearFirstLoginFlag: (state) => {
      state.isFirstLogin = false;
    },
  },
  extraReducers(builder) {
    const handlePendingState = (state) => {
      state.status = "loading";
      state.isLoading = true;
      state.error = null;
    };

    const handleRejectedState = (state, action) => {
      state.status = "failed";
      state.isLoading = false;
      state.error = action.payload || "An error occurred";
    };

    builder
      // Register user
      .addCase(registerUser.pending, handlePendingState)
      .addCase(registerUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, handleRejectedState)

      // Login user
      .addCase(loginUser.pending, handlePendingState)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.authMethod = "local";
        state.isLoading = false;
        state.error = null;
        state.isFirstLogin = action.payload.isFirstLogin || false;
        state.architectStatus =
          action.payload.user.role === "architect"
            ? action.payload.user.status
            : null;
      })
      .addCase(loginUser.rejected, handleRejectedState)

      // Verify Google token
      .addCase(verifyGoogleToken.pending, handlePendingState)
      .addCase(verifyGoogleToken.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.authMethod = "google";
        state.isLoading = false;
        state.error = null;
        state.isFirstLogin = action.payload.isFirstLogin || false;
        state.architectStatus =
          action.payload.user.role === "architect"
            ? action.payload.user.status
            : null;
      })
      .addCase(verifyGoogleToken.rejected, handleRejectedState)

      // Set credentials directly (for OAuth)
      .addCase(setCredentials.pending, handlePendingState)
      .addCase(setCredentials.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.authMethod = "google"; // Assuming this is only used for OAuth
        state.isLoading = false;
        state.error = null;
        state.isFirstLogin = action.payload.isFirstLogin || false;
        state.architectStatus =
          action.payload.user.role === "architect"
            ? action.payload.user.status
            : null;
      })
      .addCase(setCredentials.rejected, handleRejectedState)

      // Logout user
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.authMethod = null;
        state.status = "idle";
        state.error = null;
        state.architectStatus = null;
        state.isFirstLogin = false;
      })

      // Check auth status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user || null;
        state.authMethod = action.payload.authMethod;

        if (action.payload.user?.role === "architect") {
          state.architectStatus = action.payload.user.status;
        }
      })

      // Fetch user profile
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        if (action.payload.role === "architect") {
          state.architectStatus = action.payload.status;
        }
      })

      // Global options
      .addCase(fetchGlobalOptions.pending, (state) => {
        state.globalOptions.status = "loading";
        state.globalOptions.error = null;
      })
      .addCase(fetchGlobalOptions.fulfilled, (state, action) => {
        // Update the appropriate options array based on the type
        if (action.payload.type === "certification") {
          state.globalOptions.certifications = action.payload.data;
        } else if (action.payload.type === "software") {
          state.globalOptions.softwareProficiency = action.payload.data;
        }
        state.globalOptions.status = "succeeded";
      })
      .addCase(fetchGlobalOptions.rejected, (state, action) => {
        state.globalOptions.status = "failed";
        state.globalOptions.error = action.payload;
      })

      // Service categories
      .addCase(fetchServiceCategories.pending, (state) => {
        state.serviceCategories.status = "loading";
        state.serviceCategories.error = null;
      })
      .addCase(fetchServiceCategories.fulfilled, (state, action) => {
        state.serviceCategories.data = action.payload;
        state.serviceCategories.status = "succeeded";
      })
      .addCase(fetchServiceCategories.rejected, (state, action) => {
        state.serviceCategories.status = "failed";
        state.serviceCategories.error = action.payload;
      });
  },
});

export const { resetStatus, clearError, clearFirstLoginFlag } =
  authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectArchitectStatus = (state) => state.auth.architectStatus;
export const selectAuthMethod = (state) => state.auth.authMethod;
export const selectSubscriptionStatus = (state) =>
  state.auth.user?.subscription?.status;
export const selectIsFirstLogin = (state) => state.auth.isFirstLogin;

// New selectors for dropdown options
export const selectCertifications = (state) =>
  state.auth.globalOptions.certifications;
export const selectSoftwareProficiency = (state) =>
  state.auth.globalOptions.softwareProficiency;
export const selectServiceCategories = (state) =>
  state.auth.serviceCategories.data;
export const selectGlobalOptionsStatus = (state) =>
  state.auth.globalOptions.status;
export const selectServiceCategoriesStatus = (state) =>
  state.auth.serviceCategories.status;

export default authSlice.reducer;
