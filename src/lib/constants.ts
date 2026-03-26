import type { ApartmentSource, ApartmentStatus } from "./types";

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
  order: number;
}

export interface SourceConfig {
  label: string;
  bgClass: string;
  textClass: string;
}

export const STATUS_CONFIG: Record<ApartmentStatus, StatusConfig> = {
  NEW: {
    label: "חדש",
    color: "text-status-new",
    bgColor: "bg-blue-50",
    dotColor: "#3b82f6",
    order: 0,
  },
  CONTACTED: {
    label: "יצרתי קשר",
    color: "text-status-contacted",
    bgColor: "bg-yellow-50",
    dotColor: "#eab308",
    order: 1,
  },
  RESPONDED: {
    label: "קיבלתי תשובה",
    color: "text-status-responded",
    bgColor: "bg-orange-50",
    dotColor: "#f97316",
    order: 2,
  },
  VIEWING_SCHEDULED: {
    label: "נקבע ביקור",
    color: "text-status-viewing",
    bgColor: "bg-purple-50",
    dotColor: "#a855f7",
    order: 3,
  },
  VIEWED: {
    label: "ראינו",
    color: "text-status-viewed",
    bgColor: "bg-cyan-50",
    dotColor: "#06b6d4",
    order: 4,
  },
  INTERESTED: {
    label: "מעוניינים",
    color: "text-status-interested",
    bgColor: "bg-green-50",
    dotColor: "#22c55e",
    order: 5,
  },
  REJECTED: {
    label: "לא מתאים",
    color: "text-status-rejected",
    bgColor: "bg-red-50",
    dotColor: "#ef4444",
    order: 6,
  },
  RENTED: {
    label: "הושכר",
    color: "text-status-rented",
    bgColor: "bg-gray-50",
    dotColor: "#9ca3af",
    order: 7,
  },
};

export const SOURCE_CONFIG: Record<ApartmentSource, SourceConfig> = {
  YAD2: {
    label: "יד2",
    bgClass: "bg-[#fff3e0]",
    textClass: "text-[#e65100]",
  },
  FACEBOOK: {
    label: "פייסבוק",
    bgClass: "bg-[#e3f2fd]",
    textClass: "text-[#1565c0]",
  },
  OTHER: {
    label: "אחר",
    bgClass: "bg-gray-100",
    textClass: "text-gray-600",
  },
};

export const STATUS_PIPELINE: ApartmentStatus[] = [
  "NEW",
  "CONTACTED",
  "RESPONDED",
  "VIEWING_SCHEDULED",
  "VIEWED",
  "INTERESTED",
  "REJECTED",
  "RENTED",
];
