import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks for API calls
export const fetchGlobalOptions = createAsyncThunk(
  "globalOptions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/global-options");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch global options"
      );
    }
  }
);

export const createGlobalOption = createAsyncThunk(
  "globalOptions/create",
  async (optionData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/global-options", optionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create global option"
      );
    }
  }
);

export const updateGlobalOption = createAsyncThunk(
  "globalOptions/update",
  async ({ id, optionData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/global-options/${id}`, optionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update global option"
      );
    }
  }
);

export const deleteGlobalOption = createAsyncThunk(
  "globalOptions/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/global-options/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete global option"
      );
    }
  }
);

const globalOptionsSlice = createSlice({
  name: "globalOptions",
  initialState: {
    options: [],
    loading: false,
    error: null,
    formLoading: false,
    formError: null,
    formSuccess: false,
  },
  reducers: {
    resetFormStatus: (state) => {
      state.formLoading = false;
      state.formError = null;
      state.formSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch global options
      .addCase(fetchGlobalOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.options = action.payload;
      })
      .addCase(fetchGlobalOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create global option
      .addCase(createGlobalOption.pending, (state) => {
        state.formLoading = true;
        state.formError = null;
        state.formSuccess = false;
      })
      .addCase(createGlobalOption.fulfilled, (state, action) => {
        state.formLoading = false;
        state.formSuccess = true;
        state.options.push(action.payload);
      })
      .addCase(createGlobalOption.rejected, (state, action) => {
        state.formLoading = false;
        state.formError = action.payload;
        state.formSuccess = false;
      })
      // Update global option
      .addCase(updateGlobalOption.pending, (state) => {
        state.formLoading = true;
        state.formError = null;
        state.formSuccess = false;
      })
      .addCase(updateGlobalOption.fulfilled, (state, action) => {
        state.formLoading = false;
        state.formSuccess = true;
        const index = state.options.findIndex(
          (option) => option._id === action.payload._id
        );
        if (index !== -1) {
          state.options[index] = action.payload;
        }
      })
      .addCase(updateGlobalOption.rejected, (state, action) => {
        state.formLoading = false;
        state.formError = action.payload;
        state.formSuccess = false;
      })
      // Delete global option
      .addCase(deleteGlobalOption.pending, (state) => {
        state.formLoading = true;
        state.formError = null;
      })
      .addCase(deleteGlobalOption.fulfilled, (state, action) => {
        state.formLoading = false;
        state.options = state.options.filter(
          (option) => option._id !== action.payload
        );
      })
      .addCase(deleteGlobalOption.rejected, (state, action) => {
        state.formLoading = false;
        state.formError = action.payload;
      });
  },
});

export const { resetFormStatus } = globalOptionsSlice.actions;
export default globalOptionsSlice.reducer;
