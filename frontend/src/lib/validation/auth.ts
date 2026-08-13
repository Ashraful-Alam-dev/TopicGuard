import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Enter your email").email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().min(1, "Enter your email").email("Enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Za-z]/, {
      message: "Password must contain at least one letter",
    })
    .regex(/[0-9]/, {
      message: "Password must contain at least one number",
    }),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});
export type OtpFormValues = z.infer<typeof otpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Enter your email").email("Enter a valid email"),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const newPasswordField = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(/[A-Za-z]/, { message: "Password must contain at least one letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

export const resetPasswordSchema = z
  .object({
    newPassword: newPasswordField,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: newPasswordField,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
