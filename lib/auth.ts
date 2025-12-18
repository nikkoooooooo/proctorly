import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "@/lib/schema";


// need to npx drizzle-kit push to update the evrification field to add the value field on it
// the error here is just sbacially of the drizzle and the ebtter auth not talking well with each
// other due to schema problems
// things i need to learn well:
// TODO: understand the pre scehema need in adapter, learn building with drizzle, and learn well better auth
// never QUIT

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }, ),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
