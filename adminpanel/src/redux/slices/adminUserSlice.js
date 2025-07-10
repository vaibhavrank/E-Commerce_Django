// src/redux/slices/adminUserSlice.js
import { createSlice } from '@reduxjs/toolkit';

const adminUserSlice = createSlice({
  name: 'adminUsers',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchUsersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess(state, action) {
      state.loading = false;
      state.users = action.payload;
    },
    fetchUsersFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchUsersStart, fetchUsersSuccess, fetchUsersFailure } = adminUserSlice.actions;
export default adminUserSlice.reducer;

