import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Thunks for Categories
export const fetchCategories = createAsyncThunk(
  "marketplace/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/marketplace/categories");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch categories"
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "marketplace/createCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/marketplace/categories", categoryData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to create category"
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "marketplace/updateCategory",
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `/api/marketplace/categories/${id}`,
        categoryData
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to update category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "marketplace/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/marketplace/categories/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete category"
      );
    }
  }
);

// Thunks for Products
export const fetchProducts = createAsyncThunk(
  "marketplace/fetchProducts",
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(queryParams).toString();
      const res = await axios.get(`/api/marketplace/products?${queryString}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch products"
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "marketplace/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/marketplace/products/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch product"
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  "marketplace/createProduct",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/marketplace/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to create product"
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  "marketplace/updateProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/marketplace/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to update product"
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "marketplace/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/marketplace/products/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete product"
      );
    }
  }
);

export const deleteProductImage = createAsyncThunk(
  "marketplace/deleteProductImage",
  async ({ productId, imageIndex }, { rejectWithValue }) => {
    try {
      const res = await axios.delete(
        `/api/marketplace/products/${productId}/images/${imageIndex}`
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete product image"
      );
    }
  }
);

// Thunks for Orders
export const fetchOrders = createAsyncThunk(
  "marketplace/fetchOrders",
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(queryParams).toString();
      const res = await axios.get(`/api/marketplace/orders?${queryString}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch orders"
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "marketplace/fetchOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/marketplace/orders/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch order"
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "marketplace/updateOrderStatus",
  async ({ id, statusData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/marketplace/orders/${id}`, statusData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to update order status"
      );
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "marketplace/cancelOrder",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/marketplace/orders/${id}/cancel`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to cancel order"
      );
    }
  }
);

// Thunks for Reviews
export const fetchProductReviews = createAsyncThunk(
  "marketplace/fetchProductReviews",
  async ({ productId, queryParams = {} }, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(queryParams).toString();
      const res = await axios.get(
        `/api/marketplace/products/${productId}/reviews?${queryString}`
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch product reviews"
      );
    }
  }
);

