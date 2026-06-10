import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Checks if the current session has the required permission.
 * Can be used in both Server Components and Server Actions.
 */
export async function hasPermission(module: string, action: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  if (session.user.type !== "ADMIN") return false;

  const permissions = session.user.permissions || [];

  for (const perm of permissions) {
    // Super Admin check: If module is "*" and actions includes "*", allow all.
    if (perm.module === "*" && perm.actions.includes("*")) {
      return true;
    }

    if (perm.module === module) {
      if (perm.actions.includes("*") || perm.actions.includes(action)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Strictly requires a permission. If the user lacks it, they are redirected to the dashboard.
 * Should be used at the top of protected Server Components and Server Actions.
 */
export async function requirePermission(module: string, action: string) {
  const allowed = await hasPermission(module, action);
  if (!allowed) {
    redirect("/admin/dashboard?error=unauthorized");
  }
}
