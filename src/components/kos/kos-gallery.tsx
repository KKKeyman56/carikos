"use client";

import { useState } from "react";

import { cn } from "cn";
import type { Kos } from "@/types";

interface KosGalleryProps {
  kos: Kos;
}

/**
 * Photo gallery: one large active image plus thumbnail buttons. Photos are
 * mock placeholders for now; swap to next/image when the real API lands.
 */
export function KosGallery({ kos }: KosGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePhoto = kos.photoUrls[activeIndex];

  return (
    <section aria-label="Galeri foto kos">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={activePhoto}
        alt={`Foto ${activeIndex + 1} kos ${kos.name}`}
        className="aspect-[16/9] w-full rounded-xl object-cover"
      />
      <ul
        aria-label="Pilih foto untuk ditampilkan"
        className="mt-3 flex gap-2 overflow-x-auto pb-1"
      >
        {kos.photoUrls.map((photo, index) => (
          <li key={photo}>
            <button
              type="button"
              aria-pressed={index === activeIndex}
              aria-label={`Lihat foto ${index + 1} dari ${kos.photoUrls.length}`}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "block size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                index === activeIndex ? "border-primary" : "border-transparent hover:border-border",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" className="size-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
