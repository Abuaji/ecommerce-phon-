import { hasPermission } from "@/lib/auth-utils";
import React from "react";

interface AuthGuardProps {
  module: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function AuthGuard({ module, action, children, fallback = null }: AuthGuardProps) {
  const isAllowed = await hasPermission(module, action);

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
