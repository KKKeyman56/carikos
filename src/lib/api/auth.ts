import type {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
} from "@/types";

// NOTE: artificial latency so loading states are visible during development;
// drop this once the real API is wired up.
const MOCK_LATENCY_MS = 800;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Structured error codes so forms can render the right Indonesian message. */
export type AuthErrorCode =
  | "EMAIL_PASSWORD_SALAH"
  | "EMAIL_SUDAH_TERDAFTAR"
  | "PASSWORD_LAMA_SALAH"
  | "USER_TIDAK_DITEMUKAN"
  | "EXCEPTION";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * ASSUMPTION: mock credential store. Two pre-registered accounts exist so the
 * login flow can be demoed without registering first (and so the
 * "email sudah terdaftar" path is reachable). Plaintext passwords exist only
 * in this mock; never do this against a real backend.
 */
interface StoredUser extends User {
  password: string;
}

const SEED_USERS: StoredUser[] = [
  {
    // id matches the ownerId of the mock listings owned by this account.
    id: 2,
    name: "Budi Santoso",
    email: "pemilik@example.com",
    phone: "081234560003",
    role: "owner",
    avatarUrl: null,
    password: "password123",
  },
  {
    id: 1001,
    name: "Ayu Purnama",
    email: "ayu@example.com",
    phone: "081234560001",
    role: "seeker",
    avatarUrl: null,
    password: "password123",
  },
  {
    id: 1002,
    name: "Bayu Ananda",
    email: "bayu@example.com",
    phone: "081234560002",
    role: "seeker",
    avatarUrl: null,
    password: "password123",
  },
];

/** Where self-registered mock accounts live so they survive page reloads. */
const REGISTERED_USERS_KEY = "carikos.registeredUsers";

/**
 * Profile edits and password changes are stored as a patch per user id, so
 * seeded accounts can be edited without rewriting the constant above.
 *
 * ASSUMPTION: the real backend persists these fields itself; this overlay is
 * only scaffolding for the mock phase.
 */
const USER_PATCHES_KEY = "carikos.userPatches";

function loadRegisteredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(REGISTERED_USERS_KEY);
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is StoredUser =>
        typeof entry === "object" &&
        entry !== null &&
        "id" in entry &&
        "email" in entry &&
        "password" in entry,
    );
  } catch {
    return [];
  }
}

function persistRegisteredUsers(users: StoredUser[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function loadUserPatches(): Record<string, Partial<StoredUser>> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(USER_PATCHES_KEY);
  if (raw === null) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    return parsed as Record<string, Partial<StoredUser>>;
  } catch {
    return {};
  }
}

function saveUserPatch(userId: number, patch: Partial<StoredUser>): void {
  if (typeof window === "undefined") return;
  const patches = loadUserPatches();
  const key = String(userId);
  patches[key] = { ...patches[key], ...patch };
  window.localStorage.setItem(USER_PATCHES_KEY, JSON.stringify(patches));
}

/** Applies a stored patch field-by-field so corrupted data cannot swap ids. */
function applyPatch(user: StoredUser, patch: Partial<StoredUser>): StoredUser {
  return {
    ...user,
    name: typeof patch.name === "string" ? patch.name : user.name,
    phone: typeof patch.phone === "string" ? patch.phone : user.phone,
    password: typeof patch.password === "string" ? patch.password : user.password,
    avatarUrl:
      patch.avatarUrl === null || typeof patch.avatarUrl === "string"
        ? patch.avatarUrl
        : user.avatarUrl,
  };
}

/** Seed accounts + accounts registered in this browser, with patches applied. */
function allUsers(): StoredUser[] {
  const patches = loadUserPatches();
  return [...SEED_USERS, ...loadRegisteredUsers()].map((user) => {
    const patch = patches[String(user.id)];
    return patch ? applyPatch(user, patch) : user;
  });
}

/** Returns the shared user shape without ever leaking the mock password. */
function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

/**
 * Signs in with email + password.
 *
 * NOTE: mock implementation — replace the body with a POST to
 * `${NEXT_PUBLIC_API_BASE_URL}/auth/login` and keep this exact signature.
 * Throws `AuthError` with code `EMAIL_PASSWORD_SALAH` on bad credentials.
 */
export async function login(credentials: LoginRequest): Promise<User> {
  await sleep(MOCK_LATENCY_MS);

  const email = credentials.email.trim().toLowerCase();
  const match = allUsers().find(
    (user) => user.email === email && user.password === credentials.password,
  );
  if (!match) {
    throw new AuthError("EMAIL_PASSWORD_SALAH", "Email atau password salah.");
  }
  return toPublicUser(match);
}

/**
 * Creates an account and signs the new user in.
 *
 * NOTE: mock implementation — replace the body with a POST to
 * `${NEXT_PUBLIC_API_BASE_URL}/auth/register`. Throws `AuthError` with code
 * `EMAIL_SUDAH_TERDAFTAR` when the address is taken (client-side checked).
 */
export async function register(payload: RegisterRequest): Promise<User> {
  await sleep(MOCK_LATENCY_MS);

  const email = payload.email.trim().toLowerCase();
  if (allUsers().some((user) => user.email === email)) {
    throw new AuthError("EMAIL_SUDAH_TERDAFTAR", "Email ini sudah terdaftar.");
  }

  const withPassword: StoredUser[] = loadRegisteredUsers();
  const created: StoredUser = {
    id: Math.max(...allUsers().map((user) => user.id)) + 1,
    name: payload.name.trim(),
    email,
    phone: payload.phone.trim(),
    // Role comes straight from the signup form (seeker / owner).
    role: payload.role,
    avatarUrl: null,
    password: payload.password,
  };
  // Persist so the account survives reloads; real auth lives server-side.
  withPassword.push(created);
  persistRegisteredUsers(withPassword);
  return toPublicUser(created);
}

/**
 * Updates the signed-in user's name and phone number.
 *
 * NOTE: mock implementation — replace the body with a PATCH to
 * `${NEXT_PUBLIC_API_BASE_URL}/auth/me` and keep this exact signature.
 * ASSUMPTION: listings keep their own copy of the owner phone in the mock; the
 * real backend reads the current owner contact on every request.
 */
export async function updateProfile(userId: number, input: UpdateProfileRequest): Promise<User> {
  await sleep(MOCK_LATENCY_MS);

  const user = allUsers().find((item) => item.id === userId);
  if (!user) {
    throw new AuthError("USER_TIDAK_DITEMUKAN", "Akun nggak ditemukan.");
  }

  const patch = { name: input.name.trim(), phone: input.phone.trim() };
  saveUserPatch(userId, patch);
  return toPublicUser({ ...user, ...patch });
}

/**
 * Changes the password after checking the current one.
 *
 * NOTE: mock implementation — replace the body with a POST to
 * `${NEXT_PUBLIC_API_BASE_URL}/auth/change-password`. Throws `AuthError` with
 * code `PASSWORD_LAMA_SALAH` when the current password does not match.
 */
export async function changePassword(userId: number, input: ChangePasswordRequest): Promise<void> {
  await sleep(MOCK_LATENCY_MS);

  const user = allUsers().find((item) => item.id === userId);
  if (!user) {
    throw new AuthError("USER_TIDAK_DITEMUKAN", "Akun nggak ditemukan.");
  }
  if (user.password !== input.currentPassword) {
    throw new AuthError("PASSWORD_LAMA_SALAH", "Password sekarang salah.");
  }

  saveUserPatch(userId, { password: input.newPassword });
}
