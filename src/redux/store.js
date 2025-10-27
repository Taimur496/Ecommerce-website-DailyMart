import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import shippingReducer from "./slices/shippingSlice";
import wishlistReducer from "./slices/wishlistSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    shipping: shippingReducer,
    wishlist: wishlistReducer,
  },
});
