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
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
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
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
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
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
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
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
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
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
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
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
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
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const createSubcategory = createAsyncThunk(
  "serviceCategories/createSubcategory",
  async (subcategoryData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(SUBCATEGORIES_URL, subcategoryData);

      // If we successfully create a subcategory, we should also update the selected category if it's set
      if (subcategoryData.parentCategory) {
        dispatch(fetchCategoryById(subcategoryData.parentCategory));
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const updateSubcategory = createAsyncThunk(
  "serviceCategories/updateSubcategory",
  async (
    { subcategoryId, subcategoryData },
    { rejectWithValue, getState, dispatch }
  ) => {
    try {
      const response = await axios.put(
        `${SUBCATEGORIES_URL}/${subcategoryId}`,
        subcategoryData
      );

      // If the parent category of the subcategory changed and we have a selected category,
      // we should refresh the selected category's subcategories
      const currentState = getState();
      const selectedCategory = currentState.serviceCategories.selectedCategory;

      if (selectedCategory && subcategoryData.parentCategory) {
        if (subcategoryData.parentCategory === selectedCategory._id) {
          dispatch(fetchCategoryById(selectedCategory._id));
        } else if (
          currentState.serviceCategories.selectedSubcategory?._id ===
          subcategoryId
        ) {
          // If we're updating the currently selected subcategory and changing its parent,
          // we should also update the selected category
          dispatch(fetchCategoryById(subcategoryData.parentCategory));
        }
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const deleteSubcategory = createAsyncThunk(
  "serviceCategories/deleteSubcategory",
  async (subcategoryId, { rejectWithValue, getState, dispatch }) => {
    try {
      // First, get the subcategory to know its parent category
      const currentState = getState();
      const subcategory = currentState.serviceCategories.subcategories.find(
        (sc) => sc._id === subcategoryId
      );

      const response = await axios.delete(
        `${SUBCATEGORIES_URL}/${subcategoryId}`
      );

      // If we have a selected category and the deleted subcategory belongs to it,
      // refresh the category to update its subcategories list
      const selectedCategory = currentState.serviceCategories.selectedCategory;
      if (
        selectedCategory &&
        subcategory &&
        subcategory.parentCategory === selectedCategory._id
      ) {
        dispatch(fetchCategoryById(selectedCategory._id));
      }

      return { ...response.data, deletedSubcategoryId: subcategoryId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Initial state
const initialState = {
  categories: [],
  subcategories: [],
  selectedCategory: null,
  selectedSubcategory: null,
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
    setSelectedCategory(state, action) {
      state.selectedCategory = action.payload;
    },
    setSelectedSubcategory(state, action) {
      state.selectedSubcategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
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
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload.data.category;
        // Update subcategories if they were included in the response
        if (action.payload.data.subcategories) {
          // Update existing subcategories array with new ones from this category
          const existingSubcatIds = new Set(
            state.subcategories.map((sc) => sc._id)
          );
          const newSubcats = action.payload.data.subcategories.filter(
            (sc) => !existingSubcatIds.has(sc._id)
          );

          // Replace existing subcategories for this category
          const otherSubcats = state.subcategories.filter(
            (sc) => sc.parentCategory !== action.payload.data.category._id
          );

          state.subcategories = [
            ...otherSubcats,
            ...action.payload.data.subcategories,
          ];
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
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Category created successfully";
        state.categories.push(action.payload.data);
        // Sort categories by name
        state.categories.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create category";
      })

      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
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
        // Sort categories by name
        state.categories.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update category";
      })

      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Category deleted successfully";
        state.categories = state.categories.filter(
          (category) => category._id !== action.payload.deletedCategoryId
        );
        // Also remove any subcategories that belonged to this category
        state.subcategories = state.subcategories.filter(
          (subcategory) =>
            subcategory.parentCategory !== action.payload.deletedCategoryId
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
        state.error = null;
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
        state.error = null;
      })
      .addCase(fetchSubcategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSubcategory = action.payload.data;

        // Update the subcategory in the subcategories array
        const index = state.subcategories.findIndex(
          (sc) => sc._id === action.payload.data._id
        );
        if (index !== -1) {
          state.subcategories[index] = action.payload.data;
        } else {
          state.subcategories.push(action.payload.data);
        }
      })
      .addCase(fetchSubcategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch subcategory";
      })

      // Create subcategory
      .addCase(createSubcategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createSubcategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Subcategory created successfully";

        // Add to subcategories array if not already present
        if (
          !state.subcategories.some((sc) => sc._id === action.payload.data._id)
        ) {
          state.subcategories.push(action.payload.data);
          // Sort subcategories by name
          state.subcategories.sort((a, b) => a.name.localeCompare(b.name));
        }
      })
      .addCase(createSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create subcategory";
      })

      // Update subcategory
      .addCase(updateSubcategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateSubcategory.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Subcategory updated successfully";

        // Find and update in subcategories array
        const index = state.subcategories.findIndex(
          (subcat) => subcat._id === action.payload.data._id
        );
        if (index !== -1) {
          state.subcategories[index] = action.payload.data;
        }
        state.selectedSubcategory = action.payload.data;

        // Sort subcategories by name
        state.subcategories.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(updateSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update subcategory";
      })

      // Delete subcategory
      .addCase(deleteSubcategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
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
      });
  },
});

// Export actions
export const {
  resetStatus,
  clearSelectedItems,
  setSelectedCategory,
  setSelectedSubcategory,
} = serviceCategoriesSlice.actions;

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
export const selectServiceCategoriesStatus = (state) => ({
  loading: state.serviceCategories.loading,
  error: state.serviceCategories.error,
  success: state.serviceCategories.success,
  message: state.serviceCategories.message,
});

// Export reducer
export default serviceCategoriesSlice.reducer;
