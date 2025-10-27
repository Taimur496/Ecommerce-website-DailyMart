import { createSlice } from "@reduxjs/toolkit";

// Get user ID from localStorage
const getUserId = () => {
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || null;
    }
    return null;
  } catch (err) {
    console.error("Error getting user ID:", err);
    return null;
  }
};

// Generate cart key based on user ID
const getCartKey = () => {
  const userId = getUserId();
  return userId ? `cart_user_${userId}` : "cart_guest";
};

// Load cart from localStorage for current user
const loadCartFromStorage = () => {
  try {
    const cartKey = getCartKey();
    const serializedCart = localStorage.getItem(cartKey);
    if (serializedCart === null) {
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        coupon: null,
        discount: 0,
        finalTotal: 0,
      };
    }
    return JSON.parse(serializedCart);
  } catch (err) {
    console.error("Error loading cart from localStorage:", err);
    return {
      items: [],
      totalItems: 0,
      totalPrice: 0,
      coupon: null,
      discount: 0,
      finalTotal: 0,
    };
  }
};

// Save cart to localStorage for current user
const saveCartToStorage = (state) => {
  try {
    const cartKey = getCartKey();
    const serializedCart = JSON.stringify({
      items: state.items,
      totalItems: state.totalItems,
      totalPrice: state.totalPrice,
      coupon: state.coupon,
      discount: state.discount,
      finalTotal: state.finalTotal,
    });
    localStorage.setItem(cartKey, serializedCart);
  } catch (err) {
    console.error("Error saving cart to localStorage:", err);
  }
};

// Calculate final total
const calculateFinalTotal = (state) => {
  state.finalTotal = state.totalPrice - state.discount;
  if (state.finalTotal < 0) state.finalTotal = 0;
};

const cartSlice = createSlice({
  name: "cart",
  initialState: loadCartFromStorage(),
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity, selectedColor, selectedSize } = action.payload;
      const price = product.discount_price || product.selling_price;

      // Check if item already exists
      const existingItem = state.items.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          product,
          quantity,
          selectedColor,
          selectedSize,
          price,
        });
      }

      // Recalculate totals
      state.totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      state.totalPrice = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Recalculate discount if coupon applied
      if (state.coupon) {
        state.discount = state.coupon.discount;
      }

      calculateFinalTotal(state);

      // Save to localStorage
      saveCartToStorage(state);
    },

    removeFromCart: (state, action) => {
      const { productId, selectedColor, selectedSize } = action.payload;
      state.items = state.items.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
          )
      );

      state.totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      state.totalPrice = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Recalculate or remove coupon if cart is empty
      if (state.items.length === 0) {
        state.coupon = null;
        state.discount = 0;
      } else if (state.coupon) {
        // Recalculate discount
        state.discount = state.coupon.discount;
      }

      calculateFinalTotal(state);

      // Save to localStorage
      saveCartToStorage(state);
    },

    updateQuantity: (state, action) => {
      const { productId, selectedColor, selectedSize, quantity } =
        action.payload;
      const item = state.items.find(
        (item) =>
          item.product.id === productId &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
      );

      if (item) {
        item.quantity = quantity;
      }

      state.totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      state.totalPrice = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Recalculate discount if coupon applied
      if (state.coupon) {
        state.discount = state.coupon.discount;
      }

      calculateFinalTotal(state);

      // Save to localStorage
      saveCartToStorage(state);
    },

    applyCoupon: (state, action) => {
      state.coupon = action.payload;
      state.discount = action.payload.discount;
      calculateFinalTotal(state);
      saveCartToStorage(state);
    },

    removeCoupon: (state) => {
      state.coupon = null;
      state.discount = 0;
      calculateFinalTotal(state);
      saveCartToStorage(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      state.coupon = null;
      state.discount = 0;
      state.finalTotal = 0;

      // Save to localStorage
      saveCartToStorage(state);
    },

    // New action to reload cart when user logs in/out
    reloadCart: (state) => {
      const loadedCart = loadCartFromStorage();
      state.items = loadedCart.items;
      state.totalItems = loadedCart.totalItems;
      state.totalPrice = loadedCart.totalPrice;
      state.coupon = loadedCart.coupon;
      state.discount = loadedCart.discount;
      state.finalTotal = loadedCart.finalTotal;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  reloadCart,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;
export default cartSlice.reducer;
