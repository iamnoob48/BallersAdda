import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const academyApi = createApi({
  reducerPath: "academyApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1",
    credentials: "include", // 🔥 ensures cookies are sent
  }),

  tagTypes: ["Academy", "AcademyList"],

  endpoints: (builder) => ({
    // 📌 Fetch all academies (with optional pagination + filters)
    getAcademies: builder.query({
      query: ({ page = 1, limit = 10, location, rating } = {}) => {
        let queryString = `/academy/details?page=${page}&limit=${limit}`;
        if (location) queryString += `&location=${location}`;
        if (rating) queryString += `&rating=${rating}`;
        return queryString;
      },

      providesTags: (result) =>
        result
          ? [
            ...result.data.map((academy) => ({
              type: "Academy",
              id: academy.id,
            })),
            { type: "AcademyList", id: "LIST" },
          ]
          : [{ type: "AcademyList", id: "LIST" }],

      transformErrorResponse: (error) => {
        console.error("Academy list error:", error);
        return error?.data || { message: "Unable to fetch academies" };
      },
    }),

    // 📌 Fetch a single academy by ID
    getAcademyById: builder.query({
      query: (id) => `/academy/details/${id}`,
      providesTags: (result, error, id) => [{ type: "Academy", id }],

      transformErrorResponse: (error) => {
        console.error("Academy detail error:", error);
        return error?.data || { message: "Unable to fetch academy details" };
      },
    }),

    // 📌 Filter academies by city, rating, ageGroup
    filterAcademies: builder.query({
      query: ({ page = 1, limit = 10, city, rating, ageGroup } = {}) => {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", limit);
        if (city) params.set("city", city);
        if (rating) params.set("rating", rating);
        if (ageGroup) params.set("ageGroup", ageGroup);
        return `/academy/filter?${params.toString()}`;
      },

      providesTags: (result) =>
        result
          ? [
            ...result.data.map((academy) => ({
              type: "Academy",
              id: academy.id,
            })),
            { type: "AcademyList", id: "FILTERED" },
          ]
          : [{ type: "AcademyList", id: "FILTERED" }],

      transformErrorResponse: (error) => {
        console.error("Filter academies error:", error);
        return error?.data || { message: "Unable to filter academies" };
      },
    }),

    // 📌 Example: Join academy (for future)
    joinAcademy: builder.mutation({
      query: (academyId) => ({
        url: `/player/joinAcademy`,
        method: "POST",
        body: { academyId },
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Academy", id },
        { type: "AcademyList", id: "LIST" },
      ],
    }),

    // 📌 Register new academy (B2B)
    registerAcademy: builder.mutation({
      query: (body) => ({
        url: `/academy/register`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AcademyList"],
    }),
  }),
});

export const {
  useGetAcademiesQuery,
  useGetAcademyByIdQuery,
  useFilterAcademiesQuery,
  useJoinAcademyMutation,
  useRegisterAcademyMutation,
} = academyApi;
