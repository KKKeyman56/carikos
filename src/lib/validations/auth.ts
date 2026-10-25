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

export const registerSchema = z
  .object({
    name: z.string().trim().min(3, "Nama minimal 3 karakter").max(60, "Nama maksimal 60 karakter"),
    phone: z
      .string()
      .trim()
      .regex(/^(?:\+62|62|0)8\d{7,11}$/, "Pakai format 08xxxxxxxxxx ya"),
    email: z.email("Format email nggak valid"),
    password: z.string().min(8, "Minimal 8 karakter").regex(/\d/, "Harus ada angkanya"),
    confirmPassword: z.string().min(8, "Minimal 8 karakter"),
    terms: z.boolean().refine((value) => value === true, "Lu wajib setuju ketentuan dulu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password nggak sama",
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
