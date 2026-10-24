/** Formats an IDR amount without decimals, e.g. 750000 -> "Rp 750.000". */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    trailingZeroDisplay: "stripIfInteger",
  }).format(amount);
}
