import type { Review, ReviewInput } from "@/types";

import { getAllKos } from "@/mocks/owner-kos-store";
import { readStoredReviews, saveStoredReviews } from "@/mocks/reviews";

// NOTE: artificial latency so loading states are visible during development;
// drop this once the real API is wired up.
const MOCK_LATENCY_MS = 350;

const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Author fields the api layer needs to persist a review. */
export interface ReviewAuthor {
  id: number;
  name: string;
}

/**
 * Lists written reviews for one kos, newest first.
 *
 * NOTE: mock implementation — replace the body with a GET to
 * `${NEXT_PUBLIC_API_BASE_URL}/kos/${kosId}/reviews` and keep this signature.
 */
export async function listReviews(kosId: number): Promise<Review[]> {
  await sleep(MOCK_LATENCY_MS);

  return readStoredReviews()
    .filter((review) => review.kosId === kosId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/**
 * Creates a review, or updates the signed-in user's existing review for this
 * kos (one review per user per listing).
 *
 * NOTE: mock implementation — replace the body with a POST/PUT to
 * `${NEXT_PUBLIC_API_BASE_URL}/kos/${kosId}/reviews`. ASSUMPTION: the real API
 * derives the author and timestamps from the session.
 */
export async function saveReview(
  kosId: number,
  author: ReviewAuthor,
  input: ReviewInput,
): Promise<Review> {
  await sleep(MOCK_LATENCY_MS);

  const kos = getAllKos().find((item) => item.id === kosId);
  if (!kos) {
    throw new Error("Kos tidak ditemukan.");
  }
  if (kos.ownerId === author.id) {
    throw new Error("Pemilik kos nggak bisa ngasih ulasan untuk listing sendiri.");
  }

  const rating = Math.round(input.rating);
  if (rating < 1 || rating > 5) {
    throw new Error("Rating harus antara 1 sampai 5.");
  }

  const comment = input.comment.trim();
  if (comment.length < MIN_COMMENT_LENGTH) {
    throw new Error(`Ulasan minimal ${MIN_COMMENT_LENGTH} karakter.`);
  }
  if (comment.length > MAX_COMMENT_LENGTH) {
    throw new Error(`Ulasan maksimal ${MAX_COMMENT_LENGTH} karakter.`);
  }

  const reviews = readStoredReviews();
  const existingIndex = reviews.findIndex(
    (review) => review.kosId === kosId && review.userId === author.id,
  );
  const now = new Date().toISOString();

  const review: Review =
    existingIndex >= 0
      ? {
          ...reviews[existingIndex],
          userName: author.name.trim() || reviews[existingIndex].userName,
          rating,
          comment,
          updatedAt: now,
        }
      : {
          id: reviews.reduce((max, item) => Math.max(max, item.id), 0) + 1,
          kosId,
          userId: author.id,
          userName: author.name.trim(),
          rating,
          comment,
          createdAt: now,
          updatedAt: now,
        };

  if (existingIndex >= 0) {
    reviews[existingIndex] = review;
  } else {
    reviews.push(review);
  }
  saveStoredReviews(reviews);

  return review;
}
