// src/redux/slices/adminOrderSlice.js
import { createSlice } from '@reduxjs/toolkit';

const adminOrderSlice = createSlice({
  name: 'adminOrders',
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchOrdersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchOrdersSuccess(state, action) {
      state.loading = false;
      state.orders = action.payload;
    },
    fetchOrdersFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchOrdersStart, fetchOrdersSuccess, fetchOrdersFailure } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
