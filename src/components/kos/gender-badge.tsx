import { Badge } from "@/components/ui/badge";
import type { KosGender } from "@/types";

const GENDER_BADGE: Record<KosGender, { label: string; className: string }> = {
  // Bohemian palette: sage for putra, dusty rose for putri, mustard for campur.
  putra: {
    label: "Putra",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  putri: {
    label: "Putri",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  },
  campur: {
    label: "Campur",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
};

/** Colored gender tag shared by the kos card and the detail page. */
export function GenderBadge({ gender }: { gender: KosGender }) {
  const config = GENDER_BADGE[gender];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
