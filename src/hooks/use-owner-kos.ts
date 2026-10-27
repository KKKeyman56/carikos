"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listOwnerKos, updateRoomStatus } from "@/lib/api/owner";
import type { RoomStatus } from "@/types";

/** Listings owned by the signed-in owner; disabled when there is no owner id. */
export function useOwnerKos(ownerId: number | null) {
  return useQuery({
    queryKey: ["owner", "kos", ownerId],
    queryFn: () => (ownerId === null ? Promise.resolve([]) : listOwnerKos(ownerId)),
    enabled: ownerId !== null,
  });
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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["owner", "kos"] });
      void queryClient.invalidateQueries({ queryKey: ["kos"] });
    },
  });
}
