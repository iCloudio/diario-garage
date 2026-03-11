export function formatCurrency(
  value: number,
  currency: string,
  options?: { maximumFractionDigits?: number; minimumFractionDigits?: number },
) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    minimumFractionDigits: options?.minimumFractionDigits,
  }).format(value);
}

export function getCurrencySymbol(currency: string) {
  const parts = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).formatToParts(1);

  return parts.find((part) => part.type === "currency")?.value ?? currency;
}
