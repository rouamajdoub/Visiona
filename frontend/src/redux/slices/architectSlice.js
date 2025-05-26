import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// API base URL - adjust according to your setup
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper function to get auth headers
const getAuthHeaders = (getState) => {
  const token = getState().auth?.token;
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

// Helper function for FormData requests
const getAuthHeadersForFormData = (getState) => {
  const token = getState().auth?.token;
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      // Don't set Content-Type for FormData, let browser set it
    },
  };
};

// ======================= PUBLIC ACTIONS (For Clients) =======================

// Get all architects with filtering
export const fetchArchitects = createAsyncThunk(
  "architect/fetchArchitects",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();

      // Add all filter parameters
      Object.keys(filters).forEach((key) => {
        if (
          filters[key] !== undefined &&
          filters[key] !== null &&
          filters[key] !== ""
        ) {
          if (Array.isArray(filters[key])) {
            filters[key].forEach((value) => queryParams.append(key, value));
          } else {
            queryParams.append(key, filters[key]);
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}/architects?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la récupération des architectes"
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get public architect profile by ID
export const fetchArchitectProfile = createAsyncThunk(
  "architect/fetchArchitectProfile",
  async (architectId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/architects/${architectId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la récupération du profil"
        );
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ======================= ARCHITECT ACTIONS (For Architects) =======================

// Get architect's own profile
export const fetchMyProfile = createAsyncThunk(
  "architect/fetchMyProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/architects/profile/me`,
        getAuthHeaders(getState)
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la récupération du profil"
        );
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update architect profile
export const updateMyProfile = createAsyncThunk(
  "architect/updateMyProfile",
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Handle regular fields - parse JSON strings for arrays/objects
      Object.keys(profileData).forEach((key) => {
        if (
          key !== "files" &&
          profileData[key] !== undefined &&
          profileData[key] !== null
        ) {
          if (
            typeof profileData[key] === "object" &&
            !Array.isArray(profileData[key])
          ) {
            formData.append(key, JSON.stringify(profileData[key]));
          } else if (Array.isArray(profileData[key])) {
            formData.append(key, JSON.stringify(profileData[key]));
          } else {
            formData.append(key, profileData[key]);
          }
        }
      });

      // Handle file uploads
      if (profileData.files) {
        Object.keys(profileData.files).forEach((fieldName) => {
          const files = profileData.files[fieldName];
          if (Array.isArray(files)) {
            files.forEach((file) => {
              formData.append(fieldName, file);
            });
          } else if (files) {
            formData.append(fieldName, files);
          }
        });
      }

      const response = await fetch(
        `${API_BASE_URL}/architects/profile/update`,
        {
          method: "PUT",
          ...getAuthHeadersForFormData(getState),
          body: formData,
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la mise à jour du profil"
        );
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Remove portfolio image
export const removePortfolioImage = createAsyncThunk(
  "architect/removePortfolioImage",
  async (imageIndex, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/architects/profile/portfolio/${imageIndex}`,
        {
          method: "DELETE",
          ...getAuthHeaders(getState),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la suppression de l'image"
        );
      }

      return { imageIndex: parseInt(imageIndex), portfolio: data.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Remove certification file
export const removeCertification = createAsyncThunk(
  "architect/removeCertification",
  async (certIndex, { getState, rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/architects/profile/certification/${certIndex}`,
        {
          method: "DELETE",
          ...getAuthHeaders(getState),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la suppression de la certification"
        );
      }

      return { certIndex: parseInt(certIndex), certifications: data.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ======================= OPTIONS ACTIONS =======================

// Get service categories and subcategories
export const fetchServiceOptions = createAsyncThunk(
  "architect/fetchServiceOptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/architects/options/services`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la récupération des options de service"
        );
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get global options (certifications and software)
export const fetchGlobalOptions = createAsyncThunk(
  "architect/fetchGlobalOptions",
  async (type = null, { rejectWithValue }) => {
    try {
      const url = type
        ? `${API_BASE_URL}/architects/options/global?type=${type}`
        : `${API_BASE_URL}/architects/options/global`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la récupération des options globales"
        );
      }

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ======================= SLICE DEFINITION =======================

const initialState = {
  // For clients browsing architects
  architects: [],
  selectedArchitect: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    limit: 12,
  },
  filters: {
    page: 1,
    limit: 12,
    location: "",
    specialization: [],
    specialty: "",
    minBudget: "",
    maxBudget: "",
    rating: "",
    experienceYears: "",
    certification: "",
    services: [],
    sortBy: "createdAt",
    sortOrder: "desc",
    search: "",
  },

  // For architect's own profile
  myProfile: null,
  profileUpdateStatus: "idle", // idle, pending, succeeded, failed

  // Options and metadata
  serviceOptions: {
    categories: [],
    subcategories: [],
  },
  globalOptions: {
    certifications: [],
    software: [],
  },

  // Loading states
  loading: {
    architects: false,
    selectedArchitect: false,
    myProfile: false,
    serviceOptions: false,
    globalOptions: false,
    removingImage: false,
    removingCert: false,
  },

  // Error states
  errors: {
    architects: null,
    selectedArchitect: null,
    myProfile: null,
    profileUpdate: null,
    serviceOptions: null,
    globalOptions: null,
    removeImage: null,
    removeCert: null,
  },
};

const architectSlice = createSlice({
  name: "architect",
  initialState,
  reducers: {
    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentPage: (state, action) => {
      state.filters.page = action.payload;
    },

    // Clear selected architect
    clearSelectedArchitect: (state) => {
      state.selectedArchitect = null;
      state.errors.selectedArchitect = null;
    },

    // Clear errors
    clearErrors: (state, action) => {
      if (action.payload) {
        state.errors[action.payload] = null;
      } else {
        Object.keys(state.errors).forEach((key) => {
          state.errors[key] = null;
        });
      }
    },

    // Reset profile update status
    resetProfileUpdateStatus: (state) => {
      state.profileUpdateStatus = "idle";
      state.errors.profileUpdate = null;
    },
  },
  extraReducers: (builder) => {
    // ======================= FETCH ARCHITECTS =======================
    builder
      .addCase(fetchArchitects.pending, (state) => {
        state.loading.architects = true;
        state.errors.architects = null;
      })
      .addCase(fetchArchitects.fulfilled, (state, action) => {
        state.loading.architects = false;
        state.architects = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchArchitects.rejected, (state, action) => {
        state.loading.architects = false;
        state.errors.architects = action.payload;
      })

      // ======================= FETCH ARCHITECT PROFILE =======================
      .addCase(fetchArchitectProfile.pending, (state) => {
        state.loading.selectedArchitect = true;
        state.errors.selectedArchitect = null;
      })
      .addCase(fetchArchitectProfile.fulfilled, (state, action) => {
        state.loading.selectedArchitect = false;
        state.selectedArchitect = action.payload;
      })
      .addCase(fetchArchitectProfile.rejected, (state, action) => {
        state.loading.selectedArchitect = false;
        state.errors.selectedArchitect = action.payload;
      })

      // ======================= FETCH MY PROFILE =======================
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading.myProfile = true;
        state.errors.myProfile = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading.myProfile = false;
        state.myProfile = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading.myProfile = false;
        state.errors.myProfile = action.payload;
      })

      // ======================= UPDATE MY PROFILE =======================
      .addCase(updateMyProfile.pending, (state) => {
        state.profileUpdateStatus = "pending";
        state.errors.profileUpdate = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.profileUpdateStatus = "succeeded";
        state.myProfile = action.payload;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.profileUpdateStatus = "failed";
        state.errors.profileUpdate = action.payload;
      })

      // ======================= REMOVE PORTFOLIO IMAGE =======================
      .addCase(removePortfolioImage.pending, (state) => {
        state.loading.removingImage = true;
        state.errors.removeImage = null;
      })
      .addCase(removePortfolioImage.fulfilled, (state, action) => {
        state.loading.removingImage = false;
        if (state.myProfile) {
          state.myProfile.portfolio = action.payload.portfolio;
        }
      })
      .addCase(removePortfolioImage.rejected, (state, action) => {
        state.loading.removingImage = false;
        state.errors.removeImage = action.payload;
      })

      // ======================= REMOVE CERTIFICATION =======================
      .addCase(removeCertification.pending, (state) => {
        state.loading.removingCert = true;
        state.errors.removeCert = null;
      })
      .addCase(removeCertification.fulfilled, (state, action) => {
        state.loading.removingCert = false;
        if (state.myProfile) {
          state.myProfile.certifications = action.payload.certifications;
        }
      })
      .addCase(removeCertification.rejected, (state, action) => {
        state.loading.removingCert = false;
        state.errors.removeCert = action.payload;
      })

      // ======================= FETCH SERVICE OPTIONS =======================
      .addCase(fetchServiceOptions.pending, (state) => {
        state.loading.serviceOptions = true;
        state.errors.serviceOptions = null;
      })
      .addCase(fetchServiceOptions.fulfilled, (state, action) => {
        state.loading.serviceOptions = false;
        state.serviceOptions = action.payload;
      })
      .addCase(fetchServiceOptions.rejected, (state, action) => {
        state.loading.serviceOptions = false;
        state.errors.serviceOptions = action.payload;
      })

      // ======================= FETCH GLOBAL OPTIONS =======================
      .addCase(fetchGlobalOptions.pending, (state) => {
        state.loading.globalOptions = true;
        state.errors.globalOptions = null;
      })
      .addCase(fetchGlobalOptions.fulfilled, (state, action) => {
        state.loading.globalOptions = false;
        state.globalOptions = action.payload;
      })
      .addCase(fetchGlobalOptions.rejected, (state, action) => {
        state.loading.globalOptions = false;
        state.errors.globalOptions = action.payload;
      });
  },
});

// Export actions
export const {
  setFilters,
  resetFilters,
  setCurrentPage,
  clearSelectedArchitect,
  clearErrors,
  resetProfileUpdateStatus,
} = architectSlice.actions;

// Export selectors
export const selectArchitects = (state) => state.architect.architects;
export const selectSelectedArchitect = (state) =>
  state.architect.selectedArchitect;
export const selectMyProfile = (state) => state.architect.myProfile;
export const selectPagination = (state) => state.architect.pagination;
export const selectFilters = (state) => state.architect.filters;
export const selectServiceOptions = (state) => state.architect.serviceOptions;
export const selectGlobalOptions = (state) => state.architect.globalOptions;
export const selectLoading = (state) => state.architect.loading;
export const selectErrors = (state) => state.architect.errors;
export const selectProfileUpdateStatus = (state) =>
  state.architect.profileUpdateStatus;

// Complex selectors
export const selectFilteredSubcategories = (selectedCategoryId) => (state) => {
  if (!selectedCategoryId) return [];
  return state.architect.serviceOptions.subcategories.filter(
    (sub) => sub.parentCategory._id === selectedCategoryId
  );
};

export const selectIsLoading = (state) => {
  const loading = state.architect.loading;
  return Object.values(loading).some((isLoading) => isLoading);
};

export const selectHasErrors = (state) => {
  const errors = state.architect.errors;
  return Object.values(errors).some((error) => error !== null);
};

// Export reducer
export default architectSlice.reducer;
