import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithReauth } from "../baseQueryWithReauth";

export const coachApi = createApi({
  reducerPath: "coachApi",
  baseQuery: createBaseQueryWithReauth("/api/v1/coach"),
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
