"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect, useRef } from "react";

import type { Kos } from "@/types";

/** Brand-colored pin built as a divIcon so no external marker images load. */
const PIN_ICON = L.divIcon({
  className: "",
  html: `<div style="filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.3));"><svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M14 0C6.27 0 0 6.27 0 14c0 9.94 12.53 24.09 13.06 24.68a1.25 1.25 0 0 0 1.88 0C15.47 38.09 28 23.94 28 14 28 6.27 21.73 0 14 0Z" fill="#B4552F"/><circle cx="14" cy="14" r="5" fill="#FAF5EC"/></svg></div>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -40],
});

interface KosLocationMapProps {
  kos: Kos;
}

/**
 * Interactive location map for one kos. Rendered client-side only via the
 * dynamic import in `kos-detail.tsx` (Leaflet needs `window`).
 *
 * NOTE: Leaflet is driven directly here instead of through `react-leaflet`.
 * Its `MapContainer` calls `map.remove()` during StrictMode's simulated
 * unmount (default in App Router) but never re-creates the map, which crashes
 * the tile layer with "Map container is being reused by another instance".
 * A plain effect owns the map lifecycle, so mount → cleanup → remount works.
 */
export function KosLocationMap({ kos }: KosLocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) return;

    const map = L.map(container, {
      center: [kos.latitude, kos.longitude],
      zoom: 15,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const popup = document.createElement("p");
    popup.textContent = kos.name;

    L.marker([kos.latitude, kos.longitude], { icon: PIN_ICON }).addTo(map).bindPopup(popup);

    return () => {
      map.remove();
    };
  }, [kos.latitude, kos.longitude, kos.name]);

  return (
    // `isolate` keeps Leaflet's high internal z-indexes from covering the navbar.
    <div className="relative isolate h-64 w-full overflow-hidden rounded-xl border">
      <div ref={containerRef} aria-hidden="true" className="size-full" />

      {/* Map is decorative here; screen readers use the adjacent address text. */}
      <p className="sr-only">
        {kos.name} berlokasi di {kos.address}, {kos.district}, {kos.city}.
      </p>
    </div>
  );
}
