import NextAuth from "next-auth";
import { createAuthConfig } from "@/lib/auth/config";

export const { handlers, auth, signIn, signOut } = NextAuth(createAuthConfig());
