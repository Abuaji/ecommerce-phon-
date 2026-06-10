import NextAuth from "next-auth";

// Basic NextAuth v5 configuration skeleton
// Providers and database adapters should be added here
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    // Add custom auth callbacks here
  },
});
