// src/redux/slices/adminDashboardSlice.js
import { createSlice } from '@reduxjs/toolkit';

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState: {
    stats: {},
    loading: false,
    error: null,
  },
  reducers: {
    fetchStatsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchStatsSuccess(state, action) {
      state.loading = false;
      state.stats = action.payload;
    },
    fetchStatsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchStatsStart, fetchStatsSuccess, fetchStatsFailure } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
