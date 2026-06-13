"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthWrapper } from "@components/layouts/auth/auth-wrapper";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        type: "ADMIN",
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm font-medium text-white bg-red-500 rounded-none tracking-tight">
          {error}
        </div>
      )}
      <div className="space-y-3">
        <label htmlFor="email" className="text-[11px] uppercase tracking-widest font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          required
          disabled={isLoading}
          className="flex h-12 w-full rounded-none border border-border/40 bg-white px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-black"
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-[11px] uppercase tracking-widest font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Password
          </label>
          <a href="#" className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground hover:text-black transition-colors">
            Forgot password?
          </a>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="flex h-12 w-full rounded-none border border-border/40 bg-white px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-black"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="mt-8 flex h-12 w-full items-center justify-center whitespace-nowrap rounded-none bg-black text-[11px] uppercase tracking-[0.2em] font-bold text-white transition-colors hover:bg-black/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthWrapper title="Welcome back" description="Enter your email to sign in to your account">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </AuthWrapper>
  );
}
