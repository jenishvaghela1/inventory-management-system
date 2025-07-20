import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number = 0,
  currencyCode = "DZD",
): string {
  return `${amount.toFixed(2)} ${currencyCode}`;
}

export function formatCurrencyWithSymbol(
  amount: number = 0,
  currencyCode = "DZD",
  symbol = "دج",
): string {
  if (currencyCode === "USD") {
    return `$${amount.toFixed(2)}`;
  } else if (currencyCode === "EUR") {
    return `€${amount.toFixed(2)}`;
  } else {
    return `${amount.toFixed(2)} ${currencyCode} ${symbol}`;
  }
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString();
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

export function getStockStatus(quantity: number): "good" | "low" | "out" {
  if (quantity === 0) return "out";
  if (quantity <= 5) return "low";
  return "good";
}

export function getStockStatusColor(status: "good" | "low" | "out"): string {
  switch (status) {
    case "out":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "low":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    case "good":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
  }
}
