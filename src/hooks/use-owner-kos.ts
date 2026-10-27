"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createKos, listOwnerKos, updateKos, updateRoomStatus } from "@/lib/api/owner";
import type { KosInput, RoomStatus } from "@/types";

/** Listings owned by the signed-in owner; disabled when there is no owner id. */
export function useOwnerKos(ownerId: number | null) {
  return useQuery({
    queryKey: ["owner", "kos", ownerId],
    queryFn: () => (ownerId === null ? Promise.resolve([]) : listOwnerKos(ownerId)),
    enabled: ownerId !== null,
  });
}

/** Refresh every view that renders listing data after a write. */
function invalidateListingQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["owner", "kos"] });
  void queryClient.invalidateQueries({ queryKey: ["kos"] });
  void queryClient.invalidateQueries({ queryKey: ["favorites"] });
}

interface UpdateRoomStatusVariables {
  kosId: number;
  roomId: number;
  status: RoomStatus;
}

/**
 * Saves a room availability change, then refreshes the dashboard and the
 * public kos queries so search/detail show the new status right away.
 */
export function useUpdateRoomStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ kosId, roomId, status }: UpdateRoomStatusVariables) =>
      updateRoomStatus(kosId, roomId, status),
    onSuccess: () => invalidateListingQueries(queryClient),
  });
}

interface CreateKosVariables {
  ownerId: number;
  input: KosInput;
}

/** Creates a listing for the signed-in owner. */
export function useCreateKos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ownerId, input }: CreateKosVariables) => createKos(ownerId, input),
    onSuccess: () => invalidateListingQueries(queryClient),
  });
}

interface UpdateKosVariables {
  ownerId: number;
  kosId: number;
  input: KosInput;
}

/** Updates one of the owner's listings. */
export function useUpdateKos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ownerId, kosId, input }: UpdateKosVariables) => updateKos(ownerId, kosId, input),
    onSuccess: () => invalidateListingQueries(queryClient),
  });
}
