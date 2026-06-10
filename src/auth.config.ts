import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // Configured in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isProfileRoute = nextUrl.pathname.startsWith("/profile");

      // Admin route protection
      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        // If logged in but not an admin, redirect to store or unauthorized
        if (auth.user.type !== "ADMIN") {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // Customer profile route protection
      if (isProfileRoute) {
        if (!isLoggedIn) return false;
        // Only allow customers to access profile routes
        if (auth.user.type !== "CUSTOMER") {
          return Response.redirect(new URL("/admin/dashboard", nextUrl));
        }
        return true;
      }

      // Public routes (including /checkout for guests) are always allowed
      return true;
    },
    async jwt({ token, user }: any) {
      // Forward custom claims from authorize() to the token
      if (user) {
        token.id = user.id;
        token.type = user.type;
        token.permissions = user.permissions;
        token.roleId = user.roleId;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Expose claims to the client session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.type = token.type as "ADMIN" | "CUSTOMER";
        session.user.permissions = token.permissions as any;
        session.user.roleId = token.roleId as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
} as any;
