"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { formatIDR } from "@/lib/format";
import type { Kos } from "@/types";

/** Compact price label used inside the map marker, e.g. 750000 -> "Rp 750rb". */
function compactPrice(amount: number): string {
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1).replace(".0", "")}jt`;
  }
  return `Rp ${Math.round(amount / 1000)}rb`;
}

/** Brand-colored price pill built as a divIcon so no marker images are needed. */
function priceIcon(kos: Kos): L.DivIcon {
  const label = compactPrice(kos.monthlyPriceMin);
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:64px;height:28px;border-radius:9999px;background:#B4552F;color:#FAF5EC;font:600 11px/1 system-ui,sans-serif;box-shadow:0 2px 6px rgb(0 0 0 / 0.25);border:1px solid rgb(255 255 255 / 0.4);white-space:nowrap;">${label}</div>`,
    iconSize: [64, 28],
    iconAnchor: [32, 28],
    popupAnchor: [0, -28],
  });
}

/** Builds the popup with DOM nodes so listing text is never injected as HTML. */
function createPopupContent(kos: Kos, onOpen: () => void): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.minWidth = "180px";
  wrapper.style.maxWidth = "230px";

  const title = document.createElement("a");
  title.href = `/kos/${kos.slug}`;
  title.textContent = kos.name;
  title.style.cssText = "font-weight:600;color:#B4552F;text-decoration:none;line-height:1.3;";
  title.addEventListener("click", (event) => {
    // Keep modified clicks (new tab/window) native.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    onOpen();
  });
  wrapper.appendChild(title);

  const location = document.createElement("p");
  location.textContent = `${kos.district}, ${kos.city} · ${kos.distanceToCampusKm} km ke kampus`;
  location.style.cssText = "margin:4px 0 0;font-size:12px;color:#6b7280;line-height:1.4;";
  wrapper.appendChild(location);

  const price = document.createElement("p");
  price.textContent = `${formatIDR(kos.monthlyPriceMin)}/bulan`;
  price.style.cssText = "margin:6px 0 0;font-size:13px;font-weight:600;";
  wrapper.appendChild(price);

  const availableRooms = kos.rooms.filter((room) => room.status === "kosong").length;
  const availability = document.createElement("p");
  availability.textContent = availableRooms > 0 ? `${availableRooms} kamar kosong` : "Kamar penuh";
  availability.style.cssText = "margin:4px 0 0;font-size:12px;color:#6b7280;";
  wrapper.appendChild(availability);

  if (kos.ratingAvg > 0) {
    const rating = document.createElement("p");
    rating.textContent = `★ ${kos.ratingAvg.toFixed(1)} (${kos.reviewCount} rating)`;
    rating.style.cssText = "margin:4px 0 0;font-size:12px;color:#6b7280;";
    wrapper.appendChild(rating);
  }

  return wrapper;
}

interface KosResultsMapProps {
  kosList: Kos[];
}

/**
 * Map of the current search results. Rendered client-side only because Leaflet
 * needs `window`; the parent loads it with `dynamic(..., { ssr: false })`.
 *
 * Leaflet is driven directly (no react-leaflet) for the same StrictMode-safe
 * lifecycle reason as `kos-location-map.tsx`: the effect owns the map and
 * cleans it up with `map.remove()`.
 */
export function KosResultsMap({ kosList }: KosResultsMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) return;

    const map = L.map(container, {
      center: [-6.36, 106.83],
      zoom: 13,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const markers = kosList.map((kos) =>
      L.marker([kos.latitude, kos.longitude], {
        icon: priceIcon(kos),
        title: `${kos.name} - ${formatIDR(kos.monthlyPriceMin)} per bulan`,
        alt: `${kos.name}, ${formatIDR(kos.monthlyPriceMin)} per bulan`,
      })
        .addTo(map)
        .bindPopup(
          createPopupContent(kos, () => router.push(`/kos/${kos.slug}`)),
          {
            maxWidth: 260,
          },
        ),
    );

    if (markers.length > 0) {
      const bounds = L.latLngBounds(kosList.map((kos) => [kos.latitude, kos.longitude]));
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
    }

    return () => {
      map.remove();
    };
  }, [kosList, router]);

  return (
    <div
      role="region"
      aria-label="Peta hasil pencarian"
      className="relative isolate h-[420px] w-full overflow-hidden rounded-xl border sm:h-[520px]"
    >
      <div ref={containerRef} className="size-full" />
      <p className="sr-only">
        Peta menampilkan {kosList.length} kos. Pilih marker untuk lihat ringkasan, atau pakai tombol
        Lihat daftar.
      </p>
    </div>
  );
}
