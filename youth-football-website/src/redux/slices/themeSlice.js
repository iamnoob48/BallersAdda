import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    darkMode: (() => {
        try {
            return localStorage.getItem("darkMode") === "true";
        } catch {
            return false;
        }
    })(),
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleDarkMode(state) {
            state.darkMode = !state.darkMode;
            try {
                localStorage.setItem("darkMode", String(state.darkMode));
            } catch { }
        },
        setDarkMode(state, action) {
            state.darkMode = action.payload;
            try {
                localStorage.setItem("darkMode", String(state.darkMode));
            } catch { }
        },
    },
});

export const { toggleDarkMode, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
