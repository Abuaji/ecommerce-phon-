import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  // 'type' is inferred by the UI (e.g., admin login vs customer login) but we can accept it if needed.
  type: z.enum(["ADMIN", "CUSTOMER"]).default("CUSTOMER"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterCustomerInput = z.infer<typeof RegisterCustomerSchema>;
