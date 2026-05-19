import { createAuthClient } from "better-auth/react";
import { oAuthProxyClient } from "better-auth/client/plugins";

const baseURL = import.meta.env.VITE_BACKEND_URL || "";

export const authClient = createAuthClient({
  baseURL,
  plugins: [oAuthProxyClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  forgetPassword,
  resetPassword,
} = authClient;
