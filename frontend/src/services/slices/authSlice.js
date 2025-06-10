import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  user: localStorage.getItem("user")!=null?localStorage.getItem('user'):null,
  accessToken: localStorage.getItem('accessToken')!=null?localStorage.getItem('accessToken'):null,
  refreshToken: localStorage.getItem('refreshToken')!=null?localStorage.getItem('refreshToken'):null,
  loading: false,
  error: null
};

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, thunkAPI) => {
  try {
    const res = await axios.post('http://localhost:8000/api/auth/login/', credentials);
    console.log("Login response.............",res)
    const data  = res.data
    const tokens = data.tokens;
    const {access, refresh} = tokens;
    const {user} = data;
    localStorage.setItem('accessToken', tokens.access);
    localStorage.setItem('refreshToken', tokens.refresh);
    return { access, refresh, user };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response.data);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.clear();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
