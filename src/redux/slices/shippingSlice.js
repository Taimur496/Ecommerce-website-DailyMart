import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userAPI } from "../../services/api";

// Async thunk to fetch shipping charges
export const fetchShippingCharges = createAsyncThunk(
  "shipping/fetchCharges",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getShippingCharges();
      return response.data.data.filter((charge) => charge.is_active);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch shipping charges"
      );
    }
  }
);

const shippingSlice = createSlice({
  name: "shipping",
  initialState: {
    charges: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShippingCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShippingCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.charges = action.payload;
      })
      .addCase(fetchShippingCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default shippingSlice.reducer;
