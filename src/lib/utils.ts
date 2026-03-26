import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ApartmentSource } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function detectSource(url: string): ApartmentSource | null {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes("yad2.co.il")) return "YAD2";
  if (lower.includes("facebook.com") || lower.includes("fb.com")) return "FACEBOOK";
  return null;
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "";
  return `₪${price.toLocaleString("he-IL")}`;
}

export function formatPhone(phone: string): string {
  if (!phone) return "";
  // Normalize: remove spaces, dashes
  const clean = phone.replace(/[\s-]/g, "");
  // Format as 054-1234567
  if (clean.length === 10 && clean.startsWith("0")) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return phone;
}

export function getWhatsAppUrl(phone: string): string {
  if (!phone) return "#";
  const clean = phone.replace(/[\s-]/g, "");
  // Convert 05x to 9725x
  if (clean.startsWith("0")) {
    return `https://wa.me/972${clean.slice(1)}`;
  }
  // Already international
  if (clean.startsWith("+")) {
    return `https://wa.me/${clean.slice(1)}`;
  }
  return `https://wa.me/${clean}`;
}

export function getCallUrl(phone: string): string {
  if (!phone) return "#";
  return `tel:${phone.replace(/[\s]/g, "")}`;
}

// React 19 types omit `value` from form element interfaces.
// This helper safely extracts the value from an input event.
export function getEventValue(
  e: { target: EventTarget | null } | { currentTarget: EventTarget | null }
): string {
  const el = ("currentTarget" in e ? e.currentTarget : e.target) as unknown as {
    value?: string;
  };
  return el?.value ?? "";
}
