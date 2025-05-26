// store/tokenSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  token: localStorage.getItem("token") || null,
  isValidating: false,
  isValid: null,
  lastValidated: null,
  error: null,
};

// Validate current token
export const validateToken = createAsyncThunk(
  "token/validate",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().token;

      if (!token) {
        return rejectWithValue("No token to validate");
      }

      const response = await axios.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        isValid: true,
        user: response.data.user,
        timestamp: Date.now(),
      };
    } catch (error) {
      localStorage.removeItem("token");
      return rejectWithValue("Token validation failed");
    }
  }
);

// Refresh token (if your backend supports token refresh)
export const refreshToken = createAsyncThunk(
  "token/refresh",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().token;

      const response = await axios.post(
        "/api/auth/refresh",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newToken = response.data.token;
      localStorage.setItem("token", newToken);

      return {
        token: newToken,
        timestamp: Date.now(),
      };
    } catch (error) {
      localStorage.removeItem("token");
      return rejectWithValue("Token refresh failed");
    }
  }
);

const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isValid = action.payload ? true : null;
      state.error = null;

      if (action.payload) {
        localStorage.setItem("token", action.payload);
        // Set up axios interceptor
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${action.payload}`;
      } else {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      }
    },
    clearToken: (state) => {
      state.token = null;
      state.isValid = null;
      state.error = null;
      state.lastValidated = null;
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    },
    markTokenInvalid: (state) => {
      state.isValid = false;
      state.error = "Token is invalid";
    },
  },
  extraReducers: (builder) => {
    builder
      // Validate token
      .addCase(validateToken.pending, (state) => {
        state.isValidating = true;
        state.error = null;
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.isValidating = false;
        state.isValid = action.payload.isValid;
        state.lastValidated = action.payload.timestamp;
        state.error = null;
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.isValidating = false;
        state.isValid = false;
        state.token = null;
        state.error = action.payload;
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      })

      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isValid = true;
        state.lastValidated = action.payload.timestamp;
        state.error = null;
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${action.payload.token}`;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.token = null;
        state.isValid = false;
        state.error = action.payload;
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      });
  },
});

export const { setToken, clearToken, markTokenInvalid } = tokenSlice.actions;

// Selectors
export const selectToken = (state) => state.token.token;
export const selectIsTokenValid = (state) => state.token.isValid;
export const selectIsValidatingToken = (state) => state.token.isValidating;
export const selectTokenError = (state) => state.token.error;
export const selectLastValidated = (state) => state.token.lastValidated;

export default tokenSlice.reducer;
