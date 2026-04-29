import { createAuthClient } from "better-auth/react";
import { oneTapClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100"}/api/auth`,
  plugins: [
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
      autoSelect: false,
      cancelOnTapOutside: true,
      context: "signin",
      promptOptions: {
        baseDelay: 1000,
        maxAttempts: 3,
      },
    }),
  ],
});

export const { signIn, signUp, signOut } = authClient;

// ── Extended user type with custom backend fields ──────────────────────────
export type AppUser = (typeof authClient.$Infer.Session)["user"] & {
  barberiaId: string | null;
  role: string;
};

export type AppSession = Omit<typeof authClient.$Infer.Session, "user"> & {
  user: AppUser;
};

/**
 * Typed wrapper over authClient.useSession() that includes
 * the custom fields sent by your backend (barberiaId, role).
 */
export function useAppSession() {
  const result = authClient.useSession();
  return result as typeof result & {
    data: (AppSession & { session: object }) | null;
  };
}
