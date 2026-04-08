import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ── Async thunks ────────────────────────────────────────────────────────

/** Fetch the current player's profile */
export const fetchPlayerProfile = createAsyncThunk(
  "player/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/player/playerProfile");
      return res.data; // { playerProfile, profilePic }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
    }
  }
);

/** Create a new player profile */
export const createPlayerProfile = createAsyncThunk(
  "player/createProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await api.post("/player/createPlayerProfile", profileData);
      return res.data.playerProfile;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create profile");
    }
  }
);

/** Update the existing player profile (partial) */
export const updatePlayerProfile = createAsyncThunk(
  "player/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await api.post("/player/updatePlayerProfile", profileData);
      return res.data.playerProfile;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update profile");
    }
  }
);

/** Fetch academy details for the player */
export const fetchPlayerAcademy = createAsyncThunk(
  "player/fetchAcademy",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/player/academyDetailsOfPlayer");
      return res.data.academy;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch academy");
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────

const playerSlice = createSlice({
  name: "player",
  initialState: {
    profile: null,
    profilePic: null,
    academy: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearPlayerError: (state) => {
      state.error = null;
    },
    resetPlayerState: () => ({
      profile: null,
      profilePic: null,
      academy: null,
      loading: false,
      error: null,
    }),
  },
  extraReducers: (builder) => {
    builder
      // ── fetchPlayerProfile ──
      .addCase(fetchPlayerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayerProfile.fulfilled, (state, action) => {
        state.profile = action.payload.playerProfile;
        state.profilePic = action.payload.profilePic;
        state.loading = false;
      })
      .addCase(fetchPlayerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── createPlayerProfile ──
      .addCase(createPlayerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlayerProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(createPlayerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── updatePlayerProfile ──
      .addCase(updatePlayerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlayerProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(updatePlayerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── fetchPlayerAcademy ──
      .addCase(fetchPlayerAcademy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlayerAcademy.fulfilled, (state, action) => {
        state.academy = action.payload;
        state.loading = false;
      })
      .addCase(fetchPlayerAcademy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPlayerError, resetPlayerState } = playerSlice.actions;
export default playerSlice.reducer;
