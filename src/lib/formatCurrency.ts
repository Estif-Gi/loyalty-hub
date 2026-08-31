/**
 * Formats a numeric amount with the specified currency.
 * Defaults to "ETB" (Ethiopian Birr).
 */
export function formatCurrency(amount: number, currency: string = "ETB"): string {
  const cleanCurrency = currency || "ETB";
  const num = typeof amount === "number" ? amount : 0;
  try {
    return `${cleanCurrency} ${num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } catch (e) {
    return `${cleanCurrency} ${num.toFixed(2)}`;
  }
}
