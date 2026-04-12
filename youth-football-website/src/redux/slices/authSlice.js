import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const verifyUser = createAsyncThunk(
  "auth/verifyUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/verify-token", { withCredentials: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Verification failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: null, // null = unknown, true/false = resolved
    loading: false,
    error: null,
    isCoachProfileIncomplete: false,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    updateCredentials: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isCoachProfileIncomplete = action.payload.isCoachProfileIncomplete || false;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload || "Verification failed";
      });
  },
});

export const { loginSuccess, logout, clearAuthError, updateCredentials } = authSlice.actions;
export default authSlice.reducer;
