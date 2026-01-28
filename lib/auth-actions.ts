"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";




export async function getSession() {
  const result = await auth.api.getSession({
    headers: await headers(),
    query: {
    disableCookieCache: true,
  },

  })
  
  return result?.session ?? null;
}

export async function signIn() {
   const result = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL: "/dashboard"
    }
   })

   if (result.url) {
    redirect(result.url)
   }

  };



export async function signOut() {
  // const result = await auth.api.signOut({
  //   headers: await headers()

    

  // })

  // return result;


  try {
    const result = await auth.api.signOut({
      headers: await headers(),
    });


    revalidatePath("/");
    revalidatePath("/login");
    revalidatePath("/dashboard");

    return result
  } catch (err) {
    console.error("Sign out failed:", err);
    throw err;
  }
}
/**
 * Get the current session (can be null if not logged in)
 */
// export const getSessions = async (): Promise<Session | null> => {
//   try {
//     const sessionData = await auth.api.getSession({
//       headers: await headers(),
//     });

//     // sessionData?.session is the actual session object
//     return sessionData?.session ?? null;
//   } catch (err) {
//     console.error("Failed to get session:", err);
//     return null;
//   }
// };

/**
 * Require a session (throw error if not logged in)
 * Useful for protected pages or API routes
 */
// export const requireSession = async (): Promise<Session> => {
//   const session = await getSession();

//   if (!session) {
//     throw new Error("Unauthorized: no active session found");
//   }

//   return session;
// };

/**
 * Sign out the current session
 */
export const signOutt = async (): Promise<void> => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });


    revalidatePath("/");
    revalidatePath("/login");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("Sign out failed:", err);
    throw err;
  }
};
