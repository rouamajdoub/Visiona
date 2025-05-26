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

export const createOrder = createAsyncThunk(
  "marketplace/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/marketplace/orders", orderData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to create order"
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

export const updateProductReview = createAsyncThunk(
  "marketplace/updateProductReview",
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `/api/marketplace/reviews/${reviewId}`,
        reviewData
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to update product review"
      );
    }
  }
);

export const deleteProductReview = createAsyncThunk(
  "marketplace/deleteProductReview",
  async (reviewId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/marketplace/reviews/${reviewId}`);
      return reviewId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete product review"
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

// Cart Thunks
export const getCart = createAsyncThunk(
  "marketplace/getCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/marketplace/cart");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch cart"
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  "marketplace/addToCart",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/marketplace/cart", {
        productId,
        quantity,
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to add to cart"
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "marketplace/updateCartItem",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/marketplace/cart/${itemId}`, {
        quantity,
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to update cart item"
      );
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "marketplace/removeCartItem",
  async (itemId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/api/marketplace/cart/${itemId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to remove cart item"
      );
    }
  }
);

export const clearCart = createAsyncThunk(
  "marketplace/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.delete("/api/marketplace/cart");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to clear cart"
      );
    }
  }
);

// Favorites Thunks
export const getFavorites = createAsyncThunk(
  "marketplace/getFavorites",
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(queryParams).toString();
      const res = await axios.get(`/api/marketplace/favorites?${queryString}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch favorites"
      );
    }
  }
);

export const addToFavorites = createAsyncThunk(
  "marketplace/addToFavorites",
  async ({ productId, notes }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/marketplace/favorites", {
        productId,
        notes,
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to add to favorites"
      );
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  "marketplace/removeFromFavorites",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/api/marketplace/favorites/${productId}`);
      return { productId, data: res.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to remove from favorites"
      );
    }
  }
);

export const checkFavoriteStatus = createAsyncThunk(
  "marketplace/checkFavoriteStatus",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `/api/marketplace/favorites/check/${productId}`
      );
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to check favorite status"
      );
    }
  }
);

