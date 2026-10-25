/**
 * Pre-dev guard: Turbopack occasionally leaves suffixed marker files
 * (e.g. `CURRENT-LAPTOP-0KU3S2J4`) in its persistent cache. The next
 * `next dev` boot then fails with:
 *
 *   Failed to open database
 *   Unexpected file in persistence directory: ...CURRENT-<hostname>
 *
 * This script detects those leftovers and clears the cache contents
 * before the dev server starts. It deletes entries INSIDE the cache dir
 * (so the OneDrive junction at `.next/dev/cache` stays intact) and is a
 * no-op when the cache is clean.
 */
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const cacheDir = join(".next", "dev", "cache");

/** Suffixed marker files that make Turbopack refuse to open the database. */
const isPolluted = (name) => /^(CURRENT|LOG)-.+/.test(name);

function listEntries(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

/** Depth-limited walk: markers live at `cache/turbopack/v<version>/`. */
function hasPollution(dir, depth = 0) {
  if (depth > 6) return false;
  for (const entry of listEntries(dir)) {
    if (isPolluted(entry.name)) return true;
    if (entry.isDirectory() && hasPollution(join(dir, entry.name), depth + 1)) return true;
  }
  return false;
}

try {
  if (!existsSync(cacheDir)) {
    process.exit(0);
  }

  if (hasPollution(cacheDir)) {
    // Clear contents only: keeps `.next/dev/cache` (junction) itself alive.
    for (const entry of listEntries(cacheDir)) {
      rmSync(join(cacheDir, entry.name), { recursive: true, force: true });
    }
    console.log(
      "[dev-guard] Polluted Turbopack cache detected - cleared cache contents (junction preserved).",
    );
  }
} catch (error) {
  // Never block `npm run dev` because of the guard itself.
  console.warn(`[dev-guard] skipped: ${error instanceof Error ? error.message : String(error)}`);
}
