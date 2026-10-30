import type { Facility, Kos, KosGender, RoomStatus } from "@/types";

// ASSUMPTION: facility list mirrors what the backend will eventually expose.
export const FACILITIES: Facility[] = [
  { id: 1, name: "WiFi", icon: "wifi" },
  { id: 2, name: "Kamar mandi dalam", icon: "kamar-mandi-dalam" },
  { id: 3, name: "Perabot penuh", icon: "perabot" },
  { id: 4, name: "AC", icon: "ac" },
  { id: 5, name: "Parkir motor", icon: "parkir-motor" },
  { id: 6, name: "Parkir mobil", icon: "parkir-mobil" },
  { id: 7, name: "Listrik tersertakan", icon: "listrik" },
  { id: 8, name: "Dapur bersama", icon: "dapur" },
  { id: 9, name: "Mesin cuci", icon: "mesin-cuci" },
  { id: 10, name: "CCTV & keamanan 24 jam", icon: "cctv" },
  { id: 11, name: "Laundry", icon: "laundry" },
  { id: 12, name: "Area jemuran", icon: "jemuran" },
];

export interface RoomSeed {
  name: string;
  size: string;
  status: RoomStatus;
  monthlyPrice: number;
}

export interface KosSeed {
  id: number;
  ownerId: number;
  name: string;
  description: string;
  gender: KosGender;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  /** Distance to the Universitas Gunadarma Kelapa Dua campus. */
  distanceToCampusKm: number;
  facilityIds: number[];
  rooms: RoomSeed[];
  /** Optional house rules; falls back to a shared default set. */
  rules?: string[];
  ratingAvg: number;
  /** Optional seed count; a deterministic mock value is derived when omitted. */
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
  /** Optional photo overrides; local files are served from /public/photos. */
  photoUrls?: string[];
}

