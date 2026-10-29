import { z } from "zod";

/**
 * Form validation schemas shared between fields and the submitted payload.
 * Messages are user-facing and must stay in Indonesian.
 */
export const loginSchema = z.object({
  email: z.email("Format email nggak valid"),
  password: z.string().min(8, "Minimal 8 karakter"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+62|62|0)8\d{7,11}$/, "Pakai format 08xxxxxxxxxx ya");

const newPasswordSchema = z.string().min(8, "Minimal 8 karakter").regex(/\d/, "Harus ada angkanya");

export const registerSchema = z
  .object({
    name: z.string().trim().min(3, "Nama minimal 3 karakter").max(60, "Nama maksimal 60 karakter"),
    phone: phoneSchema,
    email: z.email("Format email nggak valid"),
    password: newPasswordSchema,
    confirmPassword: z.string().min(8, "Minimal 8 karakter"),
    role: z.enum(["seeker", "owner"]),
    terms: z.boolean().refine((value) => value === true, "Lu wajib setuju ketentuan dulu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password nggak sama",
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(60, "Nama maksimal 60 karakter"),
  phone: phoneSchema,
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Minimal 8 karakter"),
    newPassword: newPasswordSchema,
    confirmPassword: z.string().min(8, "Minimal 8 karakter"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password nggak sama",
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    message: "Password baru harus beda dari yang sekarang",
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
