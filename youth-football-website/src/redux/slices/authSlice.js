import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { clearTokens } from "../../api/tokenStorage.js";

// ── Persistent auth hint (localStorage) ──────────────────────────────
// We cache a lightweight snapshot so returning users get instant routing
// instead of a flash of the landing page while verifyUser() resolves.
const AUTH_CACHE_KEY = "ba_auth_hint";

function loadCachedAuth() {
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function cacheAuth(snapshot) {
  try {
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(snapshot));
  } catch { /* quota — ignore */ }
}

function clearCachedAuth() {
  localStorage.removeItem(AUTH_CACHE_KEY);
}

const cached = loadCachedAuth();

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
    // If we have a cached hint, start as `true` (optimistic) so routing
    // is instant. verifyUser() will correct it if the token is stale.
    isAuthenticated: cached ? true : null,
    loading: cached ? true : false, // show spinner while we re-validate
    error: null,
    isCoachProfileIncomplete: false,
    hasPlayerProfile: cached?.hasPlayerProfile ?? false,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      cacheAuth({ isAuthenticated: true, hasPlayerProfile: state.hasPlayerProfile });
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.hasPlayerProfile = false;
      clearCachedAuth();
      clearTokens();
    },
    updateCredentials: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setPlayerProfileComplete: (state) => {
      state.hasPlayerProfile = true;
      cacheAuth({ isAuthenticated: true, hasPlayerProfile: true });
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
        state.hasPlayerProfile = action.payload.hasPlayerProfile ?? false;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        cacheAuth({ isAuthenticated: true, hasPlayerProfile: state.hasPlayerProfile });
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload || "Verification failed";
        clearCachedAuth();
        clearTokens();
      });
  },
});

export const { loginSuccess, logout, clearAuthError, updateCredentials, setPlayerProfileComplete } = authSlice.actions;
export default authSlice.reducer;

