/**
 * Currency formatting utilities for INR (Indian Rupees)
 */

/**
 * Formats a number as Indian Rupees with proper formatting
 * @param amount - The amount to format
 * @param options - Intl.NumberFormatOptions for custom formatting
 * @returns Formatted currency string (e.g., "₹1,234.56")
 */
export function formatCurrency(
  amount: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    ...options,
  }).format(amount);
}

/**
 * Formats a number as INR without the currency symbol
 * Just returns the formatted number with commas
 * @param amount - The amount to format
 * @param options - Options for decimal places
 * @returns Formatted number string (e.g., "1,234.56")
 */
export function formatAmount(
  amount: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });
}

/**
 * Currency symbol constant
 */
export const CURRENCY_SYMBOL = "₹";

