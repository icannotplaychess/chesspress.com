import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getPrismaClient, prisma } from "@/lib/db";
import { hasDatabaseConfig } from "@/lib/env";
import { verifyPassword } from "@/lib/auth/password";

const googleEnabled =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

function getAdapter() {
  return PrismaAdapter(getPrismaClient());
}

export function createAuthConfig(): NextAuthConfig {
  return {
    // Real Prisma client for OAuth account linking (Proxy can break adapter writes).
    adapter: hasDatabaseConfig() ? getAdapter() : undefined,
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    session: { strategy: "jwt" },
    pages: {
      signIn: "/auth/signin",
      newUser: "/dashboard",
      error: "/auth/error",
    },
    providers: [
      ...(googleEnabled
        ? [
            Google({
              clientId: process.env.GOOGLE_CLIENT_ID!,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
              allowDangerousEmailAccountLinking: true,
            }),
          ]
        : []),
      Credentials({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;
          if (!email || !password) return null;

          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
          });
          if (!user?.passwordHash) return null;

          const valid = await verifyPassword(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user?.id) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user && token.id) {
          session.user.id = token.id as string;
        }
        return session;
      },
      async signIn({ user, account, profile }) {
        if (account?.provider === "google") {
          const email =
            user.email ??
            (profile && "email" in profile
              ? (profile.email as string | undefined)
              : undefined);
          if (!email) {
            console.error("[auth] Google sign-in missing email");
            return false;
          }
        }
        return true;
      },
    },
    events: {
      async createUser({ user }) {
        if (user.id) await ensureUserProfile(user.id);
      },
      async linkAccount({ user }) {
        if (user.id) await ensureUserProfile(user.id);
      },
    },
  };
}

async function ensureUserProfile(userId: string) {
  try {
    await prisma.userProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  } catch (err) {
    console.error("[auth] ensureUserProfile failed:", err);
  }
}
