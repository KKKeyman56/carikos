# Carikos

Aplikasi pencarian kos untuk mahasiswa dan pemilik kos di sekitar Universitas Gunadarma, Depok. Mayoritas pengguna akses dari HP, jadi semua desain mobile-first.

## Stack

- Next.js (App Router) + TypeScript strict
- Tailwind CSS v4 + shadcn/ui
- TanStack Query — fetch & cache
- React Hook Form + Zod — form & validasi
- Leaflet + OpenStreetMap — peta lokasi (dipakai langsung, tanpa `react-leaflet`)

## Menjalankan

1. `npm install`
2. `cp .env.example .env.local`, isi nilainya
3. `npm run dev`

## Konvensi penting

- Semua request ke backend hanya lewat `src/lib/api/` (baca README di folder itu).
- Tipe data bersama di `src/types/` = single source of truth. Hal yang belum dikonfirmasi backend ditandai `// ASSUMPTION:`.
- Filter pencarian disimpan di URL search params supaya hasil bisa di-share.
- Leaflet tidak support SSR: komponen peta wajib di-load dengan `dynamic(() => import(...), { ssr: false })`.
- Peta pakai Leaflet langsung (`L.map` di dalam `useEffect` + cleanup `map.remove()`), bukan `react-leaflet`. `MapContainer` bawaan `react-leaflet` 5.0.0 nggak StrictMode-safe (React 19 / App Router default), jadi peta error "Map container is being reused by another instance" di dev.
- Setiap halaman yang fetch data wajib punya loading / empty / error state.
- Tombol utama di HP pakai `size="lg"` (target sentuh minimal 44px).

## Git workflow

- Kerja di branch per fitur: `feat/search`, `feat/detail`, `feat/owner-dashboard`, `feat/auth`, dst.
- Jangan push langsung ke `main` — merge lewat PR di GitHub.
- Commit mengikuti Conventional Commits: `feat:`, `fix:`, `chore:`.
- `main` harus selalu deployable; merge ke `main` otomatis deploy ke Vercel.

## Aksesibilitas dasar

Label di setiap input form, alt text di foto, kontras warna cukup (AA), target sentuh minimal 44px di HP.