export const createProductReview = createAsyncThunk(
  "marketplace/createProductReview",
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/api/marketplace/products/${productId}/reviews`,
        reviewData
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to create product review"
      );
    }
  }
);

export const markReviewHelpful = createAsyncThunk(
  "marketplace/markReviewHelpful",
  async (reviewId, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `/api/marketplace/reviews/${reviewId}/helpful`
      );
      return { reviewId, data: res.data.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to mark review as helpful"
      );
    }
  }
);

// Thunk for getting architect stats
export const fetchArchitectStats = createAsyncThunk(
  "marketplace/fetchArchitectStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/marketplace/architect/stats");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch stats"
      );
    }
  }
);

const initialState = {
  categories: {
    list: [],
    loading: false,
    error: null,
    currentCategory: null,
  },
  products: {
    list: [],
    pagination: {
      total: 0,
      pages: 1,
      page: 1,
      limit: 10,
    },
    loading: false,
    error: null,
    currentProduct: null,
  },
  orders: {
    list: [],
    pagination: {
      total: 0,
      pages: 1,
      page: 1,
      limit: 10,
    },
    loading: false,
    error: null,
    currentOrder: null,
  },
  reviews: {
    list: [],
    pagination: {
      total: 0,
      pages: 1,
      page: 1,
      limit: 10,
    },
    loading: false,
    error: null,
  },
  stats: {
    data: null,
    loading: false,
    error: null,
  },
};

const marketplaceSlice = createSlice({
  name: "marketplace",
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.categories.error = null;
    },
    clearProductError: (state) => {
      state.products.error = null;
    },
    clearOrderError: (state) => {
      state.orders.error = null;
    },
    clearReviewError: (state) => {
      state.reviews.error = null;
    },
    resetCurrentProduct: (state) => {
      state.products.currentProduct = null;
    },
    resetCurrentCategory: (state) => {
      state.categories.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    // Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.categories.loading = true;
        state.categories.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories.loading = false;
        state.categories.list = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categories.loading = false;
        state.categories.error = action.payload;
      })
      .addCase(createCategory.pending, (state) => {
        state.categories.loading = true;
        state.categories.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.loading = false;
        state.categories.list.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.categories.loading = false;
        state.categories.error = action.payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.categories.loading = true;
        state.categories.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.categories.loading = false;
        const index = state.categories.list.findIndex(
          (cat) => cat._id === action.payload._id
        );
        if (index !== -1) {
          state.categories.list[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.categories.loading = false;
        state.categories.error = action.payload;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.categories.loading = true;
        state.categories.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories.loading = false;
        state.categories.list = state.categories.list.filter(
          (cat) => cat._id !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.categories.loading = false;
        state.categories.error = action.payload;
      })

      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.products.loading = true;
        state.products.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products.loading = false;
        state.products.list = action.payload.data;
        state.products.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.products.loading = false;
        state.products.error = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.products.loading = true;
        state.products.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.products.loading = false;
        state.products.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.products.loading = false;
        state.products.error = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.products.loading = true;
        state.products.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.loading = false;
        state.products.list.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.products.loading = false;
        state.products.error = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.products.loading = true;
        state.products.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.products.loading = false;
        const index = state.products.list.findIndex(
          (product) => product._id === action.payload._id
        );
        if (index !== -1) {
          state.products.list[index] = action.payload;
        }
        if (state.products.currentProduct?._id === action.payload._id) {
          state.products.currentProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.products.loading = false;
        state.products.error = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.products.loading = true;
        state.products.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products.loading = false;
        state.products.list = state.products.list.filter(
          (product) => product._id !== action.payload
        );
        if (state.products.currentProduct?._id === action.payload) {
          state.products.currentProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.products.loading = false;
        state.products.error = action.payload;
      })
      .addCase(deleteProductImage.fulfilled, (state, action) => {
        state.products.loading = false;
        const updatedProduct = action.payload;

        // Update in list
        const index = state.products.list.findIndex(
          (product) => product._id === updatedProduct._id
        );
        if (index !== -1) {
          state.products.list[index] = updatedProduct;
        }

        // Update current product if it's the same one
        if (state.products.currentProduct?._id === updatedProduct._id) {
          state.products.currentProduct = updatedProduct;
        }
      })

      // Orders
      .addCase(fetchOrders.pending, (state) => {
        state.orders.loading = true;
        state.orders.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders.loading = false;
        state.orders.list = action.payload.data;
        state.orders.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.orders.loading = false;
        state.orders.error = action.payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.orders.loading = true;
        state.orders.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.orders.loading = false;
        state.orders.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.orders.loading = false;
        state.orders.error = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.orders.loading = false;
        const updatedOrder = action.payload;

        // Update in list
        const index = state.orders.list.findIndex(
          (order) => order._id === updatedOrder._id
        );
        if (index !== -1) {
          state.orders.list[index] = updatedOrder;
        }

        // Update current order if it's the same one
        if (state.orders.currentOrder?._id === updatedOrder._id) {
          state.orders.currentOrder = updatedOrder;
        }
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.orders.loading = false;
        const updatedOrder = action.payload;

        // Update in list
        const index = state.orders.list.findIndex(
          (order) => order._id === updatedOrder._id
        );
        if (index !== -1) {
          state.orders.list[index] = updatedOrder;
        }

        // Update current order if it's the same one
        if (state.orders.currentOrder?._id === updatedOrder._id) {
          state.orders.currentOrder = updatedOrder;
        }
      })

      // Reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.reviews.loading = true;
        state.reviews.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.reviews.loading = false;
        state.reviews.list = action.payload.data;
        state.reviews.pagination = action.payload.pagination;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.reviews.loading = false;
        state.reviews.error = action.payload;
      })
      .addCase(createProductReview.pending, (state) => {
        state.reviews.loading = true;
        state.reviews.error = null;
      })
      .addCase(createProductReview.fulfilled, (state, action) => {
        state.reviews.loading = false;
        state.reviews.list.unshift(action.payload);
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.reviews.loading = false;
        state.reviews.error = action.payload;
      })
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        const { reviewId, data } = action.payload;
        const reviewIndex = state.reviews.list.findIndex(
          (review) => review._id === reviewId
        );
        if (reviewIndex !== -1) {
          state.reviews.list[reviewIndex].helpfulVotes = data.helpfulVotes;
        }
      })

      // Architect stats
      .addCase(fetchArchitectStats.pending, (state) => {
        state.stats.loading = true;
        state.stats.error = null;
      })
      .addCase(fetchArchitectStats.fulfilled, (state, action) => {
        state.stats.loading = false;
        state.stats.data = action.payload;
      })
      .addCase(fetchArchitectStats.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error = action.payload;
      });
  },
});

export const {
  clearCategoryError,
  clearProductError,
  clearOrderError,
  clearReviewError,
  resetCurrentProduct,
  resetCurrentCategory,
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;
