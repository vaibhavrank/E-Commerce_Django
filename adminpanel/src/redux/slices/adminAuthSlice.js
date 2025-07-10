// src/redux/slices/adminAuthSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  admin: null,
  loading: false,
  error: null,
};

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.admin = action.payload;
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.admin = null;
      localStorage.removeItem('adminToken');
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;