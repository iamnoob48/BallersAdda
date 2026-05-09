import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithReauth } from "../baseQueryWithReauth.js";

export const leaderboardApi = createApi({
  reducerPath: "leaderboardApi",

  baseQuery: createBaseQueryWithReauth("/api/v1"),

  tagTypes: ["PlayerLeaderboard", "TournamentLeaderboard", "AcademyLeaderboard"],

  endpoints: (builder) => ({
    getPlayerLeaderboard: builder.query({
      query: ({ scope = "REGIONAL", scopeValue, position = "OVERALL", page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        params.set("scope", scope);
        if (scopeValue) params.set("scopeValue", scopeValue);
        params.set("position", position);
        params.set("page", page);
        params.set("limit", limit);
        return `/leaderboard/players?${params.toString()}`;
      },
      providesTags: (result, error, arg) => [
        { type: "PlayerLeaderboard", id: `${arg?.scope}-${arg?.scopeValue}-${arg?.position}-${arg?.page}` },
      ],
      transformErrorResponse: (error) => {
        console.error("Player leaderboard error:", error);
        return error?.data || { message: "Unable to load leaderboard" };
      },
    }),

    getTournamentLeaderboard: builder.query({
      query: (tournamentId) => `/leaderboard/tournament/${tournamentId}`,
      providesTags: (result, error, id) => [{ type: "TournamentLeaderboard", id }],
      transformErrorResponse: (error) => {
        console.error("Tournament leaderboard error:", error);
        return error?.data || { message: "Unable to load tournament data" };
      },
    }),

    getAcademyLeaderboard: builder.query({
      query: ({ academyId, sortBy = "composite", page = 1, limit = 20 } = {}) => {
        const params = new URLSearchParams();
        params.set("sortBy", sortBy);
        params.set("page", page);
        params.set("limit", limit);
        return `/leaderboard/academy/${academyId}?${params.toString()}`;
      },
      providesTags: (result, error, arg) => [
        { type: "AcademyLeaderboard", id: `${arg?.academyId}-${arg?.sortBy}-${arg?.page}` },
      ],
      transformErrorResponse: (error) => {
        console.error("Academy leaderboard error:", error);
        return error?.data || { message: "Unable to load academy leaderboard" };
      },
    }),
  }),
});

export const {
  useGetPlayerLeaderboardQuery,
  useGetTournamentLeaderboardQuery,
  useGetAcademyLeaderboardQuery,
} = leaderboardApi;
