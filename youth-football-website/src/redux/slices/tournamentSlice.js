import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const tournamentApi = createApi({
  reducerPath: "tournamentApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    credentials: "include",
  }),

  tagTypes: ["Tournament", "TournamentList"],

  endpoints: (builder) => ({
    // Fetch paginated tournaments with optional filters
    getTournaments: builder.query({
      query: ({ page = 1, limit = 10, status, location, category, sort } = {}) => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);
        if (status) params.set("status", status);
        if (location) params.set("location", location);
        if (category) params.set("category", category);
        if (sort) params.set("sort", sort);
        return `/tournament/all?${params.toString()}`;
      },

      providesTags: (result) =>
        result
          ? [
              ...result.data.map((t) => ({ type: "Tournament", id: t.id })),
              { type: "TournamentList", id: "LIST" },
            ]
          : [{ type: "TournamentList", id: "LIST" }],

      transformErrorResponse: (error) => {
        console.error("Tournament list error:", error);
        return error?.data || { message: "Unable to fetch tournaments" };
      },
    }),
  }),
});

export const { useGetTournamentsQuery } = tournamentApi;
