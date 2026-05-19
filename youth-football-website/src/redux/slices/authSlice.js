import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authClient } from "../../lib/auth-client.js";
import api from "../../api/axios";

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
  } catch {}
}

function clearCachedAuth() {
  localStorage.removeItem(AUTH_CACHE_KEY);
}

const cached = loadCachedAuth();

export const verifyUser = createAsyncThunk(
  "auth/verifyUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await authClient.getSession();
      if (error || !data) {
        return rejectWithValue("Not authenticated");
      }

      const user = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.name,
        profilePic: data.user.image,
        role: data.user.role,
        status: data.user.status,
      };

      let isCoachProfileIncomplete = false;
      if (user.role === "COACH") {
        try {
          const res = await api.get("/coach/profile");
          if (res.data?.firstName === "Pending") {
            isCoachProfileIncomplete = true;
          }
        } catch {}
      }

      let hasPlayerProfile = false;
      if (user.role === "PLAYER") {
        try {
          const res = await api.get("/player/playerProfile");
          hasPlayerProfile = !!res.data?.playerProfile?.id;
        } catch {}
      }

      return { success: true, user, isCoachProfileIncomplete, hasPlayerProfile };
    } catch (err) {
      return rejectWithValue(err.message || "Verification failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: cached ? true : null,
    loading: cached ? true : false,
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
      });
  },
});

export const { loginSuccess, logout, clearAuthError, updateCredentials, setPlayerProfileComplete } = authSlice.actions;
export default authSlice.reducer;
