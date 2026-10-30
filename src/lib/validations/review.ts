import { z } from "zod";

/**
 * Review form validation. Rating is a 1-5 integer; the written comment needs
 * enough detail to be useful for other seekers.
 */
export const reviewSchema = z.object({
  rating: z
    .number()
    .int("Rating harus bilangan bulat")
    .min(1, "Pilih rating dulu")
    .max(5, "Rating maksimal 5"),
  comment: z
    .string()
    .trim()
    .min(10, "Ulasan minimal 10 karakter")
    .max(500, "Ulasan maksimal 500 karakter"),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
