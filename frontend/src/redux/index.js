import userReducer from '../services/slices/authSlice'
import { combineReducers,configureStore } from "@reduxjs/toolkit";
import cartReducer from '../services/slices/cartSlice'
import productReducer from '../services/slices/productSlice'

//make root reducer
const rootReducer = combineReducers({
    auth: userReducer,
    product: productReducer,
    cart: cartReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    })
