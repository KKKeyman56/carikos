import type { LoginRequest, RegisterRequest, User } from "@/types";

// NOTE: artificial latency so loading states are visible during development;
// drop this once the real API is wired up.
const MOCK_LATENCY_MS = 800;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Structured error codes so forms can render the right Indonesian message. */
export type AuthErrorCode = "EMAIL_PASSWORD_SALAH" | "EMAIL_SUDAH_TERDAFTAR" | "EXCEPTION";

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
const MOCK_USERS: Array<User & { password: string }> = [
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

/** Returns the shared user shape without ever leaking the mock password. */
function toPublicUser(user: User & { password: string }): User {
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
  const match = MOCK_USERS.find(
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
  if (MOCK_USERS.some((user) => user.email === email)) {
    throw new AuthError("EMAIL_SUDAH_TERDAFTAR", "Email ini sudah terdaftar.");
  }

  const created: User & { password: string } = {
    id: Math.max(...MOCK_USERS.map((user) => user.id)) + 1,
    name: payload.name.trim(),
    email,
    phone: payload.phone.trim(),
    // ASSUMPTION: fresh accounts are always seekers; owners pick a role later.
    role: "seeker",
    avatarUrl: null,
    password: payload.password,
  };
  MOCK_USERS.push(created);
  return toPublicUser(created);
}
