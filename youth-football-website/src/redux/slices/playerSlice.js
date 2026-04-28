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

/** Upload profile picture — sends base64 data URI, gets back secure_url */
export const uploadProfilePic = createAsyncThunk(
  "player/uploadProfilePic",
  async (base64Image, { rejectWithValue }) => {
    try {
      const res = await api.post("/player/uploadProfilePic", { image: base64Image });
      return res.data.profilePic; // secure_url string
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to upload picture");
    }
  }
);

/** Fetch tournaments the player is rostered for */
export const fetchMyTournaments = createAsyncThunk(
  "player/fetchMyTournaments",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/player/myTournaments");
      return res.data.tournaments; // [{ entryId, joinedAt, tournament, team }]
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch tournaments");
    }
  }
);

/**
 * Leave the player's current academy.
 * On success the backend nulls academyId, marks enrollment FORMER, decrements count.
 * Slice mirrors that by clearing profile.academyId and academy from state.
 */
export const leaveAcademy = createAsyncThunk(
  "player/leaveAcademy",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/player/leaveAcademy");
      return res.data; // { message, playerProfile, enrollment, academy }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to leave academy");
    }
  }
);

/**
 * Fetch PlayerAcademyStats for the player's current academy.
 * Returns all-zero object when player has no academy or no stats row yet.
 */
export const fetchPlayerAcademyStats = createAsyncThunk(
  "player/fetchAcademyStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/player/academyStats");
      return res.data.stats; // { officialCaps, officialGoals, officialAssists, officialMotm, officialAvgRating, ... }
    } catch (err) {
      // 404 means no academy — not an error worth surfacing, keep null
      return rejectWithValue(err.response?.data?.message || "Failed to fetch academy stats");
    }
  }
);

/**
 * Fetch full enrollment history (ACTIVE + FORMER academies).
 * Used to populate academy cards in the overview and gate page access.
 */
export const fetchAcademyHistory = createAsyncThunk(
  "player/fetchAcademyHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/player/academyHistory");
      return res.data.enrollments; // [{ id, status, joinedAt, leftAt, academy }]
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch academy history");
    }
  }
);

/**
 * Fetch attendance data — monthly summary, recent 5-session form, streak.
 * Returns empty defaults when player has no academy.
 */
export const fetchPlayerAttendance = createAsyncThunk(
  "player/fetchAttendance",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/player/attendance");
      return res.data; // { attendance: { attended, total }, recentForm: bool[], streak: number }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch attendance");
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
    // Academy stats (PlayerAcademyStats row)
    academyStats: null,
    statsLoading: false,
    // Attendance — monthly summary + form + streak
    attendanceData: null,   // { attendance: { attended, total }, recentForm, streak }
    attendanceLoading: false,
    myTournaments: [],
    myTournamentsLoading: false,
    academyHistory: null,       // null = not fetched yet, [] = fetched but empty
    academyHistoryLoading: false,
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
      academyStats: null,
      statsLoading: false,
      attendanceData: null,
      attendanceLoading: false,
      myTournaments: [],
      myTournamentsLoading: false,
      academyHistory: null,
      academyHistoryLoading: false,
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
      })

      // ── fetchMyTournaments ──
      .addCase(fetchMyTournaments.pending, (state) => {
        state.myTournamentsLoading = true;
      })
      .addCase(fetchMyTournaments.fulfilled, (state, action) => {
        state.myTournaments = action.payload;
        state.myTournamentsLoading = false;
      })
      .addCase(fetchMyTournaments.rejected, (state) => {
        state.myTournamentsLoading = false;
      })

      // ── leaveAcademy ──
      .addCase(leaveAcademy.fulfilled, (state, action) => {
        // Mirror the backend: clear academy pointer + wipe academy data
        if (state.profile) state.profile.academyId = null;
        state.academy        = null;
        state.academyStats   = null;
        state.attendanceData = null;
      })
      // rejected: keep state as-is so the UI can show the error

      // ── fetchPlayerAcademyStats ──
      .addCase(fetchPlayerAcademyStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchPlayerAcademyStats.fulfilled, (state, action) => {
        state.academyStats = action.payload;
        state.statsLoading = false;
      })
      .addCase(fetchPlayerAcademyStats.rejected, (state) => {
        state.statsLoading = false;
        // Keep academyStats as null — UI falls back to zeros
      })

      // ── fetchPlayerAttendance ──
      .addCase(fetchPlayerAttendance.pending, (state) => {
        state.attendanceLoading = true;
      })
      .addCase(fetchPlayerAttendance.fulfilled, (state, action) => {
        state.attendanceData = action.payload;
        state.attendanceLoading = false;
      })
      .addCase(fetchPlayerAttendance.rejected, (state) => {
        state.attendanceLoading = false;
        // Keep attendanceData as null — UI falls back to empty state
      })

      // ── fetchAcademyHistory ──
      .addCase(fetchAcademyHistory.pending, (state) => {
        state.academyHistoryLoading = true;
      })
      .addCase(fetchAcademyHistory.fulfilled, (state, action) => {
        state.academyHistory = action.payload;
        state.academyHistoryLoading = false;
      })
      .addCase(fetchAcademyHistory.rejected, (state) => {
        state.academyHistory = [];
        state.academyHistoryLoading = false;
      })

      // ── uploadProfilePic ──
      .addCase(uploadProfilePic.fulfilled, (state, action) => {
        state.profilePic = action.payload;
      });
  },
});

export const { clearPlayerError, resetPlayerState } = playerSlice.actions;
export default playerSlice.reducer;
