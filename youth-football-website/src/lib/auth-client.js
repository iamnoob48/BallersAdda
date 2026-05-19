import { createAuthClient } from "better-auth/react";

const baseURL = import.meta.env.VITE_AUTH_URL || "";

export const authClient = createAuthClient({ baseURL });

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  forgetPassword,
  resetPassword,
} = authClient;
