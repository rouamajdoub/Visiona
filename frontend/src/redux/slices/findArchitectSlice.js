import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Base URL for API calls
const API_BASE_URL = "/api/architects-List";

// Async thunks for API calls

// Get all architects with filtering and pagination
export const fetchArchitects = createAsyncThunk(
  "findArchitect/fetchArchitects",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      // Add all filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((item) => queryParams.append(key, item));
          } else {
            queryParams.append(key, value);
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch architects");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get single architect profile
export const fetchArchitectProfile = createAsyncThunk(
  "findArchitect/fetchArchitectProfile",
  async (architectId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${architectId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch architect profile");
      }

      const data = await response.json();
      return data.data.architect;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add architect to favorites
export const addArchitectToFavorites = createAsyncThunk(
  "findArchitect/addToFavorites",
  async ({ architectId, notes = "" }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await fetch(`${API_BASE_URL}/${architectId}/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add to favorites");
      }

      const data = await response.json();
      return { architectId, favorite: data.data.favorite };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Remove architect from favorites
export const removeArchitectFromFavorites = createAsyncThunk(
  "findArchitect/removeFromFavorites",
  async (architectId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await fetch(`${API_BASE_URL}/${architectId}/favorites`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove from favorites");
      }

      return architectId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get user's favorite architects
export const fetchFavoriteArchitects = createAsyncThunk(
  "findArchitect/fetchFavoriteArchitects",
  async ({ page = 1, limit = 12 } = {}, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await fetch(
        `${API_BASE_URL}/favorites/my?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch favorite architects");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Architects list
  architects: [],
  pagination: {
    current: 1,
    pages: 0,
    total: 0,
    limit: 12,
  },
  filters: {
    specializations: [],
    locations: { cities: [], governorates: [] },
    languages: [],
    projectTypes: [],
  },

  // Current architect profile
  currentArchitect: null,

  // Favorites
  favoriteArchitects: [],
  favoritePagination: {
    current: 1,
    pages: 0,
    total: 0,
    limit: 12,
  },

  // Loading states
  loading: {
    architects: false,
    profile: false,
    favorites: false,
    addingFavorite: false,
    removingFavorite: false,
  },

  // Error states
  error: {
    architects: null,
    profile: null,
    favorites: null,
    addingFavorite: null,
    removingFavorite: null,
  },

  // Search and filter state
  searchFilters: {
    page: 1,
    limit: 12,
    search: "",
    specialization: null,
    experienceYears: null,
    rating: null,
    location: "",
    priceRange: null,
    sortBy: "rating.average",
    sortOrder: "desc",
    services: [],
    languages: [],
    projectTypes: [],
  },
};

// Create slice
const findArchitectSlice = createSlice({
  name: "findArchitect",
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.error = {
        architects: null,
        profile: null,
        favorites: null,
        addingFavorite: null,
        removingFavorite: null,
      };
    },

    // Clear current architect profile
    clearCurrentArchitect: (state) => {
      state.currentArchitect = null;
      state.error.profile = null;
    },

    // Update search filters
    updateSearchFilters: (state, action) => {
      state.searchFilters = {
        ...state.searchFilters,
        ...action.payload,
      };
    },

    // Reset search filters
    resetSearchFilters: (state) => {
      state.searchFilters = initialState.searchFilters;
    },

    // Clear architects list
    clearArchitectsList: (state) => {
      state.architects = [];
      state.pagination = initialState.pagination;
      state.error.architects = null;
    },

    // Update architect favorite status in the list
    updateArchitectFavoriteStatus: (state, action) => {
      const { architectId, isFavorite } = action.payload;

      // Update in architects list
      const architectIndex = state.architects.findIndex(
        (architect) => architect._id === architectId
      );
      if (architectIndex !== -1) {
        state.architects[architectIndex].isFavorite = isFavorite;
      }

      // Update in current architect profile
      if (
        state.currentArchitect &&
        state.currentArchitect._id === architectId
      ) {
        state.currentArchitect.isFavorite = isFavorite;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch architects
      .addCase(fetchArchitects.pending, (state) => {
        state.loading.architects = true;
        state.error.architects = null;
      })
      .addCase(fetchArchitects.fulfilled, (state, action) => {
        state.loading.architects = false;
        state.architects = action.payload.architects;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
        state.error.architects = null;
      })
      .addCase(fetchArchitects.rejected, (state, action) => {
        state.loading.architects = false;
        state.error.architects = action.payload;
      })

      // Fetch architect profile
      .addCase(fetchArchitectProfile.pending, (state) => {
        state.loading.profile = true;
        state.error.profile = null;
      })
      .addCase(fetchArchitectProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.currentArchitect = action.payload;
        state.error.profile = null;
      })
      .addCase(fetchArchitectProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error.profile = action.payload;
      })

      // Add to favorites
      .addCase(addArchitectToFavorites.pending, (state) => {
        state.loading.addingFavorite = true;
        state.error.addingFavorite = null;
      })
      .addCase(addArchitectToFavorites.fulfilled, (state, action) => {
        state.loading.addingFavorite = false;
        state.error.addingFavorite = null;

        // Update favorite status in the architects list and current profile
        findArchitectSlice.caseReducers.updateArchitectFavoriteStatus(state, {
          payload: {
            architectId: action.payload.architectId,
            isFavorite: true,
          },
        });
      })
      .addCase(addArchitectToFavorites.rejected, (state, action) => {
        state.loading.addingFavorite = false;
        state.error.addingFavorite = action.payload;
      })

      // Remove from favorites
      .addCase(removeArchitectFromFavorites.pending, (state) => {
        state.loading.removingFavorite = true;
        state.error.removingFavorite = null;
      })
      .addCase(removeArchitectFromFavorites.fulfilled, (state, action) => {
        state.loading.removingFavorite = false;
        state.error.removingFavorite = null;

        // Update favorite status and remove from favorites list
        const architectId = action.payload;
        findArchitectSlice.caseReducers.updateArchitectFavoriteStatus(state, {
          payload: { architectId, isFavorite: false },
        });

        // Remove from favorites list
        state.favoriteArchitects = state.favoriteArchitects.filter(
          (fav) => fav.architect._id !== architectId
        );
      })
      .addCase(removeArchitectFromFavorites.rejected, (state, action) => {
        state.loading.removingFavorite = false;
        state.error.removingFavorite = action.payload;
      })

      // Fetch favorite architects
      .addCase(fetchFavoriteArchitects.pending, (state) => {
        state.loading.favorites = true;
        state.error.favorites = null;
      })
      .addCase(fetchFavoriteArchitects.fulfilled, (state, action) => {
        state.loading.favorites = false;
        state.favoriteArchitects = action.payload.favorites;
        state.favoritePagination = action.payload.pagination;
        state.error.favorites = null;
      })
      .addCase(fetchFavoriteArchitects.rejected, (state, action) => {
        state.loading.favorites = false;
        state.error.favorites = action.payload;
      });
  },
});

// Export actions
export const {
  clearErrors,
  clearCurrentArchitect,
  updateSearchFilters,
  resetSearchFilters,
  clearArchitectsList,
  updateArchitectFavoriteStatus,
} = findArchitectSlice.actions;

// Selectors
export const selectArchitects = (state) => state.findArchitect.architects;
export const selectArchitectsPagination = (state) =>
  state.findArchitect.pagination;
export const selectArchitectsFilters = (state) => state.findArchitect.filters;
export const selectCurrentArchitect = (state) =>
  state.findArchitect.currentArchitect;
export const selectFavoriteArchitects = (state) =>
  state.findArchitect.favoriteArchitects;
export const selectFavoritePagination = (state) =>
  state.findArchitect.favoritePagination;
export const selectSearchFilters = (state) => state.findArchitect.searchFilters;
export const selectLoadingStates = (state) => state.findArchitect.loading;
export const selectErrorStates = (state) => state.findArchitect.error;

// Export reducer
export default findArchitectSlice.reducer;
