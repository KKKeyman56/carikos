"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { listReviews, saveReview } from "@/lib/api/reviews";
import type { Review, ReviewInput } from "@/types";

function reviewsQueryKey(kosId: number) {
  return ["reviews", kosId] as const;
}

/** Written reviews for one kos. Shared by the list and the form prefill. */
export function useReviews(kosId: number) {
  const query = useQuery({
    queryKey: reviewsQueryKey(kosId),
    queryFn: () => listReviews(kosId),
  });

  return { ...query, reviews: query.data ?? [] };
}

/**
 * Creates or updates the signed-in user's review. Refreshes the review list,
 * plus kos/favorite queries so the new rating aggregate shows up everywhere.
 */
export function useSaveReview(kosId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Review, Error, ReviewInput>({
    mutationFn: (input) => {
      if (!user) return Promise.reject(new Error("Masuk dulu buat nulis ulasan."));
      return saveReview(kosId, { id: user.id, name: user.name }, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewsQueryKey(kosId) });
      void queryClient.invalidateQueries({ queryKey: ["kos"] });
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
