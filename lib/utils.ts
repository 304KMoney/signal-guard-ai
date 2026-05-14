import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPrice(value: number): string {
  if (value >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getPnLColor(pnl: number | null | undefined): string {
  if (pnl === null || pnl === undefined) return "text-gray-400";
  return pnl >= 0 ? "text-green-400" : "text-red-400";
}

export function getScoreBadge(score: number): {
  color: string;
  label: string;
} {
  if (score >= 90) return { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "A+" };
  if (score >= 85) return { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "A" };
  if (score >= 80) return { color: "bg-orange-500/20 text-orange-400 border-orange-500/30", label: "B+" };
  if (score >= 70) return { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "B" };
  return { color: "bg-gray-500/20 text-gray-400 border-gray-500/30", label: "C" };
}
