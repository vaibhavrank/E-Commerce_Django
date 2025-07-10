// src/redux/slices/adminCouponSlice.js
import { createSlice } from '@reduxjs/toolkit';

const adminCouponSlice = createSlice({
  name: 'adminCoupons',
  initialState: {
    coupons: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchCouponsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCouponsSuccess(state, action) {
      state.loading = false;
      state.coupons = action.payload;
    },
    fetchCouponsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchCouponsStart, fetchCouponsSuccess, fetchCouponsFailure } = adminCouponSlice.actions;
export default adminCouponSlice.reducer;