// NOTE: all coordinates and photo URLs are placeholder values; the photo
// service (picsum.photos) only exists while the backend is not ready.
const SEEDS: KosSeed[] = [
  {
    id: 1,
    ownerId: 2,
    name: "Kos Melati Putri",
    description:
      "Kos nyaman di jalan Margonda, 8 menit jalan kaki ke kampus. Kamar luas, lingkungan aman dan tenang.",
    gender: "putri",
    address: "Jl. Margonda Raya No. 12",
    district: "Pancoran Mas",
    latitude: -6.3672,
    longitude: 106.8275,
    distanceToCampusKm: 0.8,
    facilityIds: [1, 2, 3, 7, 10],
    rooms: [
      { name: "Kamar titipan lantai 2", size: "3x3 m", status: "kosong", monthlyPrice: 900000 },
      { name: "Kamar samping", size: "3x4 m", status: "terisi", monthlyPrice: 1050000 },
      { name: "Kamar utama lantai 2", size: "3x4 m", status: "kosong", monthlyPrice: 1150000 },
    ],
    ratingAvg: 4.6,
    createdAt: "2026-08-03T04:00:00.000Z",
    updatedAt: "2026-10-12T02:30:00.000Z",
  },
  {
    id: 2,
    ownerId: 3,
    name: "Griya Cekap Putri",
    description:
      "Kos syariah yang homey di Sempur Kaler, dekat dengan kampus Gunadarma Margonda. Fasilitas lengkap dan count CCTV.",
    gender: "putri",
    address: "Jl. Sempur Kaler No. 3",
    district: "Beji",
    latitude: -6.3618,
    longitude: 106.8441,
    distanceToCampusKm: 1.2,
    facilityIds: [1, 2, 3, 4, 5, 10],
    // Syariah house rules override the shared defaults.
    rules: [
      "Khusus mahasiswi muslimah",
      "Dilarang mengundang tamu lawan jenis",
      "Jam malam pukul 22.00",
      "Dilarang membawa hewan peliharaan",
    ],
    rooms: [
      { name: "Kamar standar", size: "3x3 m", status: "terisi", monthlyPrice: 1100000 },
      { name: "Kamar plus AC", size: "3x4 m", status: "kosong", monthlyPrice: 1400000 },
    ],
    ratingAvg: 4.8,
    createdAt: "2026-08-12T08:00:00.000Z",
    updatedAt: "2026-10-18T04:15:00.000Z",
  },
  {
    id: 3,
    ownerId: 2,
    name: "Kos Kukusan 22",
    description:
      "Harga kantong mahasiswa, jalanan Kukusan yang dekat ke banyak kampus. Pas buat yang mau hemat dan ramai.",
    gender: "campur",
    address: "Jl. Kukusan Raya No. 22",
    district: "Beji",
    latitude: -6.3512,
    longitude: 106.8336,
    distanceToCampusKm: 1.8,
    facilityIds: [2, 3, 5],
    rooms: [
      { name: "Kamar bawah", size: "3x3 m", status: "kosong", monthlyPrice: 650000 },
      { name: "Kamar atas", size: "3x4 m", status: "terisi", monthlyPrice: 850000 },
    ],
    ratingAvg: 4.2,
    createdAt: "2026-08-20T11:00:00.000Z",
    updatedAt: "2026-10-20T01:00:00.000Z",
  },
  {
    id: 4,
    ownerId: 4,
    name: "D'Cimanggis Putra",
    description:
      "Kamar luas dengan parkir lega, cocok buat yang bawa motor sendiri ke kampus via terminal Cimanggis.",
    gender: "putra",
    address: "Jl. Cimanggis No. 8",
    district: "Cimanggis",
    latitude: -6.3792,
    longitude: 106.8506,
    distanceToCampusKm: 3.2,
    facilityIds: [3, 5, 9, 12],
    rooms: [
      { name: "Kamar depan", size: "3x4 m", status: "terisi", monthlyPrice: 900000 },
      { name: "Kamar belakang", size: "3x3 m", status: "kosong", monthlyPrice: 700000 },
    ],
    ratingAvg: 4.1,
    createdAt: "2026-09-01T06:00:00.000Z",
    updatedAt: "2026-10-08T03:00:00.000Z",
  },
  {
    id: 5,
    ownerId: 5,
    name: "Asri Family Kos",
    description:
      "Konsep yang family-friendly dan homey di Passi Lane Limo, dapur bersama + area jemuran.",
    gender: "campur",
    address: "Jl. Nusantara Raya No. 45",
    district: "Limo",
    latitude: -6.3545,
    longitude: 106.7998,
    distanceToCampusKm: 4.6,
    facilityIds: [5, 8, 9, 12],
    rooms: [
      { name: "Kamar minim dapur", size: "3x4 m", status: "kosong", monthlyPrice: 550000 },
      { name: "Kamar umum", size: "4x5 m", status: "kosong", monthlyPrice: 750000 },
    ],
    ratingAvg: 3.9,
    createdAt: "2026-09-04T07:30:00.000Z",
    updatedAt: "2026-10-15T02:00:00.000Z",
  },
  {
    id: 6,
    ownerId: 3,
    name: "Wisma Pelangi Putri",
    description:
      "Kamar 3x4 m bermutu jauh AC, WiFi kenceng, dan mesin cuci di lantai basement Bangunan 2.",
    gender: "putri",
    address: "Jl. Tanah Baru No. 27",
    district: "Beji",
    latitude: -6.3598,
    longitude: 106.8385,
    distanceToCampusKm: 2.4,
    facilityIds: [1, 2, 3, 4, 9, 10],
    rooms: [
      { name: "Kamar standar", size: "3x4 m", status: "terisi", monthlyPrice: 950000 },
      { name: "Kamar AC utara", size: "3x4 m", status: "kosong", monthlyPrice: 1200000 },
    ],
    ratingAvg: 4.5,
    createdAt: "2026-09-09T09:00:00.000Z",
    updatedAt: "2026-10-19T05:00:00.000Z",
    photoUrls: [
      "/photos/kamar-boho.webp",
      "https://picsum.photos/seed/carikos-wisma-pelangi-putri-2/640/480",
      "https://picsum.photos/seed/carikos-wisma-pelangi-putri-3/640/480",
    ],
  },
  {
    id: 7,
    ownerId: 6,
    name: "Kos Sehati Putra",
    description:
      "Paling ekonomis se-Sawangan. Listrik tersertakan dan dapur bersama, buat yang nabung besar buat ngidup.",
    gender: "putra",
    address: "Jl. Sawangan Indah No. 9",
    district: "Sawangan",
    latitude: -6.3985,
    longitude: 106.8199,
    distanceToCampusKm: 6.1,
    facilityIds: [5, 8],
    rooms: [
      { name: "Kamar 1", size: "3x3 m", status: "terisi", monthlyPrice: 650000 },
      { name: "Kamar 2", size: "3x3 m", status: "kosong", monthlyPrice: 480000 },
    ],
    ratingAvg: 3.8,
    createdAt: "2026-09-13T10:00:00.000Z",
    updatedAt: "2026-10-10T01:30:00.000Z",
  },
  {
    id: 8,
    ownerId: 4,
    name: "Green House Kost",
    description:
      "Konsep minimalis fusion tertutup, area parkir mobil luas dan CCTV Agrises 24 jam.",
    gender: "campur",
    address: "Jl. Citayam Raya No. 60",
    district: "Sukmajaya",
    latitude: -6.3565,
    longitude: 106.865,
    distanceToCampusKm: 5.3,
    facilityIds: [1, 2, 5, 6, 10],
    rooms: [
      { name: "Kamar atas", size: "3x4 m", status: "kosong", monthlyPrice: 680000 },
      { name: "Kamar taman", size: "4x4 m", status: "terisi", monthlyPrice: 950000 },
    ],
    ratingAvg: 4.3,
    createdAt: "2026-09-17T12:00:00.000Z",
    updatedAt: "2026-10-21T04:00:00.000Z",
  },
  {
    id: 9,
    ownerId: 2,
    name: "Kelapa Dua Boarding House",
    description:
      "Premium kos baru di sebelah kampus Gunadarma Kelapa Dua, 2 menit jalan saja dan fasilitas full.",
    gender: "putri",
    address: "Jl. Kelapa Dua Raya No. 15",
    district: "Beji",
    latitude: -6.3612,
    longitude: 106.8307,
    distanceToCampusKm: 0.6,
    facilityIds: [1, 2, 3, 4, 7, 10],
    rooms: [
      { name: "Kamar regulasi", size: "3x4 m", status: "terisi", monthlyPrice: 1250000 },
      { name: "Kamar obsi olu", size: "3x5 m", status: "kosong", monthlyPrice: 1600000 },
    ],
    ratingAvg: 4.9,
    createdAt: "2026-09-21T08:30:00.000Z",
    updatedAt: "2026-10-22T07:00:00.000Z",
    photoUrls: [
      "/photos/kamar-boho.webp",
      "https://picsum.photos/seed/carikos-kelapa-dua-boarding-house-2/640/480",
      "https://picsum.photos/seed/carikos-kelapa-dua-boarding-house-3/640/480",
    ],
  },
  {
    id: 10,
    ownerId: 6,
    name: "Kost Citra Ehsan",
    description:
      "Kos simpel buat aktifnonjara yang hari-hari ke kampus via depan Cilodong, ada area jemuran luas.",
    gender: "putra",
    address: "Jl. Kalimulya No. 11",
    district: "Cilodong",
    latitude: -6.3819,
    longitude: 106.8494,
    distanceToCampusKm: 4.2,
    facilityIds: [3, 5, 12],
    rooms: [
      { name: "Kamar bulan depan", size: "3x3 m", status: "kosong", monthlyPrice: 600000 },
      { name: "Kamar tengah", size: "3x4 m", status: "terisi", monthlyPrice: 800000 },
    ],
    ratingAvg: 4.0,
    createdAt: "2026-09-25T05:00:00.000Z",
    updatedAt: "2026-10-14T06:00:00.000Z",
  },
  {
    id: 11,
    ownerId: 5,
    name: "Ariwibowo Residence",
    description:
      "Sensasi rumahan di Tapos, dapur bersama lebih dari dugaan dan mesin cuci tersedia.",
    gender: "campur",
    address: "Jl. Mulya Asri No. 4",
    district: "Tapos",
    latitude: -6.3768,
    longitude: 106.8764,
    distanceToCampusKm: 7.4,
    facilityIds: [5, 8, 9],
    rooms: [
      { name: "Kamar kiri", size: "3x4 m", status: "kosong", monthlyPrice: 520000 },
      { name: "Kamar kanan", size: "3x4 m", status: "terisi", monthlyPrice: 700000 },
    ],
    ratingAvg: 3.7,
    createdAt: "2026-09-28T03:30:00.000Z",
    updatedAt: "2026-10-05T02:00:00.000Z",
  },
  {
    id: 12,
    ownerId: 4,
    name: "Mustika Putra Kos",
    description:
      "Full fasilitas di harga pas, listrik pasalnya tersertakan dan WiFi kenceng sui paso.",
    gender: "putra",
    address: "Jl. Salak Asri No. 18",
    district: "Sukmajaya",
    latitude: -6.3679,
    longitude: 106.8616,
    distanceToCampusKm: 4.1,
    facilityIds: [1, 2, 3, 5, 7],
    rooms: [
      { name: "Kamar standar", size: "3x3 m", status: "terisi", monthlyPrice: 750000 },
      { name: "Kamar premium", size: "3x4 m", status: "kosong", monthlyPrice: 980000 },
    ],
    ratingAvg: 4.4,
    createdAt: "2026-10-01T09:30:00.000Z",
    updatedAt: "2026-10-17T04:00:00.000Z",
  },
  {
    id: 13,
    ownerId: 7,
    name: "Riza Putri Syariah",
    description:
      "Kos syariah bersih di Limo, kamar mandi dalam dan area jemuran kecil yang malang semi.",
    gender: "putri",
    address: "Jl. Krukut Raya No. 7",
    district: "Limo",
    latitude: -6.3459,
    longitude: 106.8067,
    distanceToCampusKm: 3.8,
    facilityIds: [2, 3, 7, 12],
    // Syariah house rules override the shared defaults.
    rules: [
      "Khusus mahasiswi muslimah",
      "Dilarang mengundang tamu lawan jenis",
      "Jam malam pukul 22.00",
    ],
    rooms: [
      { name: "Kamar atas", size: "3x4 m", status: "kosong", monthlyPrice: 850000 },
      { name: "Kamar bawah", size: "3x4 m", status: "terisi", monthlyPrice: 1100000 },
    ],
    ratingAvg: 4.2,
    createdAt: "2026-10-05T06:00:00.000Z",
    updatedAt: "2026-10-20T03:00:00.000Z",
  },
  {
    id: 14,
    ownerId: 6,
    name: "Kost Budi Agung",
    description: "Simpel nan asri di Cilodong, ramai anak kampus karena jalur bunster ke kampus.",
    gender: "campur",
    address: "Jl. Jatimulya Raya No. 13",
    district: "Cilodong",
    latitude: -6.3912,
    longitude: 106.8456,
    distanceToCampusKm: 3.4,
    facilityIds: [3, 5, 10],
    rooms: [
      { name: "Kamar 101", size: "3x3 m", status: "terisi", monthlyPrice: 820000 },
      { name: "Kamar 102", size: "3x3 m", status: "kosong", monthlyPrice: 620000 },
    ],
    ratingAvg: 4.0,
    createdAt: "2026-10-09T10:30:00.000Z",
    updatedAt: "2026-10-18T05:30:00.000Z",
  },
  {
    id: 15,
    ownerId: 7,
    name: "Pondok Dara Asri",
    description:
      "Nyaman buat APARTMENT alternatif lu, harga pas dengan semua fasilitas kecil yang decent.",
    gender: "putri",
    address: "Jl. Citayam Sawah No. 44",
    district: "Sukmajaya",
    latitude: -6.3508,
    longitude: 106.8857,
    distanceToCampusKm: 6.8,
    facilityIds: [2, 5, 9, 12],
    rooms: [
      { name: "Kamar motif", size: "3x4 m", status: "kosong", monthlyPrice: 540000 },
      { name: "Kamar mezzanine", size: "3x4 m", status: "terisi", monthlyPrice: 720000 },
    ],
    ratingAvg: 3.9,
    createdAt: "2026-10-14T02:00:00.000Z",
    updatedAt: "2026-10-22T01:00:00.000Z",
  },
];

