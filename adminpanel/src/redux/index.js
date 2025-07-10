import { configureStore } from '@reduxjs/toolkit';
import adminProductReducer from './slices/adminProductSlice';
import adminOrderReducer from './slices/adminOrderSlice';
import adminAuthReducer from './slices/adminAuthSlice';
import adminDashboardReducer from './slices/adminDashboardSlice'
import adminUserReducer from './slices/adminUserSlice'


export const store = configureStore({
  reducer: {
    auth: adminAuthReducer,
    product: adminProductReducer,
    order: adminOrderReducer,
    user:adminUserReducer,
    dashboard: adminDashboardReducer
  },
});
