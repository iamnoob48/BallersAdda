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

    getTournamentById: builder.query({
      query: (id) => `/tournament/${id}`,
      providesTags: (result, error, id) => [{ type: "Tournament", id }],
      transformResponse: (response) => response.tournament,
      transformErrorResponse: (error) => {
        console.error("Tournament detail error:", error);
        return error?.data || { message: "Unable to fetch tournament details" };
      },
    }),

    verifyRosterEmails: builder.mutation({
      query: (emails) => ({
        url: "/tournament/verify-players",
        method: "POST",
        body: { emails },
      }),
    }),

    // Public — no credentials needed, but include them anyway for consistency
    validateInviteToken: builder.query({
      query: (token) => `/tournament/invite/validate?token=${token}`,
      transformResponse: (response) => response.invite,
    }),

    redeemInviteToken: builder.mutation({
      query: (token) => ({
        url: '/tournament/invite/redeem',
        method: 'POST',
        body: { token },
      }),
    }),

    registerTeamForTournament: builder.mutation({
      query: ({ tournamentId, formData }) => {
        const payload = new FormData();
        payload.append("teamName", formData.teamName);
        payload.append("kitColour", formData.kitColor);
        if (formData.teamLogo) {
          payload.append("teamLogo", formData.teamLogo);
        }
        formData.emails.filter(e => e.trim().length > 0).forEach(email => {
          payload.append("emails[]", email); // array mapping for multer/express
        });

        // If your backend isn't mapped for multer yet on this route, let's just send JSON
        // Based on the `tournamentsController.js` we expect JSON body, not FormData right now.
        // Let's send a standard JSON POST instead of FormData.
        return {
          url: `/tournament/${tournamentId}/registerTeam`,
          method: "POST",
            body: {
            teamName: formData.teamName,
            kitColour: formData.kitColor,
            teamLogo: formData.teamLogo, // Pass it over if it's base64 or a string, else skip
            emails: formData.emails.filter(e => e.trim().length > 0)
          },
        };
      },
      invalidatesTags: (result, error, { tournamentId }) => [
        { type: "Tournament", id: tournamentId },
        { type: "TournamentList", id: "LIST" }
      ],
    }),
  }),
});

export const {
  useGetTournamentsQuery,
  useGetTournamentByIdQuery,
  useVerifyRosterEmailsMutation,
  useRegisterTeamForTournamentMutation,
  useValidateInviteTokenQuery,
  useRedeemInviteTokenMutation,
} = tournamentApi;
