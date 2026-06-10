import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Initialize NextAuth with edge-compatible config
export default NextAuth(authConfig as any).auth;

// Matcher to define which routes the middleware should run on.
// We exclude API routes, static files, and images.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
