import type { Kos, Review } from "@/types";

/**
 * Mock-only storage for written reviews.
 *
 * Reviews are kept as an overlay in localStorage so the feature works before
 * the backend exists. The seeded catalogue keeps its historical aggregate in
 * `Kos.ratingAvg` + `Kos.reviewCount`; this module folds the written reviews
 * into that aggregate whenever kos data is read through the api layer.
 *
 * ASSUMPTION: the real backend will expose `GET /kos/:id/reviews` and
 * `POST /kos/:id/reviews`, and will compute the aggregate server-side.
 */
const STORAGE_KEY = "carikos.reviews";

/** Minimal runtime guard so corrupted localStorage cannot break the app. */
function isReview(value: unknown): value is Review {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.kosId === "number" &&
    typeof candidate.userId === "number" &&
    typeof candidate.userName === "string" &&
    typeof candidate.rating === "number" &&
    candidate.rating >= 1 &&
    candidate.rating <= 5 &&
    typeof candidate.comment === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
}

/** All stored reviews across listings, oldest first. */
export function readStoredReviews(): Review[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isReview);
  } catch {
    return [];
  }
}

export function saveStoredReviews(reviews: Review[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

/**
 * Recomputes the public rating aggregate from the seed rating (weighted by
 * `reviewCount`) plus written reviews stored in this browser.
 */
export function withReviewAggregates(kosList: Kos[]): Kos[] {
  const reviews = readStoredReviews();
  if (reviews.length === 0) return kosList;

  const reviewsByKos = new Map<number, Review[]>();
  for (const review of reviews) {
    const list = reviewsByKos.get(review.kosId);
    if (list) {
      list.push(review);
    } else {
      reviewsByKos.set(review.kosId, [review]);
    }
  }

  return kosList.map((kos) => {
    const list = reviewsByKos.get(kos.id);
    if (!list || list.length === 0) return kos;

    const baseCount = Number.isFinite(kos.reviewCount) ? kos.reviewCount : 0;
    const total = baseCount + list.length;
    const ratingSum =
      kos.ratingAvg * baseCount + list.reduce((sum, review) => sum + review.rating, 0);

    return {
      ...kos,
      ratingAvg: Math.round((ratingSum / total) * 10) / 10,
      reviewCount: total,
    };
  });
}