export const updateFavoriteNotes = createAsyncThunk(
  "marketplace/updateFavoriteNotes",
  async ({ productId, notes }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/marketplace/favorites/${productId}`, {
        notes,
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to update favorite notes"
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
  cart: {
    items: [],
    totalAmount: 0,
    itemCount: 0,
    loading: false,
    error: null,
  },
  favorites: {
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
    clearStatsError: (state) => {
      state.stats.error = null;
    },
    resetCurrentProduct: (state) => {
      state.products.currentProduct = null;
    },
    resetCurrentCategory: (state) => {
      state.categories.currentCategory = null;
    },
    resetCurrentOrder: (state) => {
      state.orders.currentOrder = null;
    },
    clearCartError: (state) => {
      state.cart.error = null;
    },
    clearFavoritesError: (state) => {
      state.favorites.error = null;
    },
    resetProductsPagination: (state) => {
      state.products.pagination = {
        total: 0,
        pages: 1,
        page: 1,
        limit: 10,
      };
    },
    resetOrdersPagination: (state) => {
      state.orders.pagination = {
        total: 0,
        pages: 1,
        page: 1,
        limit: 10,
      };
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
        // Update current category if it's the same one
        if (state.categories.currentCategory?._id === action.payload._id) {
          state.categories.currentCategory = action.payload;
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
        // Clear current category if it was deleted
        if (state.categories.currentCategory?._id === action.payload) {
          state.categories.currentCategory = null;
        }
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
        // Update pagination total
        state.products.pagination.total += 1;
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
        // Update pagination total
        state.products.pagination.total = Math.max(
          0,
          state.products.pagination.total - 1
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.products.loading = false;
        state.products.error = action.payload;
      })
      .addCase(deleteProductImage.pending, (state) => {
        state.products.loading = true;
        state.products.error = null;
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
      .addCase(deleteProductImage.rejected, (state, action) => {
        state.products.loading = false;
        state.products.error = action.payload;
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
      .addCase(createOrder.pending, (state) => {
        state.orders.loading = true;
        state.orders.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.loading = false;
        state.orders.list.unshift(action.payload);
        // Update pagination total
        state.orders.pagination.total += 1;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orders.loading = false;
        state.orders.error = action.payload;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.orders.loading = true;
        state.orders.error = null;
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
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.orders.loading = false;
        state.orders.error = action.payload;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.orders.loading = true;
        state.orders.error = null;
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
      .addCase(cancelOrder.rejected, (state, action) => {
        state.orders.loading = false;
        state.orders.error = action.payload;
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
        // Update pagination total
        state.reviews.pagination.total += 1;
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.reviews.loading = false;
        state.reviews.error = action.payload;
      })
      .addCase(updateProductReview.pending, (state) => {
        state.reviews.loading = true;
        state.reviews.error = null;
      })
      .addCase(updateProductReview.fulfilled, (state, action) => {
        state.reviews.loading = false;
        const index = state.reviews.list.findIndex(
          (review) => review._id === action.payload._id
        );
        if (index !== -1) {
          state.reviews.list[index] = action.payload;
        }
      })
      .addCase(updateProductReview.rejected, (state, action) => {
        state.reviews.loading = false;
        state.reviews.error = action.payload;
      })
      .addCase(deleteProductReview.pending, (state) => {
        state.reviews.loading = true;
        state.reviews.error = null;
      })
      .addCase(deleteProductReview.fulfilled, (state, action) => {
        state.reviews.loading = false;
        state.reviews.list = state.reviews.list.filter(
          (review) => review._id !== action.payload
        );
        // Update pagination total
        state.reviews.pagination.total = Math.max(
          0,
          state.reviews.pagination.total - 1
        );
      })
      .addCase(deleteProductReview.rejected, (state, action) => {
        state.reviews.loading = false;
        state.reviews.error = action.payload;
      })
      .addCase(markReviewHelpful.pending, (state) => {
        state.reviews.error = null;
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
      .addCase(markReviewHelpful.rejected, (state, action) => {
        state.reviews.error = action.payload;
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
      })

      // Cart reducers
      .addCase(getCart.pending, (state) => {
        state.cart.loading = true;
        state.cart.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.cart.loading = false;
        state.cart.items = action.payload.items;
        state.cart.totalAmount = action.payload.totalAmount;
        state.cart.itemCount = action.payload.itemCount;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.cart.loading = false;
        state.cart.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.cart.loading = true;
        state.cart.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart.loading = false;
        state.cart.items = action.payload.items;
        state.cart.totalAmount = action.payload.totalAmount;
        state.cart.itemCount = action.payload.itemCount;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.cart.loading = false;
        state.cart.error = action.payload;
      })
      .addCase(updateCartItem.pending, (state) => {
        state.cart.loading = true;
        state.cart.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart.loading = false;
        state.cart.items = action.payload.items;
        state.cart.totalAmount = action.payload.totalAmount;
        state.cart.itemCount = action.payload.itemCount;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.cart.loading = false;
        state.cart.error = action.payload;
      })
      .addCase(removeCartItem.pending, (state) => {
        state.cart.loading = true;
        state.cart.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart.loading = false;
        state.cart.items = action.payload.items;
        state.cart.totalAmount = action.payload.totalAmount;
        state.cart.itemCount = action.payload.itemCount;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.cart.loading = false;
        state.cart.error = action.payload;
      })
      .addCase(clearCart.pending, (state) => {
        state.cart.loading = true;
        state.cart.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.cart.loading = false;
        state.cart.items = [];
        state.cart.totalAmount = 0;
        state.cart.itemCount = 0;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.cart.loading = false;
        state.cart.error = action.payload;
      })

      // Favorites reducers
      .addCase(getFavorites.pending, (state) => {
        state.favorites.loading = true;
        state.favorites.error = null;
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.favorites.loading = false;
        state.favorites.list = action.payload.data;
        state.favorites.pagination = action.payload.pagination;
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.favorites.loading = false;
        state.favorites.error = action.payload;
      })
      .addCase(addToFavorites.pending, (state) => {
        state.favorites.loading = true;
        state.favorites.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.favorites.loading = false;
        state.favorites.list.unshift(action.payload);
        // Update pagination total
        state.favorites.pagination.total += 1;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.favorites.loading = false;
        state.favorites.error = action.payload;
      })
      .addCase(removeFromFavorites.pending, (state) => {
        state.favorites.loading = true;
        state.favorites.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.favorites.loading = false;
        state.favorites.list = state.favorites.list.filter(
          (item) => item.product._id !== action.payload.productId
        );
        // Update pagination total
        state.favorites.pagination.total = Math.max(
          0,
          state.favorites.pagination.total - 1
        );
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.favorites.loading = false;
        state.favorites.error = action.payload;
      })
      .addCase(checkFavoriteStatus.pending, (state) => {
        state.favorites.error = null;
      })
      .addCase(checkFavoriteStatus.fulfilled, (state, action) => {
        const index = state.favorites.list.findIndex(
          (item) => item.product._id === action.payload.productId
        );
        if (index === -1 && action.payload.isFavorite) {
          state.favorites.list.push(action.payload);
        }
      })
      .addCase(checkFavoriteStatus.rejected, (state, action) => {
        state.favorites.error = action.payload;
      })
      .addCase(updateFavoriteNotes.pending, (state) => {
        state.favorites.loading = true;
        state.favorites.error = null;
      })
      .addCase(updateFavoriteNotes.fulfilled, (state, action) => {
        state.favorites.loading = false;
        const index = state.favorites.list.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.favorites.list[index].notes = action.payload.notes;
        }
      })
      .addCase(updateFavoriteNotes.rejected, (state, action) => {
        state.favorites.loading = false;
        state.favorites.error = action.payload;
      });
  },
});

export const {
  clearCategoryError,
  clearProductError,
  clearOrderError,
  clearReviewError,
  clearStatsError,
  resetCurrentProduct,
  resetCurrentCategory,
  resetCurrentOrder,
  clearCartError,
  clearFavoritesError,
  resetProductsPagination,
  resetOrdersPagination,
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;
