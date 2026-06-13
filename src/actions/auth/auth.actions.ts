"use server";

import { signIn, signOut } from "@/auth";
import { LoginInput, LoginSchema, RegisterCustomerInput, RegisterCustomerSchema } from "@/validators/auth/auth.validator";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { AuthService } from "@/server/services/auth.service";

/**
 * Server Action for Admin & Customer Login
 */
export async function loginUser(data: LoginInput) {
  const validatedFields = LoginSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password, type } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      type,
      redirect: false, // Handle redirect manually in component
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error; // Let Next.js handle internal errors like redirects if thrown
  }
}

/**
 * Server Action for Customer Registration
 */
export async function registerCustomer(data: RegisterCustomerInput) {
  const validatedFields = RegisterCustomerSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { name, email, phone, password } = validatedFields.data;

  try {
    // Check if customer already exists
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing && !existing.isGuest) {
      return { error: "Customer already exists with this email" };
    }

    const hashedPassword = await AuthService.hashPassword(password);

    if (existing && existing.isGuest) {
      // Upgrade guest account to full account
      await prisma.customer.update({
        where: { email },
        data: {
          name,
          ...(phone !== undefined && { phone }),
          password: hashedPassword,
          isGuest: false,
        },
      });
    } else {
      // Create new customer
      await prisma.customer.create({
        data: {
          name,
          email,
          ...(phone !== undefined && { phone }),
          password: hashedPassword,
          isGuest: false,
        },
      });
    }

    return { success: true };
  } catch (error) {
    return { error: "Failed to register customer" };
  }
}

/**
 * Server Action for Logout
 */
export async function logoutUser() {
  await signOut({ redirect: false });
  return { success: true };
}
