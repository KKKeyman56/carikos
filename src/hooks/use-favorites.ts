"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { addFavorite, listFavorites, removeFavorite } from "@/lib/api/favorites";
import type { Kos } from "@/types";

function favoritesQueryKey(userId: number) {
  return ["favorites", userId] as const;
}

/**
 * Saved kos for the signed-in user. Guests get an empty list without hitting
 * the API layer (the tabs/pages show a sign-in prompt instead).
 */
export function useFavorites() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: favoritesQueryKey(user?.id ?? 0),
    queryFn: () => (user ? listFavorites(user.id) : Promise.resolve<Kos[]>([])),
    enabled: user !== null,
  });

  return { ...query, favorites: query.data ?? [] };
}

interface ToggleFavoriteVariables {
  kos: Kos;
  /** True when the kos is already saved, meaning this call removes it. */
  saved: boolean;
}

interface ToggleFavoriteContext {
  previous?: Kos[];
}

/**
 * Saves/removes a kos with an optimistic cache update: the heart flips right
 * away and rolls back if the api layer throws.
 */
export function useToggleFavorite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = favoritesQueryKey(user?.id ?? 0);

  return useMutation<void, Error, ToggleFavoriteVariables, ToggleFavoriteContext>({
    mutationFn: async ({ kos, saved }) => {
      if (!user) throw new Error("Masuk dulu untuk menyimpan favorit.");
      if (saved) {
        await removeFavorite(user.id, kos.id);
      } else {
        await addFavorite(user.id, kos.id);
      }
    },
    onMutate: async ({ kos, saved }) => {
      if (!user) return {};
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Kos[]>(queryKey);
      queryClient.setQueryData<Kos[]>(queryKey, (current = []) =>
        saved ? current.filter((item) => item.id !== kos.id) : [kos, ...current],
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      if (user) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
