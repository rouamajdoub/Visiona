// src/redux/features/serviceCategories/serviceCategoriesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base URLs
const CATEGORIES_URL = "/api/admin/service-categories";
const SUBCATEGORIES_URL = "/api/admin/service-subcategories";

// Async thunks for service categories
export const fetchCategories = createAsyncThunk(
  "serviceCategories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(CATEGORIES_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "serviceCategories/fetchCategoryById",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${CATEGORIES_URL}/${categoryId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createCategory = createAsyncThunk(
  "serviceCategories/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await axios.post(CATEGORIES_URL, categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "serviceCategories/updateCategory",
  async ({ categoryId, categoryData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${CATEGORIES_URL}/${categoryId}`,
        categoryData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "serviceCategories/deleteCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${CATEGORIES_URL}/${categoryId}`);
      return { ...response.data, deletedCategoryId: categoryId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunks for service subcategories
export const fetchSubcategories = createAsyncThunk(
  "serviceCategories/fetchSubcategories",
  async (categoryId = null, { rejectWithValue }) => {
    try {
      const url = categoryId
        ? `${SUBCATEGORIES_URL}?categoryId=${categoryId}`
        : SUBCATEGORIES_URL;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchSubcategoryById = createAsyncThunk(
  "serviceCategories/fetchSubcategoryById",
  async (subcategoryId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${SUBCATEGORIES_URL}/${subcategoryId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createSubcategory = createAsyncThunk(
  "serviceCategories/createSubcategory",
  async (subcategoryData, { rejectWithValue }) => {
    try {
      const response = await axios.post(SUBCATEGORIES_URL, subcategoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateSubcategory = createAsyncThunk(
  "serviceCategories/updateSubcategory",
  async ({ subcategoryId, subcategoryData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${SUBCATEGORIES_URL}/${subcategoryId}`,
        subcategoryData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteSubcategory = createAsyncThunk(
  "serviceCategories/deleteSubcategory",
  async (subcategoryId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${SUBCATEGORIES_URL}/${subcategoryId}`
      );
      return { ...response.data, deletedSubcategoryId: subcategoryId };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Analyze services for an architect
export const analyzeArchitectServices = createAsyncThunk(
  "serviceCategories/analyzeArchitectServices",
  async (architectId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/analysis/architects/${architectId}/analyze`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Get analysis results for an architect
export const getArchitectAnalysis = createAsyncThunk(
  "serviceCategories/getArchitectAnalysis",
  async (architectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/analysis/architects/${architectId}/analysis`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Initial state
const initialState = {
  categories: [],
  subcategories: [],
  selectedCategory: null,
  selectedSubcategory: null,
  analysis: null,
  loading: false,
  error: null,
  success: false,
  message: "",
};

// Create slice
const serviceCategoriesSlice = createSlice({
  name: "serviceCategories",
  initialState,
  reducers: {
    resetStatus(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";
    },
    clearSelectedItems(state) {
      state.selectedCategory = null;
      state.selectedSubcategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch categories";
      })

      // Fetch single category
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload.data.category;
        // Update subcategories if they were included in the response
        if (action.payload.data.subcategories) {
          state.subcategories = action.payload.data.subcategories;
        }
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch category";
      })

      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Category created successfully";
        state.categories.push(action.payload.data);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create category";
      })

      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Category updated successfully";
        const index = state.categories.findIndex(
          (cat) => cat._id === action.payload.data._id
        );
        if (index !== -1) {
          state.categories[index] = action.payload.data;
        }
        state.selectedCategory = action.payload.data;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update category";
      })

      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Category deleted successfully";
        state.categories = state.categories.filter(
          (category) => category._id !== action.payload.deletedCategoryId
        );
        if (state.selectedCategory?._id === action.payload.deletedCategoryId) {
          state.selectedCategory = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete category";
      })

      // Fetch all subcategories
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload.data;
      })
      .addCase(fetchSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch subcategories";
      })

      // Fetch single subcategory
      .addCase(fetchSubcategoryById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubcategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSubcategory = action.payload.data;
      })
      .addCase(fetchSubcategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch subcategory";
      })

      // Create subcategory
      .addCase(createSubcategory.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(createSubcategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Subcategory created successfully";
        state.subcategories.push(action.payload.data);
      })
      .addCase(createSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create subcategory";
      })

      // Update subcategory
      .addCase(updateSubcategory.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(updateSubcategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Subcategory updated successfully";
        const index = state.subcategories.findIndex(
          (subcat) => subcat._id === action.payload.data._id
        );
        if (index !== -1) {
          state.subcategories[index] = action.payload.data;
        }
        state.selectedSubcategory = action.payload.data;
      })
      .addCase(updateSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update subcategory";
      })

      // Delete subcategory
      .addCase(deleteSubcategory.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(deleteSubcategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Subcategory deleted successfully";
        state.subcategories = state.subcategories.filter(
          (subcategory) =>
            subcategory._id !== action.payload.deletedSubcategoryId
        );
        if (
          state.selectedSubcategory?._id === action.payload.deletedSubcategoryId
        ) {
          state.selectedSubcategory = null;
        }
      })
      .addCase(deleteSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete subcategory";
      })

      // Analyze architect services
      .addCase(analyzeArchitectServices.pending, (state) => {
        state.loading = true;
      })
      .addCase(analyzeArchitectServices.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload.data;
        state.success = true;
        state.message = "Service analysis completed successfully";
      })
      .addCase(analyzeArchitectServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to analyze services";
      })

      // Get architect analysis
      .addCase(getArchitectAnalysis.pending, (state) => {
        state.loading = true;
      })
      .addCase(getArchitectAnalysis.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload.data;
      })
      .addCase(getArchitectAnalysis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch analysis";
      });
  },
});

// Export actions
export const { resetStatus, clearSelectedItems } =
  serviceCategoriesSlice.actions;

// Export selectors
export const selectAllCategories = (state) =>
  state.serviceCategories.categories;
export const selectAllSubcategories = (state) =>
  state.serviceCategories.subcategories;
export const selectCategoryById = (state, categoryId) =>
  state.serviceCategories.categories.find(
    (category) => category._id === categoryId
  );
export const selectSubcategoriesByCategory = (state, categoryId) =>
  state.serviceCategories.subcategories.filter(
    (subcategory) => subcategory.parentCategory === categoryId
  );
export const selectSelectedCategory = (state) =>
  state.serviceCategories.selectedCategory;
export const selectSelectedSubcategory = (state) =>
  state.serviceCategories.selectedSubcategory;
export const selectAnalysis = (state) => state.serviceCategories.analysis;
export const selectServiceCategoriesStatus = (state) => ({
  loading: state.serviceCategories.loading,
  error: state.serviceCategories.error,
  success: state.serviceCategories.success,
  message: state.serviceCategories.message,
});

// Export reducer
export default serviceCategoriesSlice.reducer;
