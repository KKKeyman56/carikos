"use client";

import { DoorClosed, DoorOpen, MapPin, Plus } from "lucide-react";
import Link from "next/link";

import { OwnerOnlyNotice, OwnerSignInPrompt } from "@/components/owner/owner-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useOwnerKos, useUpdateRoomStatus } from "@/hooks/use-owner-kos";
import { formatIDR } from "@/lib/format";
import type { Kos, Room } from "@/types";

function DashboardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="py-4">
            <CardContent className="px-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-7 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index} className="mt-4 py-4">
          <CardContent className="flex flex-col gap-3 px-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-heading text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

interface RoomRowProps {
  kos: Kos;
  room: Room;
  pending: boolean;
  onToggle: (kos: Kos, room: Room) => void;
}

function RoomRow({ kos, room, pending, onToggle }: RoomRowProps) {
  const isAvailable = room.status === "kosong";

  return (
    <li className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 font-medium">
          {isAvailable ? (
            <DoorOpen aria-hidden="true" className="size-4 text-success" />
          ) : (
            <DoorClosed aria-hidden="true" className="size-4 text-muted-foreground" />
          )}
          {room.name}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {room.size} · {formatIDR(room.monthlyPrice)}/bulan
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant={isAvailable ? undefined : "secondary"}
          className={isAvailable ? "bg-success/10 text-success dark:bg-success/20" : undefined}
        >
          {isAvailable ? "Kosong" : "Terisi"}
        </Badge>
        <Button
          variant="outline"
          size="lg"
          disabled={pending}
          aria-label={`Tandai ${room.name} di ${kos.name} sebagai ${isAvailable ? "terisi" : "kosong"}`}
          onClick={() => onToggle(kos, room)}
        >
          {isAvailable ? "Tandai terisi" : "Tandai kosong"}
        </Button>
      </div>
    </li>
  );
}

/**
 * Owner dashboard body: role gate, then loading / error / empty / list states.
 * Data and room updates go through `lib/api/owner.ts` only.
 */
export function OwnerDashboard() {
  const { user } = useAuth();
  const ownerId = user?.role === "owner" ? user.id : null;
  const kosQuery = useOwnerKos(ownerId);
  const updateRoom = useUpdateRoomStatus();

  if (!user) {
    return <OwnerSignInPrompt redirectTo="/dashboard" />;
  }

  if (user.role !== "owner") {
    return <OwnerOnlyNotice />;
  }

  if (kosQuery.isPending) {
    return <DashboardSkeleton />;
  }

  if (kosQuery.isError) {
    return (
      <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
        <p className="font-semibold">Gagal memuat listing</p>
        <p className="mt-1 text-sm text-muted-foreground">Koneksi lagi ngadat. Coba ulang, ya.</p>
        <Button className="mt-4" variant="outline" onClick={() => void kosQuery.refetch()}>
          Coba lagi
        </Button>
      </div>
    );
  }

  const listings = kosQuery.data ?? [];
  const totalRooms = listings.reduce((sum, kos) => sum + kos.rooms.length, 0);
  const availableRooms = listings.reduce(
    (sum, kos) => sum + kos.rooms.filter((room) => room.status === "kosong").length,
    0,
  );

  const handleToggle = (kos: Kos, room: Room) => {
    updateRoom.mutate({
      kosId: kos.id,
      roomId: room.id,
      status: room.status === "kosong" ? "terisi" : "kosong",
    });
  };

  return (
    <>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Kos terdaftar" value={listings.length} />
        <Stat label="Total kamar" value={totalRooms} />
        <Stat label="Kamar kosong" value={availableRooms} />
      </div>

      <p aria-live="polite" className="sr-only">
        {updateRoom.isPending
          ? "Menyimpan status kamar…"
          : updateRoom.isSuccess
            ? "Status kamar tersimpan."
            : ""}
      </p>

      {updateRoom.isError ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          Gagal memperbarui status kamar. Coba lagi ya.
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-lg font-semibold">Listing lu</h2>
        <Button size="lg" render={<Link href="/dashboard/kos/baru" />}>
          <Plus aria-hidden="true" />
          Tambah kos
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed p-8 text-center">
          <p className="font-heading font-semibold">Belum ada kos terdaftar</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Akun pemilik ini belum punya listing. Tambah kos pertama lu biar muncul di pencarian.
          </p>
          <Button className="mt-5" size="lg" render={<Link href="/dashboard/kos/baru" />}>
            <Plus aria-hidden="true" />
            Tambah kos
          </Button>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {listings.map((kos) => (
            <li key={kos.id}>
              <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <CardTitle className="font-heading text-lg">{kos.name}</CardTitle>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin aria-hidden="true" className="size-3.5" />
                        {kos.district}, {kos.city}
                      </span>
                      <span>
                        {formatIDR(kos.monthlyPriceMin)}–{formatIDR(kos.monthlyPriceMax)}/bulan
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      render={<Link href={`/dashboard/kos/${kos.slug}/edit`} />}
                    >
                      Edit
                    </Button>
                    <Button variant="outline" render={<Link href={`/kos/${kos.slug}`} />}>
                      Lihat halaman
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="text-sm font-semibold">Status kamar</h3>
                  <ul className="mt-2 flex flex-col gap-2">
                    {kos.rooms.map((room) => (
                      <RoomRow
                        key={room.id}
                        kos={kos}
                        room={room}
                        pending={
                          updateRoom.isPending &&
                          updateRoom.variables?.kosId === kos.id &&
                          updateRoom.variables?.roomId === room.id
                        }
                        onToggle={handleToggle}
                      />
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
