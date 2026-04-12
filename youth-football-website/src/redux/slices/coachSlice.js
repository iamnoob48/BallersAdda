import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const coachApi = createApi({
  reducerPath: "coachApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1/coach",
    credentials: "include", // 🔥 ensures cookies are sent
  }),
  tagTypes: ["CoachProfile", "Roster", "Teams"],
  endpoints: (builder) => ({
    getCoachProfile: builder.query({
      query: () => "/profile",
      providesTags: ["CoachProfile"],
    }),
    updateCoachProfile: builder.mutation({
      query: (data) => ({
        url: "/profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CoachProfile"],
    }),
    getAcademyRoster: builder.query({
      query: () => "/roster",
      providesTags: ["Roster"],
    }),
    createTeam: builder.mutation({
      query: (data) => ({
        url: "/teams",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Teams"],
    }),
  }),
});

export const {
  useGetCoachProfileQuery,
  useUpdateCoachProfileMutation,
  useGetAcademyRosterQuery,
  useCreateTeamMutation,
} = coachApi;
