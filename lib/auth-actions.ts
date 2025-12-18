"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import { Session } from "better-auth";




/**
 * Get the current session (can be null if not logged in)
 */
export const getSession = async (): Promise<Session | null> => {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    });

    // sessionData?.session is the actual session object
    return sessionData?.session ?? null;
  } catch (err) {
    console.error("Failed to get session:", err);
    return null;
  }
};

/**
 * Require a session (throw error if not logged in)
 * Useful for protected pages or API routes
 */
export const requireSession = async (): Promise<Session> => {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized: no active session found");
  }

  return session;
};

/**
 * Sign out the current session
 */
export const signOut = async (): Promise<void> => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (err) {
    console.error("Sign out failed:", err);
    throw err;
  }
};
