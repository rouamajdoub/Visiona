// features/quotes/quotesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks
export const fetchQuotes = createAsyncThunk(
  "quotes/fetchQuotes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/quotes", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchQuoteById = createAsyncThunk(
  "quotes/fetchQuoteById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/quotes/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createQuote = createAsyncThunk(
  "quotes/createQuote",
  async (quoteData, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/quotes", quoteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateQuote = createAsyncThunk(
  "quotes/updateQuote",
  async ({ id, quoteData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/quotes/${id}`, quoteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteQuote = createAsyncThunk(
  "quotes/deleteQuote",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/quotes/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const convertToInvoice = createAsyncThunk(
  "quotes/convertToInvoice",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `/api/quotes/${id}/convert-to-invoice`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const generatePDF = createAsyncThunk(
  "quotes/generatePDF",
  async (id, { rejectWithValue }) => {
    try {
      // This will trigger a file download from the browser
      window.open(`/api/quotes/${id}/pdf`, "_blank");
      return { id };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  quotes: [],
  currentQuote: null,
  loading: false,
  error: null,
  success: false,
  message: "",
  filters: {
    status: "",
    client: "",
    project: "",
    search: "",
  },
};

const quotesSlice = createSlice({
  name: "quotes",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = "";
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        status: "",
        client: "",
        project: "",
        search: "",
      };
    },
    clearCurrentQuote: (state) => {
      state.currentQuote = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchQuotes
      .addCase(fetchQuotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.loading = false;
        state.quotes = action.payload.data;
        state.error = null;
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch quotes";
      })

      // fetchQuoteById
      .addCase(fetchQuoteById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuoteById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuote = action.payload.data;
        state.error = null;
      })
      .addCase(fetchQuoteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch quote";
      })

      // createQuote
      .addCase(createQuote.pending, (state) => {
        state.loading = true;
      })
      .addCase(createQuote.fulfilled, (state, action) => {
        state.loading = false;
        state.quotes.push(action.payload.data);
        state.currentQuote = action.payload.data;
        state.success = true;
        state.message = "Quote created successfully";
        state.error = null;
      })
      .addCase(createQuote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create quote";
      })

      // updateQuote
      .addCase(updateQuote.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateQuote.fulfilled, (state, action) => {
        state.loading = false;
        state.quotes = state.quotes.map((quote) =>
          quote._id === action.payload.data._id ? action.payload.data : quote
        );
        state.currentQuote = action.payload.data;
        state.success = true;
        state.message = "Quote updated successfully";
        state.error = null;
      })
      .addCase(updateQuote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update quote";
      })

      // deleteQuote
      .addCase(deleteQuote.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteQuote.fulfilled, (state, action) => {
        state.loading = false;
        state.quotes = state.quotes.filter(
          (quote) => quote._id !== action.payload.id
        );
        state.success = true;
        state.message = "Quote deleted successfully";
        state.error = null;
      })
      .addCase(deleteQuote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete quote";
      })

      // convertToInvoice
      .addCase(convertToInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(convertToInvoice.fulfilled, (state, action) => {
        state.loading = false;
        // Update quote status to accepted and mark as converted
        state.quotes = state.quotes.map((quote) => {
          if (quote._id === state.currentQuote._id) {
            return {
              ...quote,
              status: "accepted",
              convertedToInvoice: action.payload.data._id,
            };
          }
          return quote;
        });
        state.success = true;
        state.message = "Quote converted to invoice successfully";
        state.error = null;
      })
      .addCase(convertToInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to convert quote to invoice";
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setFilters,
  resetFilters,
  clearCurrentQuote,
} = quotesSlice.actions;

export default quotesSlice.reducer;
