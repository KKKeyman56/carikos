import Link from "next/link";
import { MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIDR } from "@/lib/format";
import type { Kos, KosGender } from "@/types";

const GENDER_BADGE: Record<KosGender, { label: string; className: string }> = {
  putra: {
    label: "Putra",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  putri: {
    label: "Putri",
    className: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  },
  campur: {
    label: "Campur",
    className: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
};

function GenderBadge({ gender }: { gender: KosGender }) {
  const config = GENDER_BADGE[gender];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

interface KosCardProps {
  kos: Kos;
}

/** Compact kos preview used in the search results grid. */
export function KosCard({ kos }: KosCardProps) {
  const availableRooms = kos.rooms.filter((room) => room.status === "kosong").length;
  const visibleFacilities = kos.facilities.slice(0, 3);
  const extraFacilities = kos.facilities.length - visibleFacilities.length;

  return (
    <Link
      href={`/kos/${kos.slug}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      aria-label={`${kos.name}, ${kos.gender === "campur" ? "kos campur" : `kos ${kos.gender}`}, mulai ${formatIDR(kos.monthlyPriceMin)} per bulan di ${kos.district}`}
    >
      <Card className="h-full overflow-hidden py-0 transition-shadow group-hover:shadow-md">
        {/* NOTE: mock photos use an external placeholder service; swap to
            next/image with configured domains when the real API lands. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={kos.photoUrls[0]}
          alt={`Foto kos ${kos.name}`}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover"
        />
        <CardContent className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-heading font-medium group-hover:underline">
              {kos.name}
            </h3>
            <GenderBadge gender={kos.gender} />
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
            {kos.district}, {kos.city} · {kos.distanceToCampusKm} km ke kampus
          </p>
          <ul className="flex flex-wrap gap-1" aria-label="Fasilitas kos">
            {visibleFacilities.map((facility) => (
              <li key={facility.id}>
                <Badge variant="secondary">{facility.name}</Badge>
              </li>
            ))}
            {extraFacilities > 0 ? (
              <li>
                <Badge variant="outline">+{extraFacilities}</Badge>
              </li>
            ) : null}
          </ul>
          <p className="mt-auto text-base font-bold text-primary">
            {formatIDR(kos.monthlyPriceMin)}
            <span className="text-xs font-normal text-muted-foreground"> /bulan</span>
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star aria-hidden="true" className="size-3.5 fill-amber-400 text-amber-400" />
              {kos.ratingAvg.toFixed(1)}
            </span>
            <span className={availableRooms > 0 ? "font-medium text-success" : undefined}>
              {availableRooms > 0 ? `${availableRooms} kamar kosong` : "Kamar penuh"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/** Placeholder card with the same layout, used while data is loading. */
export function KosCardSkeleton() {
  return (
    <Card className="overflow-hidden py-0" aria-hidden="true">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-28" />
      </CardContent>
    </Card>
  );
}
