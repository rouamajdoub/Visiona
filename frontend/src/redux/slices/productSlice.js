import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api/prod";

// Async thunks for API calls
export const getProducts = createAsyncThunk(
  "products/getProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(
        `${API_URL}/marketplace/products?${queryString}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch products"
      );
    }
  }
);

export const getProduct = createAsyncThunk(
  "products/getProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/marketplace/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch product"
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `${API_URL}/marketplace/products`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to create product"
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, formData }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(
        `${API_URL}/marketplace/products/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update product"
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      await axios.delete(`${API_URL}/marketplace/products/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete product"
      );
    }
  }
);

export const deleteProductImage = createAsyncThunk(
  "products/deleteProductImage",
  async ({ productId, imageIndex }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.delete(
        `${API_URL}/marketplace/products/${productId}/images/${imageIndex}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to delete image"
      );
    }
  }
);

export const toggleProductPublishStatus = createAsyncThunk(
  "products/toggleProductPublishStatus",
  async (id, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.patch(
        `${API_URL}/marketplace/products/${id}/toggle-publish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to toggle publish status"
      );
    }
  }
);

export const getProductStats = createAsyncThunk(
  "products/getProductStats",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(
        `${API_URL}/marketplace/products/stats`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch product stats"
      );
    }
  }
);

export const getProductReviews = createAsyncThunk(
  "products/getProductReviews",
  async ({ productId, params = {} }, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(
        `${API_URL}/marketplace/products/${productId}/reviews?${queryString}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch reviews"
      );
    }
  }
);

export const markReviewHelpful = createAsyncThunk(
  "products/markReviewHelpful",
  async (reviewId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `${API_URL}/marketplace/products/reviews/${reviewId}/helpful`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      return { reviewId, ...response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to mark review as helpful"
      );
    }
  }
);

const initialState = {
  products: [],
  product: null,
  stats: null,
  reviews: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
  reviewsPagination: {
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  },
  filters: {
    category: "",
    seller: "",
    minPrice: "",
    maxPrice: "",
    type: "",
    availability: "",
    tags: "",
    search: "",
    sort: "newest",
  },
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProduct: (state) => {
      state.product = null;
    },
    clearProducts: (state) => {
      state.products = [];
      state.pagination = initialState.pagination;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearReviews: (state) => {
      state.reviews = [];
      state.reviewsPagination = initialState.reviewsPagination;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Products
      .addCase(getProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Product
      .addCase(getProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload.data;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload.data);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload.data;

        // Update product in products array
        const index = state.products.findIndex(
          (p) => p._id === updatedProduct._id
        );
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }

        // Update current product if it's the same
        if (state.product?._id === updatedProduct._id) {
          state.product = updatedProduct;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p._id !== action.payload);
        if (state.product?._id === action.payload) {
          state.product = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Product Image
      .addCase(deleteProductImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductImage.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload.data;

        // Update product in products array
        const index = state.products.findIndex(
          (p) => p._id === updatedProduct._id
        );
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }

        // Update current product if it's the same
        if (state.product?._id === updatedProduct._id) {
          state.product = updatedProduct;
        }
      })
      .addCase(deleteProductImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Product Publish Status
      .addCase(toggleProductPublishStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleProductPublishStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, isPublished } = action.payload.data;

        // Update product in products array
        const index = state.products.findIndex((p) => p._id === id);
        if (index !== -1) {
          state.products[index].isPublished = isPublished;
        }

        // Update current product if it's the same
        if (state.product?._id === id) {
          state.product.isPublished = isPublished;
        }
      })
      .addCase(toggleProductPublishStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Product Stats
      .addCase(getProductStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(getProductStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Product Reviews
      .addCase(getProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data;
        state.reviewsPagination = action.payload.pagination;
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark Review Helpful
      .addCase(markReviewHelpful.pending, (state) => {
        state.error = null;
      })
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        const { reviewId, data } = action.payload;
        const reviewIndex = state.reviews.findIndex((r) => r._id === reviewId);
        if (reviewIndex !== -1) {
          state.reviews[reviewIndex].helpfulVotes = data.helpfulVotes;
        }
      })
      .addCase(markReviewHelpful.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearProduct,
  clearProducts,
  setFilters,
  clearFilters,
  clearReviews,
} = productSlice.actions;

export default productSlice.reducer;
