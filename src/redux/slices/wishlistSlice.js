import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistAPI } from "../../services/api";

// Async thunks
export const fetchWishlistCount = createAsyncThunk(
  "wishlist/fetchCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.getWishlistCount();
      return response.data.count || 0;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch wishlist count"
      );
    }
  }
);

export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.getWishlist();
      return response.data.wishlists || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch wishlist"
      );
    }
  }
);

export const checkWishlistItem = createAsyncThunk(
  "wishlist/checkItem",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.checkInWishlist(productId);
      return { productId, inWishlist: response.data.inWishlist };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to check wishlist"
      );
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (productId, { rejectWithValue }) => {
    try {
      await wishlistAPI.addToWishlist(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to wishlist"
      );
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async (productId, { rejectWithValue }) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from wishlist"
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    count: 0,
    wishlisted: [],
    loading: false,
    itemsLoading: false,
    error: null,
  },
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
    // Optimistic add
    addToWishlistOptimistic: (state, action) => {
      const productId = action.payload;
      if (!state.wishlisted.includes(productId)) {
        state.wishlisted.push(productId);
        state.count += 1;
      }
    },
    // Revert optimistic add on error
    revertAddToWishlist: (state, action) => {
      const productId = action.payload;
      state.wishlisted = state.wishlisted.filter((id) => id !== productId);
      state.count = Math.max(0, state.count - 1);
    },
    // Optimistic remove
    removeFromWishlistOptimistic: (state, action) => {
      const productId = action.payload;
      state.wishlisted = state.wishlisted.filter((id) => id !== productId);
      state.items = state.items.filter((item) => item.product_id !== productId);
      state.count = Math.max(0, state.count - 1);
    },
    // Revert optimistic remove on error
    revertRemoveFromWishlist: (state, action) => {
      const { productId, item } = action.payload;
      if (!state.wishlisted.includes(productId)) {
        state.wishlisted.push(productId);
      }
      if (item) {
        state.items.push(item);
      }
      state.count += 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch Count
    builder
      .addCase(fetchWishlistCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlistCount.fulfilled, (state, action) => {
        state.loading = false;
        state.count = action.payload;
      })
      .addCase(fetchWishlistCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Items
    builder
      .addCase(fetchWishlistItems.pending, (state) => {
        state.itemsLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action) => {
        state.itemsLoading = false;
        state.items = action.payload;
        state.wishlisted = action.payload.map((item) => item.product_id);
      })
      .addCase(fetchWishlistItems.rejected, (state, action) => {
        state.itemsLoading = false;
        state.error = action.payload;
      });

    // Check Item
    builder.addCase(checkWishlistItem.fulfilled, (state, action) => {
      const { productId, inWishlist } = action.payload;
      if (inWishlist) {
        if (!state.wishlisted.includes(productId)) {
          state.wishlisted.push(productId);
        }
      } else {
        state.wishlisted = state.wishlisted.filter((id) => id !== productId);
      }
    });

    // Add to Wishlist - only update on actual success
    builder.addCase(addToWishlist.rejected, (state, action) => {
      state.error = action.payload;
    });

    // Remove from Wishlist - only update on actual success
    builder.addCase(removeFromWishlist.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});

export const {
  clearWishlistError,
  addToWishlistOptimistic,
  revertAddToWishlist,
  removeFromWishlistOptimistic,
  revertRemoveFromWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
