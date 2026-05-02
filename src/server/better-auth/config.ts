import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_BASE_URL,
  trustedOrigins: [
    env.BETTER_AUTH_BASE_URL,
    "http://localhost:3000",
    "/\.vercel\.app$/",
  ],
  database: prismaAdapter(db, {
    provider: "postgresql", // or "sqlite" or "mysql"
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
  socialProviders: {
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
      redirectURI: `${env.BETTER_AUTH_BASE_URL}/api/auth/callback/github`,
    },
  },
  advanced: {
    cookies: {
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
        },
      },
      callbackUrl: {
        attributes: {
          sameSite: "none",
          secure: true,
        },
      },
      csrfToken: {
        attributes: {
          sameSite: "none",
          secure: true,
        },
      },
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
