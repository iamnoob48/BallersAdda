import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../prismaClient.js";
import { sendPasswordResetEmail } from "./mailer.js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  plugins: [],

  account: {
    skipStateCookieCheck: true,
  },

  user: {
    fields: {
      name: "username",
      image: "profilePic",
    },
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "PLAYER",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE",
        input: false,
      },
      lastLogin: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },

  emailVerification: {
    sendOnSignUp: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  session: {
    expiresIn: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  advanced: {
    cookiePrefix: "ba",
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: true,
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    },
  },

  trustedOrigins: [
    process.env.CLIENT_URL || "http://localhost:5173",
  ],
});
