import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import crypto from "crypto";
import prisma from "../prismaClient.js";
import { sendPasswordResetEmail } from "./mailer.js";

/**
 * Generate a unique username from a base name.
 * If "John" is taken, tries "John-a8x3", "John-k9m2", etc.
 */
async function uniqueUsername(baseName) {
  // Sanitise: lowercase, trim, collapse whitespace → hyphens
  let slug = (baseName || "player")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");

  if (!slug) slug = "player";

  // Check if the base slug is available
  const existing = await prisma.user.findUnique({ where: { username: slug } });
  if (!existing) return slug;

  // Append random suffix until unique (max 5 attempts, then use full random)
  for (let i = 0; i < 5; i++) {
    const suffix = crypto.randomBytes(2).toString("hex"); // 4 hex chars
    const candidate = `${slug}-${suffix}`;
    const taken = await prisma.user.findUnique({ where: { username: candidate } });
    if (!taken) return candidate;
  }

  // Fallback: slug + timestamp
  return `${slug}-${Date.now().toString(36)}`;
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  plugins: [],

  account: {
    skipStateCookieCheck: true,
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // "name" in better-auth maps to "username" in our DB
          const unique = await uniqueUsername(user.name);
          return { data: { ...user, name: unique } };
        },
      },
    },
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
