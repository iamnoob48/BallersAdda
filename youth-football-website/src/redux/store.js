import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import themeReducer from "./slices/themeSlice.js";
import { academyApi } from "./slices/academySlice.js";


export const store = configureStore({
    reducer: {
        auth: authReducer,
        theme: themeReducer,
        [academyApi.reducerPath]: academyApi.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(academyApi.middleware)
})