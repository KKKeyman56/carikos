import { z } from "zod";

/**
 * Validation for the owner dashboard listing form. Messages are user-facing
 * and must stay in Indonesian.
 *
 * Numbers are registered with `valueAsNumber`, so empty inputs become `NaN`
 * and hit the field-level message instead of Zod's default English one.
 */
const roomSchema = z.object({
  // Present only for rooms that already exist (used to keep status/favorites).
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1, "Nama kamar wajib diisi").max(60, "Maksimal 60 karakter"),
  size: z.string().trim().min(2, "Isi ukuran, contoh 3x4 m").max(20, "Maksimal 20 karakter"),
  monthlyPrice: z
    .number("Isi harga kamar ya")
    .int("Harga harus angka bulat")
    .min(100000, "Minimal Rp 100.000")
    .max(100000000, "Maksimal Rp 100.000.000"),
});

export const kosFormSchema = z.object({
  name: z.string().trim().min(3, "Nama kos minimal 3 karakter").max(80, "Maksimal 80 karakter"),
  description: z
    .string()
    .trim()
    .min(20, "Ceritakan kosnya minimal 20 karakter")
    .max(600, "Maksimal 600 karakter"),
  gender: z.enum(["putra", "putri", "campur"]),
  address: z.string().trim().min(5, "Alamat minimal 5 karakter").max(160, "Maksimal 160 karakter"),
  district: z.string().trim().min(3, "Pilih kecamatan dulu"),
  distanceToCampusKm: z
    .number("Isi jarak ke kampus ya")
    .min(0, "Nggak bisa negatif")
    .max(30, "Maksimal 30 km"),
  latitude: z.number("Isi latitude ya").min(-90, "Minimal -90").max(90, "Maksimal 90"),
  longitude: z.number("Isi longitude ya").min(-180, "Minimal -180").max(180, "Maksimal 180"),
  facilityIds: z.array(z.number().int().positive()),
  rooms: z.array(roomSchema).min(1, "Minimal satu kamar"),
});

export type KosFormData = z.infer<typeof kosFormSchema>;