const facilityById = new Map(FACILITIES.map((facility) => [facility.id, facility]));

/** Default house rules for kos without an explicit list in the seed. */
export const DEFAULT_RULES = [
  "Dilarang mengundang tamu menginap tanpa izin pemilik",
  "Tagihan sewa jatuh tempo setiap tanggal 1",
  "Dilarang membawa hewan peliharaan",
  "Tidak ada jam malam — akses pintu 24 jam",
];

/**
 * ASSUMPTION: deterministic placeholder contact number derived from the seed
 * IDs. Replace with real owner data once the API lands.
 */
export function placeholderOwnerPhone(seedId: number, ownerId: number): string {
  return `0812${String(seedId).padStart(4, "0")}${String(ownerId).padStart(2, "0")}9`;
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Expands a compact seed record into the full shared `Kos` shape. */
function kosFromSeed(seed: KosSeed): Kos {
  const slug = toSlug(seed.name);
  const prices = seed.rooms.map((room) => room.monthlyPrice);
  return {
    id: seed.id,
    ownerId: seed.ownerId,
    name: seed.name,
    slug,
    description: seed.description,
    gender: seed.gender,
    address: seed.address,
    district: seed.district,
    city: "Depok",
    latitude: seed.latitude,
    longitude: seed.longitude,
    distanceToCampusKm: seed.distanceToCampusKm,
    monthlyPriceMin: Math.min(...prices),
    monthlyPriceMax: Math.max(...prices),
    facilities: seed.facilityIds.flatMap((id) => {
      const facility = facilityById.get(id);
      return facility ? [facility] : [];
    }),
    rooms: seed.rooms.map((room, index) => ({
      id: seed.id * 100 + index,
      kosId: seed.id,
      ...room,
    })),
    photoUrls:
      seed.photoUrls ??
      [1, 2, 3].map((n) => `https://picsum.photos/seed/carikos-${slug}-${n}/640/480`),
    rules: seed.rules ?? DEFAULT_RULES,
    ownerPhone: placeholderOwnerPhone(seed.id, seed.ownerId),
    ratingAvg: seed.ratingAvg,
    // ASSUMPTION: seed listings already have historical ratings without text;
    // the backend will return the real count once reviews are persisted there.
    reviewCount: seed.reviewCount ?? 8 + ((seed.id * 7) % 40),
    createdAt: seed.createdAt,
    updatedAt: seed.updatedAt,
  };
}

export const MOCK_KOS: Kos[] = SEEDS.map(kosFromSeed);
