import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithReauth } from "./baseQueryWithReauth.js";

export const achievementsApi = createApi({
  reducerPath: "achievementsApi",

  baseQuery: createBaseQueryWithReauth("/api/v1/player"),

  tagTypes: ["Achievements"],

  endpoints: (builder) => ({
    getAchievements: builder.query({
      query: () => "/achievements",
      providesTags: ["Achievements"],
    }),

    getUnreadAchievements: builder.query({
      query: () => "/achievements/unread",
    }),

    markAchievementsRead: builder.mutation({
      query: (body) => ({
        url: "/achievements/mark-read",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Achievements"],
    }),

    subscribePush: builder.mutation({
      query: (subscription) => ({
        url: "/notifications/subscribe",
        method: "POST",
        body: subscription,
      }),
    }),
  }),
});

export const {
  useGetAchievementsQuery,
  useGetUnreadAchievementsQuery,
  useMarkAchievementsReadMutation,
  useSubscribePushMutation,
} = achievementsApi;
