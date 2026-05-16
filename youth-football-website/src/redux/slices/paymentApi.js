import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithReauth } from "../baseQueryWithReauth.js";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: createBaseQueryWithReauth("/api/v1/payment"),
  endpoints: (builder) => ({
    createAcademyOrder: builder.mutation({
      query: (body) => ({
        url: "/academy/order",
        method: "POST",
        body,
      }),
    }),
    verifyAcademyPayment: builder.mutation({
      query: (body) => ({
        url: "/academy/verify",
        method: "POST",
        body,
      }),
    }),
    createTournamentOrder: builder.mutation({
      query: (body) => ({
        url: "/tournament/order",
        method: "POST",
        body,
      }),
    }),
    verifyTournamentPayment: builder.mutation({
      query: (body) => ({
        url: "/tournament/verify",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCreateAcademyOrderMutation,
  useVerifyAcademyPaymentMutation,
  useCreateTournamentOrderMutation,
  useVerifyTournamentPaymentMutation,
} = paymentApi;
