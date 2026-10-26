# `lib/api` — satu-satunya tempat yang tahu soal API

Aturan layer ini:

1. Komponen dan halaman **dilarang fetch langsung** ke backend. Semua request lewat fungsi di folder ini.
2. Belum ada kontrak API final → fungsi di sini dulu mengembalikan data dari `src/mocks/` (mock-first).
3. Saat backend siap: cukup ganti isi fungsi jadi `fetch` beneran. Signature dan return type dari `src/types/` **tidak berubah**, komponen tidak perlu diubah sama sekali.
4. Data dipakai lewat TanStack Query di level halaman/hook, bukan dipanggil langsung di komponen kecil.

Hal yang belum dikonfirmasi backend ditandai komentar `// ASSUMPTION:`.
