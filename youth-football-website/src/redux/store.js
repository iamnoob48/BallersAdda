import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import themeReducer from "./slices/themeSlice.js";
import playerReducer from "./slices/playerSlice.js";
import { academyApi } from "./slices/academySlice.js";
import { tournamentApi } from "./slices/tournamentSlice.js";
import { coachApi } from "./slices/coachSlice.js";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        theme: themeReducer,
        player: playerReducer,
        [academyApi.reducerPath]: academyApi.reducer,
        [tournamentApi.reducerPath]: tournamentApi.reducer,
        [coachApi.reducerPath]: coachApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(academyApi.middleware)
            .concat(tournamentApi.middleware)
            .concat(coachApi.middleware),
});